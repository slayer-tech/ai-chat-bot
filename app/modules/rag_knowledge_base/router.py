"""Knowledge base upload routes."""

from io import BytesIO
from typing import Any

from fastapi import APIRouter, Depends, File, UploadFile
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
    # Chunking by ~1500 chars with 200 char overlap
    chunk_size = 1500
    overlap = 200
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        if end >= len(text):
            break
        start = end - overlap

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
