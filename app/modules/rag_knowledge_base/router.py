"""Knowledge base upload routes."""

from io import BytesIO
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_tenant_id, require_role
from app.db.models import KnowledgeBaseDoc
from app.db.session import get_db
from app.modules.rag_knowledge_base.service import add_chunks, add_document

router = APIRouter(prefix="/api/v1/admin", tags=["knowledge_base"])

MAX_KB_DOCS = 10
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def _extract_text(filename: str, content: bytes) -> str:
    """Extract text from PDF, TXT, or DOCX."""
    ext = filename.split(".")[-1].lower()
    if ext == "txt":
        return content.decode("utf-8", errors="ignore")
    if ext == "pdf":
        from PyPDF2 import PdfReader
        reader = PdfReader(BytesIO(content))
        parts = []
        for page in reader.pages:
            try:
                parts.append(page.extract_text() or "")
            except Exception:
                pass
        return "\n".join(parts)
    if ext == "docx":
        from docx import Document
        doc = Document(BytesIO(content))
        return "\n".join(p.text for p in doc.paragraphs if p.text)
    raise ValueError(f"Unsupported file type: .{ext}")


def _smart_chunk(text: str, max_chunk_size: int = 1200, overlap: int = 150) -> list[str]:
    """Split text into logical chunks preserving FAQ questions and sections.

    Strategy:
    1. Split by FAQ markers (❓, Вопрос:, Q:)
    2. Split by double newlines
    3. Merge small adjacent blocks
    4. Split oversized blocks by sentences
    """
    import re

    # Normalize whitespace
    text = re.sub(r'\n{3,}', '\n\n', text.strip())

    # Try FAQ-first splitting: each ❓ question + answer becomes its own block
    if '❓' in text or 'Вопрос:' in text or '\nQ:' in text:
        # Split by question markers, keeping the marker with the block
        parts = re.split(r'(?=\n?\s*❓|\nВопрос:|\nQ:)', text)
        blocks = [p.strip() for p in parts if p.strip()]
    else:
        # Split by double newlines (paragraphs / sections)
        blocks = [p.strip() for p in text.split('\n\n') if p.strip()]

    # Merge small blocks with neighbors until we hit max_chunk_size
    merged: list[str] = []
    current = ""
    for block in blocks:
        if not current:
            current = block
        elif len(current) + len(block) + 2 <= max_chunk_size:
            current += "\n\n" + block
        else:
            merged.append(current)
            current = block
    if current:
        merged.append(current)

    # Split oversized blocks by sentences
    final_chunks: list[str] = []
    for chunk in merged:
        if len(chunk) <= max_chunk_size:
            final_chunks.append(chunk)
            continue
        # Split by sentence endings
        sentences = re.split(r'(?<=[.!?])\s+', chunk)
        current = ""
        for sent in sentences:
            if len(current) + len(sent) + 1 <= max_chunk_size:
                current += (" " if current else "") + sent
            else:
                if current:
                    final_chunks.append(current.strip())
                current = sent
        if current:
            final_chunks.append(current.strip())

    # Add overlap between adjacent chunks for continuity
    if len(final_chunks) > 1 and overlap > 0:
        result: list[str] = []
        for i, chunk in enumerate(final_chunks):
            if i > 0:
                prefix = final_chunks[i - 1][-overlap:]
                chunk = prefix + "\n" + chunk
            result.append(chunk.strip())
        return result
    return final_chunks


@router.post("/knowledge")
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> dict[str, Any]:
    """Upload a PDF/TXT/DOCX document."""
    allowed_ext = {".pdf", ".txt", ".docx"}
    ext = file.filename.split(".")[-1].lower()
    if f".{ext}" not in allowed_ext:
        return {"error": "Invalid file type"}
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        return {"error": "File too large (max 10MB)"}

    # Check document count limit
    doc_count = await db.scalar(
        select(func.count(KnowledgeBaseDoc.id)).where(KnowledgeBaseDoc.tenant_id == tenant_id)
    ) or 0
    if doc_count >= MAX_KB_DOCS:
        return {"error": f"Document limit reached (max {MAX_KB_DOCS} files). Delete old files first."}

    text = _extract_text(file.filename, content)
    if not text.strip():
        return {"error": "Could not extract text from file"}

    doc = await add_document(db, tenant_id, file.filename)
    # Smart chunking: split by logical blocks (FAQ questions, sections), then merge small ones
    chunks = _smart_chunk(text, max_chunk_size=1200, overlap=150)

    await add_chunks(db, tenant_id, doc.id, chunks)
    return {"doc_id": doc.id, "chunks": len(chunks)}


@router.get("/knowledge")
async def list_documents(
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> list[dict[str, Any]]:
    """List uploaded knowledge base documents."""
    result = await db.execute(
        select(KnowledgeBaseDoc).where(KnowledgeBaseDoc.tenant_id == tenant_id)
    )
    docs = result.scalars().all()
    return [
        {"id": d.id, "filename": d.filename, "status": d.status, "created_at": d.created_at.isoformat()}
        for d in docs
    ]


@router.get("/knowledge/search")
async def search_knowledge_debug(
    q: str,
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> dict[str, Any]:
    """Debug RAG search — returns raw chunks with scores."""
    from app.modules.rag_knowledge_base.service import search_knowledge_with_scores
    results = await search_knowledge_with_scores(db, tenant_id, q, top_k=5)
    return {
        "query": q,
        "chunks_found": len(results),
        "results": [
            {"content": r["content"][:300], "distance": r["distance"]} for r in results
        ],
    }


@router.delete("/knowledge/{doc_id}")
async def delete_document(
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> dict[str, str]:
    """Delete a knowledge base document and all its chunks."""
    from sqlalchemy import delete
    from app.db.models import KnowledgeBaseChunk, KnowledgeBaseDoc

    doc = await db.scalar(
        select(KnowledgeBaseDoc).where(
            KnowledgeBaseDoc.id == doc_id,
            KnowledgeBaseDoc.tenant_id == tenant_id,
        )
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    await db.execute(
        delete(KnowledgeBaseChunk).where(
            KnowledgeBaseChunk.doc_id == doc_id,
            KnowledgeBaseChunk.tenant_id == tenant_id,
        )
    )
    await db.delete(doc)
    await db.commit()
    return {"status": "deleted"}
