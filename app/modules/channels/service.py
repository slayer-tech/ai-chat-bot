"""Channel processing via Wazzup."""

import structlog
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.wazzup_client import wazzup_client
from app.db.models import Dialog, Message
from app.schemas.webhook import UnifiedMessage, WazzupMessage

logger = structlog.get_logger()

# Delay in seconds before processing a batch of messages
MESSAGE_DEBOUNCE_SECONDS = 10


async def ensure_dialog(
    db: AsyncSession,
    tenant_id: int,
    msg: WazzupMessage,
) -> Dialog:
    """Get or create dialog for the user."""
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
        # Schedule new-lead follow-up for fresh dialogs
        from app.modules.trigger_engine.service import schedule_trigger
        from app.modules.tenants.service import get_tenant_settings
        tenant_settings = await get_tenant_settings(db, tenant_id)
        await schedule_trigger(
            db,
            tenant_id=tenant_id,
            dialog_id=dialog.id,
            trigger_type="new_lead_30min",
            scenarios=tenant_settings.followup_scenarios if tenant_settings else None,
        )
    else:
        dialog.last_message_at = datetime.now(timezone.utc)
        await db.commit()
    return dialog


async def _sync_cross_channel_context(
    db: AsyncSession,
    tenant_id: int,
    dialog: Dialog,
    msg: WazzupMessage,
) -> bool:
    """Sync context from other channels by phone number.

    Looks for dialogs with the same phone in different channels.
    If found and old dialog is active — copies summary and context.
    If old dialog is closed/handoff/flood — marks new dialog as handoff.

    Returns:
        True if dialog was marked as handoff (should not process further).
    """
    phone = msg.contact.phone if msg.contact else None
    if not phone:
        return False

    # Find dialogs with same phone in OTHER channels
    result = await db.execute(
        select(Dialog)
        .where(
            Dialog.tenant_id == tenant_id,
            Dialog.phone == phone,
            Dialog.channel != msg.chatType,
        )
        .order_by(desc(Dialog.last_message_at))
    )
    other_dialogs = result.scalars().all()
    if not other_dialogs:
        return False

    old_dialog = other_dialogs[0]  # Most recent

    # If old dialog is finished — mark new as handoff immediately
    if old_dialog.status in ("handoff", "flood", "closed"):
        dialog.status = "handoff"
        await db.commit()
        logger.info(
            "cross_channel_handoff",
            old_channel=old_dialog.channel,
            new_channel=dialog.channel,
            phone=phone,
            reason=f"old_dialog_{old_dialog.status}",
        )
        return True

    # If old dialog is active — copy summary and recent messages as context
    if old_dialog.summary:
        dialog.summary = old_dialog.summary
        await db.commit()

    # Copy last 5 messages from old dialog as system context
    old_messages = await db.execute(
        select(Message)
        .where(Message.dialog_id == old_dialog.id)
        .order_by(desc(Message.created_at))
        .limit(5)
    )
    msgs = list(reversed(old_messages.scalars().all()))
    if msgs:
        context_text = "\n".join(
            f"{'Клиент' if m.role == 'user' else 'Ассистент'}: {m.content_original or ''}"
            for m in msgs
        )
        from app.modules.conversation_memory.service import add_message
        await add_message(
            db,
            tenant_id=tenant_id,
            dialog_id=dialog.id,
            role="system",
            content_original=f"[Контекст из {old_dialog.channel}] Предыдущий диалог:\n{context_text}",
            content_tokenized=None,
        )
        logger.info(
            "cross_channel_sync",
            old_channel=old_dialog.channel,
            new_channel=dialog.channel,
            phone=phone,
            messages_copied=len(msgs),
        )

    return False


