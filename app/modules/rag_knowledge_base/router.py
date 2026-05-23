"""Knowledge base upload routes."""

from typing import Any

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_tenant_id, require_role
from app.db.session import get_db
from app.modules.rag_knowledge_base.service import add_chunks, add_document

router = APIRouter(prefix="/api/v1/admin", tags=["knowledge_base"])


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

    doc = await add_document(db, tenant_id, file.filename)
    # Simple text extraction (placeholder)
    text = content.decode("utf-8", errors="ignore")
    # Chunking by 500 words (placeholder)
    words = text.split()
    chunks = []
    for i in range(0, len(words), 450):
        chunk = " ".join(words[i : i + 500])
        chunks.append(chunk)
    await add_chunks(db, tenant_id, doc.id, chunks)
    return {"doc_id": doc.id, "chunks": len(chunks)}
