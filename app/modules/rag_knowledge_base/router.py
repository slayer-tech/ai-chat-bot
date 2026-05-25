"""Knowledge base upload routes."""

from io import BytesIO
from typing import Any

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_tenant_id, require_role
from app.db.session import get_db
from app.modules.rag_knowledge_base.service import add_chunks, add_document

router = APIRouter(prefix="/api/v1/admin", tags=["knowledge_base"])


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
    if len(content) > 10 * 1024 * 1024:
        return {"error": "File too large (max 10MB)"}

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