async def save_inbound_message(
    db: AsyncSession,
    tenant_id: int,
    msg: WazzupMessage,
) -> dict[str, Any]:
    """Save inbound message to DB and return metadata for delayed processing.

    Returns:
        dict with dialog_id, text, channel_id, chat_id, chat_type
    """
    dialog = await ensure_dialog(db, tenant_id, msg)
    dialog_id = dialog.id

    # Early exit if dialog is already handoff/flood
    if dialog.status in ("handoff", "flood"):
        return {"status": dialog.status, "dialog_id": dialog_id}

    # Cross-channel sync by phone (WhatsApp ↔ Max, etc.)
    is_handoff = await _sync_cross_channel_context(db, tenant_id, dialog, msg)
    if is_handoff:
        return {"status": "handoff", "dialog_id": dialog_id}

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

    # Classify intent (for logging in memory)
    from app.modules.intent_classifier.service import classify_intent
    intent, confidence = await classify_intent(text)

    # Add to memory
    from app.modules.conversation_memory.service import add_message
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

    return {
        "status": "saved",
        "dialog_id": dialog_id,
        "text": text,
        "channel_id": msg.channelId,
        "chat_id": msg.chatId,
        "chat_type": msg.chatType,
    }


async def process_dialog_response(
    db: AsyncSession,
    tenant_id: int,
    dialog_id: int,
    chat_id: str,
    chat_type: str,
    channel_id: str,
) -> dict[str, Any]:
    """Process pending messages for a dialog and send a response.

    Gathers all user messages sent within the debounce window and uses the
    latest (or combined) text for the response.
    """
    dialog = await db.scalar(select(Dialog).where(Dialog.id == dialog_id))
    if not dialog or dialog.status in ("handoff", "flood", "closed"):
        return {"status": dialog.status if dialog else "no_dialog", "dialog_id": dialog_id}

    # Fetch recent user messages within debounce window
    since = datetime.now(timezone.utc) - timedelta(seconds=MESSAGE_DEBOUNCE_SECONDS + 2)
    result = await db.execute(
        select(Message)
        .where(
            Message.dialog_id == dialog_id,
            Message.role == "user",
            Message.created_at >= since,
        )
        .order_by(desc(Message.created_at))
    )
    recent_messages = list(result.scalars().all())
    if not recent_messages:
        return {"status": "no_messages", "dialog_id": dialog_id}

    # Combine messages (oldest first) or use the latest one
    texts = [m.content_original or "" for m in reversed(recent_messages)]
    combined_text = " ".join(t.strip() for t in texts if t.strip())
    logger.info("dialog_combined_text", dialog_id=dialog_id, combined_text=combined_text[:100], message_count=len(recent_messages), texts=texts)

    # Fetch tenant settings for feature toggles
    from app.modules.tenants.service import get_tenant_settings
    tenant_settings = await get_tenant_settings(db, tenant_id)
    wazzup_key = tenant_settings.wazzup_api_key if tenant_settings else None

    # If only voice messages that couldn't be transcribed — send fallback
    if not combined_text:
        has_voice_only = any(m.has_voice for m in recent_messages)
        if has_voice_only and wazzup_key:
            try:
                await send_outbound(
                    tenant_id,
                    channel_id,
                    chat_id,
                    "Извините, немного не понял что вы говорите, можете пожалуйста написать?",
                    chat_type,
                    wazzup_key,
                )
            except Exception as exc:
                logger.error("voice_fallback_send_failed", error=str(exc))
        return {"status": "empty_text", "dialog_id": dialog_id}

    # Anti-spam check
    from app.modules.anti_spam_flood.service import check_flood
    if tenant_settings is None or tenant_settings.anti_spam_enabled:
        is_flood = await check_flood(db, tenant_id, chat_id, combined_text)
        if is_flood:
            return {"status": "flood_detected", "dialog_id": dialog_id}

    # Intent classification on combined text
    from app.modules.intent_classifier.service import classify_intent
    intent, confidence = await classify_intent(combined_text)

    # Update the latest message with the combined intent (best effort)
    latest_msg = recent_messages[0]
    latest_msg.intent = intent
    latest_msg.confidence = confidence
    await db.commit()

    # Handoff check
    from app.modules.smart_escalation.service import check_handoff_needed
    if tenant_settings is None or tenant_settings.handoff_enabled:
        handoff_needed = await check_handoff_needed(db, tenant_id, chat_id, intent, combined_text)
        if handoff_needed:
            return {"status": "handoff", "dialog_id": dialog_id}

    # Generate response
    from app.modules.llm_router.service import generate_response
    response_text = await generate_response(db, tenant_id, chat_id, combined_text)

    # Save bot response to memory
    from app.modules.conversation_memory.service import add_message
    await add_message(
        db,
        tenant_id=tenant_id,
        dialog_id=dialog_id,
        role="assistant",
        content_original=response_text,
        content_tokenized=None,
    )

    # Send outbound via Wazzup
    try:
        await send_outbound(tenant_id, channel_id, chat_id, response_text, chat_type, wazzup_key)
    except Exception as exc:
        logger.error("wazzup_outbound_failed", error=str(exc), dialog_id=dialog_id)

    # Goal detection: if target action is set, check if reached
    if tenant_settings and tenant_settings.target_action:
        from app.modules.conversation_memory.service import build_context
        from app.modules.goal_detector.service import check_goal_reached
        conv_for_goal = await build_context(db, dialog_id)
        goal_reached = await check_goal_reached(tenant_settings.target_action, conv_for_goal)
        if goal_reached:
            # Mark dialog as handoff — manager takes over
            dialog_obj = await db.scalar(select(Dialog).where(Dialog.id == dialog_id))
            if dialog_obj:
                dialog_obj.status = "handoff"
                await db.commit()
            logger.info("goal_reached_handoff", tenant_id=tenant_id, dialog_id=dialog_id, target=tenant_settings.target_action)
            return {"status": "goal_reached", "dialog_id": dialog_id}

    # Schedule follow-up triggers after bot response
    from app.modules.trigger_engine.service import schedule_trigger
    await schedule_trigger(
        db,
        tenant_id=tenant_id,
        dialog_id=dialog_id,
        trigger_type="no_answer_2h",
        scenarios=tenant_settings.followup_scenarios if tenant_settings else None,
    )
    await schedule_trigger(
        db,
        tenant_id=tenant_id,
        dialog_id=dialog_id,
        trigger_type="no_answer_24h",
        scenarios=tenant_settings.followup_scenarios if tenant_settings else None,
    )

    # Billing
    from app.modules.billing.service import log_billing
    await log_billing(db, tenant_id, "incoming", len(recent_messages))
    await log_billing(db, tenant_id, "outgoing", 1)

    return {"status": "ok", "dialog_id": dialog_id}


async def handle_inbound_message(
    db: AsyncSession,
    tenant_id: int,
    msg: WazzupMessage,
) -> dict[str, Any]:
    """Legacy direct processing (used when debounce is disabled)."""
    saved = await save_inbound_message(db, tenant_id, msg)
    if saved.get("status") != "saved":
        return saved
    return await process_dialog_response(
        db,
        tenant_id,
        saved["dialog_id"],
        saved["chat_id"],
        saved["chat_type"],
        saved["channel_id"],
    )


async def send_outbound(
    tenant_id: int,
    channel_id: str,
    chat_id: str,
    text: str,
    chat_type: str = "whatsapp",
    wazzup_api_key: Optional[str] = None,
) -> dict[str, Any]:
    """Send outbound message via Wazzup."""
    logger = structlog.get_logger()

    api_key = wazzup_api_key
    if not api_key:
        logger.error(
            "wazzup_outbound_no_api_key",
            tenant_id=tenant_id,
            channel_id=channel_id,
            chat_id=chat_id,
            text=text,
        )
        raise ValueError(f"Wazzup API key not configured for tenant {tenant_id}")

    return await wazzup_client.send_message(channel_id, chat_id, text, chat_type, api_key)
