"""Webhook router for Wazzup."""

from typing import Any

import structlog
from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.channels.service import save_inbound_message
from app.tasks.message_processor import schedule_delayed_processing

logger = structlog.get_logger()

router = APIRouter(prefix="/webhook", tags=["webhooks"])


@router.post("/wazzup")
async def wazzup_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Receive inbound messages from Wazzup."""
    body = await request.body()

    # Parse raw JSON to avoid 422 on unexpected Wazzup payloads
    import json
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    logger.info("wazzup_webhook_raw", body=data)

    messages = data.get("messages", [])
    if not isinstance(messages, list):
        return {"status": "ok", "processed": 0}

    tenant_id = 1  # Placeholder: lookup by Wazzup account mapping
    results = []

    for msg_data in messages:
        # Minimal required fields
        message_id = msg_data.get("messageId", "")
        channel_id = msg_data.get("channelId", "")
        chat_id = msg_data.get("chatId", "")
        chat_type = msg_data.get("chatType", "")
        text = msg_data.get("text", "")
        is_echo = msg_data.get("isEcho", False)
        msg_type = msg_data.get("type", "")

        logger.info(
            "wazzup_webhook_msg",
            message_id=message_id,
            channel_id=channel_id,
            chat_id=chat_id,
            chat_type=chat_type,
            text=text,
            is_echo=is_echo,
            msg_type=msg_type,
        )

        # Skip outgoing (echo) messages
        if is_echo:
            continue
        # Skip non-text and non-audio for now (images, docs, etc.)
        if msg_type not in ("text", "audio", "image", "video", "document"):
            continue

        # Build WazzupMessage from dict for service layer
        from app.schemas.webhook import WazzupMessage, WazzupContact
        contact_data = msg_data.get("contact") or {}
        contact = WazzupContact(**contact_data) if contact_data else None
        msg = WazzupMessage(
            messageId=message_id,
            channelId=channel_id,
            chatType=chat_type,
            chatId=chat_id,
            type=msg_type,
            isEcho=is_echo,
            text=text,
            contentUri=msg_data.get("contentUri"),
            contact=contact,
        )

        saved = await save_inbound_message(db, tenant_id, msg)
        if saved.get("status") == "saved":
            await schedule_delayed_processing(
                tenant_id=tenant_id,
                dialog_id=saved["dialog_id"],
                chat_id=saved["chat_id"],
                chat_type=saved["chat_type"],
                channel_id=saved["channel_id"],
            )
            results.append({"status": "debounced", "dialog_id": saved["dialog_id"]})
        else:
            results.append(saved)

    return {"status": "ok", "processed": len(results)}
