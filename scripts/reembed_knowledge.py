"""Re-embed all knowledge base chunks after switching embedding model.

Run inside the app container:
    docker compose exec app python scripts/reembed_knowledge.py

This regenerates OpenAI embeddings for every chunk whose embedding is NULL
(or optionally for all chunks). Use after the 1536-dim migration.
"""

import asyncio
import os
from typing import Any

import structlog
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# Allow running without full app init
os.environ.setdefault("ENV", "production")

from app.clients.openai_client import openai_client
from app.core.config import settings
from app.db.models import KnowledgeBaseChunk, KnowledgeBaseDoc

logger = structlog.get_logger()
BATCH_SIZE = 64


engine = create_async_engine(settings.DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_pending_chunks(db: AsyncSession, all_chunks: bool = False) -> list[tuple[int, str]]:
    """Fetch chunks that need embeddings."""
    stmt = select(KnowledgeBaseChunk.id, KnowledgeBaseChunk.content)
    if not all_chunks:
        stmt = stmt.where(KnowledgeBaseChunk.embedding.is_(None))
    result = await db.execute(stmt)
    return list(result.all())


async def update_embeddings(db: AsyncSession, ids: list[int], embeddings: list[list[float]]) -> None:
    """Batch-update chunk embeddings."""
    # asyncpg does not support bulk UPDATE with different values easily;
    # use individual updates wrapped in one transaction.
    for chunk_id, vector in zip(ids, embeddings):
        await db.execute(
            update(KnowledgeBaseChunk)
            .where(KnowledgeBaseChunk.id == chunk_id)
            .values(embedding=vector)
        )
    await db.commit()


async def reembed(all_chunks: bool = False) -> dict[str, Any]:
    """Re-embed knowledge base chunks."""
    async with AsyncSessionLocal() as db:
        chunks = await get_pending_chunks(db, all_chunks=all_chunks)
        total = len(chunks)
        logger.info("reembed_start", total=total, all_chunks=all_chunks)

        if not total:
            return {"processed": 0, "batches": 0, "errors": 0}

        processed = 0
        errors = 0
        batches = 0

        for i in range(0, total, BATCH_SIZE):
            batch = chunks[i : i + BATCH_SIZE]
            ids = [c[0] for c in batch]
            texts = [c[1] for c in batch]
            batches += 1

            try:
                embeddings = await openai_client.embed(texts)
                if len(embeddings) != len(texts):
                    raise RuntimeError(
                        f"embedding count mismatch: {len(embeddings)} != {len(texts)}"
                    )
                async with AsyncSessionLocal() as db2:
                    await update_embeddings(db2, ids, embeddings)
                processed += len(batch)
                logger.info(
                    "reembed_batch_done",
                    batch=batches,
                    processed=processed,
                    total=total,
                )
            except Exception as exc:
                errors += len(batch)
                logger.error("reembed_batch_failed", batch=batches, error=str(exc))

        # Mark documents with any ready chunks as ready
        await db.execute(
            update(KnowledgeBaseDoc)
            .where(KnowledgeBaseDoc.status != "ready")
            .values(status="ready")
        )
        await db.commit()

        logger.info("reembed_done", processed=processed, total=total, errors=errors)
        return {"processed": processed, "batches": batches, "errors": errors}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Re-embed knowledge base chunks")
    parser.add_argument(
        "--all",
        action="store_true",
        dest="all_chunks",
        help="Re-embed all chunks, not only those with NULL embedding",
    )
    args = parser.parse_args()
    result = asyncio.run(reembed(all_chunks=args.all_chunks))
    print(result)
