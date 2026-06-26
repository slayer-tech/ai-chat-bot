"""RAG knowledge base with OpenAI Embeddings (1536-dim) + pgvector."""

import hashlib
import json
from typing import Any, Optional

import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.openai_client import openai_client
from app.clients.redis_client import get_redis
from app.db.models import KnowledgeBaseChunk, KnowledgeBaseDoc

logger = structlog.get_logger()


async def search_knowledge(
    db: AsyncSession,
    tenant_id: int,
    query: str,
    top_k: int = 3,
) -> list[str]:
    """Search knowledge base chunks by semantic similarity using OpenAI Embeddings."""
    results = await search_knowledge_with_scores(db, tenant_id, query, top_k)
    return [r["content"] for r in results]


async def search_knowledge_with_scores(
    db: AsyncSession,
    tenant_id: int,
    query: str,
    top_k: int = 3,
) -> list[dict[str, Any]]:
    """Search knowledge base chunks with cosine distance scores.

    Returns:
        List of dicts: [{"content": str, "distance": float}, ...]
        distance is cosine distance (0 = identical, 1 = completely different)
    """
    query_hash = hashlib.md5(query.encode("utf-8")).hexdigest()
    cache_key = f"rag:{tenant_id}:{query_hash}"

    try:
        redis = await get_redis()
        cached = await redis.get(cache_key)
        if cached:
            logger.info("rag_cache_hit", tenant_id=tenant_id, query=query[:50])
            return json.loads(cached)
    except Exception as exc:
        logger.warning("rag_redis_cache_error", error=str(exc))

    try:
        embeddings = await openai_client.embed([query])
        vector = embeddings[0]
    except Exception as exc:
        logger.error("openai_query_embedding_failed", error=str(exc))
        return []

    # pgvector cosine_distance + content
    from sqlalchemy import func
    result = await db.execute(
        select(
            KnowledgeBaseChunk.content,
            KnowledgeBaseChunk.embedding.cosine_distance(vector).label("distance"),
        )
        .where(
            KnowledgeBaseChunk.tenant_id == tenant_id,
            KnowledgeBaseChunk.embedding.is_not(None),
        )
        .order_by(KnowledgeBaseChunk.embedding.cosine_distance(vector))
        .limit(top_k)
    )
    rows = result.all()
    results = [{"content": row.content, "distance": float(row.distance)} for row in rows]

    try:
        redis = await get_redis()
        await redis.setex(cache_key, 3600, json.dumps(results))
    except Exception as exc:
        logger.warning("rag_redis_cache_set_error", error=str(exc))

    return results


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
    """Create chunks and OpenAI embeddings for a document."""
    if not texts:
        return

    # Get document embeddings via OpenAI
    try:
        embeddings = await openai_client.embed(texts)
    except Exception as exc:
        logger.error("openai_doc_embedding_failed", error=str(exc), doc_id=doc_id)
        # Fallback: store chunks without embeddings
        embeddings = [None] * len(texts)

    for text, emb in zip(texts, embeddings):
        chunk = KnowledgeBaseChunk(
            tenant_id=tenant_id,
            doc_id=doc_id,
            content=text,
            embedding=emb,
        )
        db.add(chunk)
    await db.commit()

    # Update doc status
    doc = await db.scalar(select(KnowledgeBaseDoc).where(KnowledgeBaseDoc.id == doc_id))
    if doc:
        doc.status = "ready"
        await db.commit()
