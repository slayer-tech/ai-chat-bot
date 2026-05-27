"""Webhook router for Wazzup."""

from typing import Any

import structlog
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.modules.channels.service import save_inbound_message
from app.modules.tenants.service import get_tenant_settings
from app.tasks.message_processor import schedule_delayed_processing

logger = structlog.get_logger()

router = APIRouter(prefix="/webhook", tags=["webhooks"])


@router.get("/wazzup/{tenant_id}")
async def wazzup_webhook_get(tenant_id: int) -> dict[str, Any]:
    """Wazzup sends GET request to verify webhook during registration."""
    logger.info("wazzup_webhook_get_verify", tenant_id=tenant_id)
    return {"status": "ok"}


@router.post("/wazzup/{tenant_id}")
async def wazzup_webhook(
    tenant_id: int,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Receive inbound messages from Wazzup for a specific tenant."""
    body = await request.body()

    # Parse raw JSON to avoid 422 on unexpected Wazzup payloads
    import json
    try:
        data = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    logger.info("wazzup_webhook_raw", tenant_id=tenant_id, body=data)

    # Respond to Wazzup test ping (sent during webhook registration)
    if data.get("test") is True:
        logger.info("wazzup_webhook_test_ping", tenant_id=tenant_id)
        return {"status": "ok"}

    messages = data.get("messages", [])
    if not isinstance(messages, list):
        return {"status": "ok", "processed": 0}

    # Load tenant settings for debounce configuration
    tenant_settings = await get_tenant_settings(db, tenant_id)
    debounce_seconds = tenant_settings.debounce_seconds if tenant_settings else 10

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
            # If voice message couldn't be transcribed, send a friendly fallback
            if msg.type == "audio" and not saved.get("text"):
                wazzup_key = tenant_settings.wazzup_api_key if tenant_settings else None
                if wazzup_key:
                    from app.clients.wazzup_client import wazzup_client
                    try:
                        await wazzup_client.send_message(
                            channel_id=channel_id,
                            chat_id=chat_id,
                            text="Извините, немного не понял что вы говорите, можете пожалуйста написать?",
                            chat_type=chat_type,
                            api_key=wazzup_key,
                        )
                    except Exception as exc:
                        logger.warning("voice_fallback_send_failed", error=str(exc))
                results.append({"status": "voice_unrecognized", "dialog_id": saved["dialog_id"]})
            else:
                await schedule_delayed_processing(
                    tenant_id=tenant_id,
                    dialog_id=saved["dialog_id"],
                    chat_id=saved["chat_id"],
                    chat_type=saved["chat_type"],
                    channel_id=saved["channel_id"],
                    debounce_seconds=debounce_seconds,
                )
                results.append({"status": "debounced", "dialog_id": saved["dialog_id"]})
        else:
            results.append(saved)

    return {"status": "ok", "processed": len(results)}
