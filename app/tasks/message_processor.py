"""Delayed message processing with debounce."""

import asyncio
import uuid

from celery import shared_task
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.clients.redis_client import get_redis
from app.core.config import settings
from app.modules.channels.service import process_dialog_response


async def _process_delayed_message_async(
    tenant_id: int,
    dialog_id: int,
    chat_id: str,
    chat_type: str,
    channel_id: str,
    task_id: str,
) -> dict:
    """Async implementation of delayed message processing."""
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
    )
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )

    redis = await get_redis()
    redis_key = f"pending_task:{tenant_id}:{chat_id}"
    current_task = await redis.get(redis_key)

    if current_task != task_id:
        await engine.dispose()
        return {"status": "superseded", "reason": "newer_message_arrived"}

    async with AsyncSessionLocal() as db:
        result = await process_dialog_response(
            db,
            tenant_id=tenant_id,
            dialog_id=dialog_id,
            chat_id=chat_id,
            chat_type=chat_type,
            channel_id=channel_id,
        )

    await redis.delete(redis_key)
    await engine.dispose()
    return result


@shared_task
def process_delayed_message(
    tenant_id: int,
    dialog_id: int,
    chat_id: str,
    chat_type: str,
    channel_id: str,
    task_id: str,
) -> dict:
    """Process dialog response after debounce delay.

    Only runs if no newer message arrived for this dialog within the debounce window.
    """
    return asyncio.run(
        _process_delayed_message_async(
            tenant_id, dialog_id, chat_id, chat_type, channel_id, task_id
        )
    )


async def schedule_delayed_processing(
    tenant_id: int,
    dialog_id: int,
    chat_id: str,
    chat_type: str,
    channel_id: str,
    debounce_seconds: int = 10,
) -> str:
    """Schedule a delayed processing task and store its ID in Redis.

    Revokes any previous pending task for this chat so that only the latest
    message batch is processed after the debounce window.

    Returns the task ID.
    """
    task_id = str(uuid.uuid4())
    redis = await get_redis()
    redis_key = f"pending_task:{tenant_id}:{chat_id}"

    # Revoke previous Celery task if one exists
    old_task_id = await redis.get(redis_key)
    if old_task_id:
        process_delayed_message.app.control.revoke(
            old_task_id.decode(), terminate=False
        )

    await redis.setex(redis_key, debounce_seconds + 5, task_id)

    process_delayed_message.apply_async(
        args=[tenant_id, dialog_id, chat_id, chat_type, channel_id, task_id],
        countdown=debounce_seconds,
        task_id=task_id,
    )
    return task_id
