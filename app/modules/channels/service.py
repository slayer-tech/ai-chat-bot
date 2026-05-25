"""Channel processing via Wazzup."""

import structlog
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.wazzup_client import wazzup_client
from app.db.models import Dialog
from app.schemas.webhook import UnifiedMessage, WazzupMessage

logger = structlog.get_logger()


async def handle_inbound_message(
    db: AsyncSession,
    tenant_id: int,
    msg: WazzupMessage,
) -> dict[str, Any]:
    """Process a single Wazzup message."""
    # Ensure dialog exists
    dialog = await db.scalar(
        select(Dialog).where(
            Dialog.tenant_id == tenant_id,
            Dialog.channel == msg.chatType,
            Dialog.external_user_id == msg.chatId,
        )
    )
    if not dialog:
        dialog = Dialog(
            tenant_id=tenant_id,
            channel=msg.chatType,
            external_user_id=msg.chatId,
            phone=msg.contact.phone if msg.contact else None,
            name=msg.contact.name if msg.contact else None,
            last_message_at=datetime.now(timezone.utc),
        )
        db.add(dialog)
        await db.commit()
        await db.refresh(dialog)
    else:
        dialog.last_message_at = datetime.now(timezone.utc)
        await db.commit()

    dialog_id = dialog.id

    # Determine content
    text = msg.text or ""
    voice_url = None
    if msg.type == "audio" and msg.contentUri:
        voice_url = msg.contentUri

    # Transcribe voice if needed
    if voice_url:
        from app.modules.voice_processing.service import process_voice_if_needed
        transcribed = await process_voice_if_needed(voice_url)
        if transcribed:
            text = transcribed

    # Early exit if dialog is already handoff/flood
    if dialog.status in ("handoff", "flood"):
        return {"status": dialog.status, "dialog_id": dialog_id}

    # Fetch tenant settings for feature toggles
    from app.modules.tenants.service import get_tenant_settings
    tenant_settings = await get_tenant_settings(db, tenant_id)

    # Push to processing pipeline
    from app.modules.intent_classifier.service import classify_intent
    from app.modules.conversation_memory.service import add_message
    from app.modules.anti_spam_flood.service import check_flood
    from app.modules.smart_escalation.service import check_handoff_needed
    from app.modules.llm_router.service import generate_response
    from app.modules.billing.service import log_billing

    # Flood / anti-spam check
    if tenant_settings is None or tenant_settings.anti_spam_enabled:
        is_flood = await check_flood(db, tenant_id, msg.chatId, text)
        if is_flood:
            return {"status": "flood_detected", "dialog_id": dialog_id}

    # Intent
    intent, confidence = await classify_intent(text)

    # Add to memory
    await add_message(
        db,
        tenant_id=tenant_id,
        dialog_id=dialog_id,
        role="user",
        content_original=text,
        content_tokenized=None,
        intent=intent,
        confidence=confidence,
        has_voice=bool(voice_url),
        voice_url=voice_url,
    )

    # Handoff / escalation check
    if tenant_settings is None or tenant_settings.handoff_enabled:
        handoff_needed = await check_handoff_needed(db, tenant_id, msg.chatId, intent, text)
        if handoff_needed:
            return {"status": "handoff", "dialog_id": dialog_id}

    # Generate response
    response_text = await generate_response(db, tenant_id, msg.chatId, text)

    # Send outbound via Wazzup
    try:
        await send_outbound(tenant_id, msg.channelId, msg.chatId, response_text, msg.chatType)
    except Exception as exc:
        logger.error("wazzup_outbound_failed", error=str(exc), dialog_id=dialog_id)
        # Still return OK to Wazzup so it doesn't retry; log the failure internally

    # Billing
    await log_billing(db, tenant_id, "incoming", 1)
    await log_billing(db, tenant_id, "outgoing", 1)

    return {"status": "ok", "dialog_id": dialog_id}


async def send_outbound(
    tenant_id: int,
    channel_id: str,
    chat_id: str,
    text: str,
    chat_type: str = "whatsapp",
) -> dict[str, Any]:
    """Send outbound message via Wazzup."""
    logger = structlog.get_logger()

    if not wazzup_client.api_key:
        logger.info(
            "wazzup_outbound_skipped",
            tenant_id=tenant_id,
            channel_id=channel_id,
            chat_id=chat_id,
            text=text,
        )
        return {"status": "skipped", "text": text}

    return await wazzup_client.send_message(channel_id, chat_id, text, chat_type)
