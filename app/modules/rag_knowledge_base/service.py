"""RAG knowledge base with pgvector."""

from typing import Optional

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


from app.db.models import KnowledgeBaseChunk, KnowledgeBaseDoc

logger = structlog.get_logger()


async def search_knowledge(
    db: AsyncSession,
    tenant_id: int,
    query: str,
    top_k: int = 3,
) -> list[str]:
    """Search knowledge base chunks by text match.

    Args:
        db: Database session.
        tenant_id: Tenant filter.
        query: Query text (tokenized okay).
        top_k: Number of chunks to return.

    Returns:
        List of chunk contents.
    """
    from sqlalchemy import func
    result = await db.execute(
        select(KnowledgeBaseChunk)
        .where(
            KnowledgeBaseChunk.tenant_id == tenant_id,
            func.lower(KnowledgeBaseChunk.content).contains(func.lower(query)),
        )
        .limit(top_k)
    )
    chunks = result.scalars().all()
    return [c.content for c in chunks]


async def add_document(
    db: AsyncSession,
    tenant_id: int,
    filename: str,
    source_url: Optional[str] = None,
) -> KnowledgeBaseDoc:
    """Register a new knowledge base document."""
    doc = KnowledgeBaseDoc(
        tenant_id=tenant_id,
        filename=filename,
        source_url=source_url,
        status="pending",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return doc


async def add_chunks(
    db: AsyncSession,
    tenant_id: int,
    doc_id: int,
    texts: list[str],
) -> None:
    """Create chunks for a document (text search only, no embeddings)."""
    if not texts:
        return
    for text in texts:
        chunk = KnowledgeBaseChunk(
            tenant_id=tenant_id,
            doc_id=doc_id,
            content=text,
            embedding=None,
        )
        db.add(chunk)
    await db.commit()
    # Update doc status
    doc = await db.scalar(select(KnowledgeBaseDoc).where(KnowledgeBaseDoc.id == doc_id))
    if doc:
        doc.status = "ready"
        await db.commit()
