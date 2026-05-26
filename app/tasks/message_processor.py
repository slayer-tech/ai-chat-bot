"""Delayed message processing with debounce."""

import uuid

from celery import shared_task

from app.clients.redis_client import get_redis
from app.db.session import AsyncSessionLocal
from app.modules.channels.service import process_dialog_response


@shared_task
async def process_delayed_message(
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
    redis = await get_redis()
    redis_key = f"pending_task:{tenant_id}:{chat_id}"
    current_task = await redis.get(redis_key)

    if current_task != task_id:
        # A newer message arrived; abort this task
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

    # Clean up redis key after processing
    await redis.delete(redis_key)
    return result


async def schedule_delayed_processing(
    tenant_id: int,
    dialog_id: int,
    chat_id: str,
    chat_type: str,
    channel_id: str,
    debounce_seconds: int = 10,
) -> str:
    """Schedule a delayed processing task and store its ID in Redis.

    Returns the task ID.
    """
    task_id = str(uuid.uuid4())
    redis = await get_redis()
    redis_key = f"pending_task:{tenant_id}:{chat_id}"
    await redis.setex(redis_key, debounce_seconds + 5, task_id)

    process_delayed_message.apply_async(
        args=[tenant_id, dialog_id, chat_id, chat_type, channel_id, task_id],
        countdown=debounce_seconds,
    )
    return task_id
