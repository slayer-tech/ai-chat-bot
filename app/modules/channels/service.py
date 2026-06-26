"""Channel processing via Wazzup."""

import structlog
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.wazzup_client import wazzup_client
from app.core.exceptions import ExternalAPIError
from app.db.models import Dialog, Message
from app.schemas.webhook import UnifiedMessage, WazzupMessage

logger = structlog.get_logger()

# Delay in seconds before processing a batch of messages
MESSAGE_DEBOUNCE_SECONDS = 10


async def _handoff_for_voice_error(
    db: AsyncSession,
    dialog: Dialog,
    voice_url: Optional[str],
    error_text: str,
) -> None:
    """Hand off dialog to manager when voice transcription fails."""
    from app.modules.conversation_memory.service import add_message, summarize_dialog
    from app.modules.crm_integration.service import handle_handoff
    from app.modules.trigger_engine.service import _cancel_pending_triggers

    dialog.status = "handoff"
    dialog.last_error_text = f"Voice transcription error: {error_text}"
    dialog.last_error_at = datetime.now(timezone.utc)
    await db.commit()
    await _cancel_pending_triggers(db, dialog.id)
    summary = await summarize_dialog(db, dialog.id)
    await handle_handoff(db, dialog, "voice_transcription_failure", summary)
    await add_message(
        db,
        tenant_id=dialog.tenant_id,
        dialog_id=dialog.id,
        role="user",
        content_original="[Голосовое сообщение — не удалось распознать, передано менеджеру]",
        content_tokenized=None,
        has_voice=True,
        voice_url=voice_url,
    )
    await db.commit()
    logger.info("voice_error_handoff", dialog_id=dialog.id, error=error_text)


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
    if dialog and not dialog.channel_id:
        dialog.channel_id = msg.channelId
        await db.commit()
        await db.refresh(dialog)
    if not dialog:
        # Determine start stage for state machine
        from app.modules.dialog_stages.service import get_start_stage
        start_stage = await get_start_stage(db, tenant_id)
        dialog = Dialog(
            tenant_id=tenant_id,
            channel=msg.chatType,
            channel_id=msg.channelId,
            external_user_id=msg.chatId,
            phone=msg.contact.phone if msg.contact else None,
            name=msg.contact.name if msg.contact else None,
            current_stage=start_stage.name if start_stage else None,
            last_message_at=datetime.now(timezone.utc),
        )
        db.add(dialog)
        await db.commit()
        await db.refresh(dialog)
        # Sync with CRM on first contact
        from app.modules.crm_integration.service import sync_lead_on_first_contact
        await sync_lead_on_first_contact(db, dialog)
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
        from app.modules.trigger_engine.service import _cancel_pending_triggers
        await _cancel_pending_triggers(db, dialog.id)
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

    # Load tenant settings for limits
    from app.modules.tenants.service import get_tenant_settings
    tenant_settings = await get_tenant_settings(db, tenant_id)

    # Determine content
    text = msg.text or ""
    voice_url = None
    if msg.type == "audio" and msg.contentUri:
        voice_url = msg.contentUri

    # Voice duration check
    if voice_url and tenant_settings:
        from app.modules.voice_processing.service import download_voice, get_voice_duration_seconds
        try:
            audio_bytes = await download_voice(voice_url)
            duration = get_voice_duration_seconds(audio_bytes)
            max_dur = tenant_settings.voice_max_duration_seconds or 120
            if duration and duration > max_dur:
                logger.info(
                    "voice_too_long_handoff",
                    dialog_id=dialog_id,
                    duration=duration,
                    max=max_dur,
                )
                dialog.status = "handoff"
                dialog.message_count += 1
                dialog.last_message_at = datetime.now(timezone.utc)
                await db.commit()
                from app.modules.trigger_engine.service import _cancel_pending_triggers
                await _cancel_pending_triggers(db, dialog_id)
                from app.modules.conversation_memory.service import summarize_dialog
                from app.modules.crm_integration.service import handle_handoff
                summary = await summarize_dialog(db, dialog_id)
                await handle_handoff(db, dialog, "voice_too_long", summary)
                # Still save the message so manager sees it
                from app.modules.conversation_memory.service import add_message
                await add_message(
                    db,
                    tenant_id=tenant_id,
                    dialog_id=dialog_id,
                    role="user",
                    content_original="[Голосовое сообщение слишком длинное — передано менеджеру]",
                    content_tokenized=None,
                    has_voice=True,
                    voice_url=voice_url,
                )
                return {"status": "handoff", "dialog_id": dialog_id}
            # Re-use downloaded bytes for transcription
            from app.modules.voice_processing.service import process_voice_if_needed
            try:
                transcribed = await process_voice_if_needed(voice_url, audio_bytes=audio_bytes)
                if transcribed:
                    text = transcribed
            except ExternalAPIError as exc:
                logger.error("voice_transcription_failed", error=str(exc))
                await _handoff_for_voice_error(db, dialog, voice_url, str(exc))
                return {"status": "handoff", "dialog_id": dialog_id}
        except Exception as exc:
            logger.error("voice_duration_check_failed", error=str(exc))
            from app.modules.voice_processing.service import process_voice_if_needed
            try:
                transcribed = await process_voice_if_needed(voice_url)
                if transcribed:
                    text = transcribed
            except ExternalAPIError as exc2:
                logger.error("voice_transcription_failed", error=str(exc2))
                await _handoff_for_voice_error(db, dialog, voice_url, str(exc2))
                return {"status": "handoff", "dialog_id": dialog_id}
    elif voice_url:
        from app.modules.voice_processing.service import process_voice_if_needed
        try:
            transcribed = await process_voice_if_needed(voice_url)
            if transcribed:
                text = transcribed
        except ExternalAPIError as exc:
            logger.error("voice_transcription_failed", error=str(exc))
            await _handoff_for_voice_error(db, dialog, voice_url, str(exc))
            return {"status": "handoff", "dialog_id": dialog_id}

    # Increment incoming message counter
    dialog.message_count += 1
    dialog.last_message_at = datetime.now(timezone.utc)

    # Dialog message limit check
    if tenant_settings and tenant_settings.dialog_message_limit:
        if dialog.message_count >= tenant_settings.dialog_message_limit:
            logger.info(
                "dialog_limit_reached_handoff",
                dialog_id=dialog_id,
                message_count=dialog.message_count,
                limit=tenant_settings.dialog_message_limit,
            )
            dialog.status = "handoff"
            await db.commit()
            from app.modules.trigger_engine.service import _cancel_pending_triggers
            await _cancel_pending_triggers(db, dialog_id)
            from app.modules.conversation_memory.service import summarize_dialog
            from app.modules.crm_integration.service import handle_handoff
            summary = await summarize_dialog(db, dialog_id)
            await handle_handoff(db, dialog, "dialog_limit_reached", summary)
            # Save user message before handoff
            from app.modules.intent_classifier.service import classify_intent
            intent, confidence = await classify_intent(text)
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
            return {"status": "handoff", "dialog_id": dialog_id}

    # Classify intent (for logging in memory)
    from app.modules.intent_classifier.service import classify_intent
    intent, confidence = await classify_intent(text)

    # Add to memory
    from app.modules.conversation_memory.service import add_message
    msg_obj = await add_message(
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
    await db.commit()

    logger.info(
        "inbound_message_saved",
        dialog_id=dialog_id,
        message_id=msg_obj.id,
        created_at=msg_obj.created_at.isoformat() if msg_obj.created_at else None,
        role=msg_obj.role,
        text_preview=text[:50] if text else None,
    )

    # Add note to CRM about user message
    if text:
        from app.modules.crm_integration.service import add_dialog_note_to_crm
        await add_dialog_note_to_crm(db, dialog, f"Клиент: {text[:500]}", prefix="[Сообщение] ")

    # Cancel any pending follow-ups because the user just replied
    from app.modules.trigger_engine.service import _cancel_pending_triggers
    await _cancel_pending_triggers(db, dialog_id)

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
    logger.info(
        "process_dialog_recent_messages",
        dialog_id=dialog_id,
        since=since.isoformat(),
        now=datetime.now(timezone.utc).isoformat(),
        message_count=len(recent_messages),
        message_ids=[m.id for m in recent_messages],
        message_created_ats=[m.created_at.isoformat() for m in recent_messages] if recent_messages else [],
    )
    if not recent_messages:
        return {"status": "no_messages", "dialog_id": dialog_id}

    # Combine messages (oldest first) or use the latest one
    texts = [m.content_original or "" for m in reversed(recent_messages)]
    combined_text = " ".join(t.strip() for t in texts if t.strip())
    logger.info("dialog_combined_text", dialog_id=dialog_id, combined_text=combined_text[:100], message_count=len(recent_messages), texts=texts)

    # Fetch tenant settings for feature toggles
    from app.modules.tenants.service import get_tenant_settings, get_decrypted_wazzup_api_key
    tenant_settings = await get_tenant_settings(db, tenant_id)
    wazzup_key = await get_decrypted_wazzup_api_key(db, tenant_id)

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

    # Generate response (with RAG confidence check + script stages + off-topic detection)
    from app.modules.llm_router.service import generate_response
    llm_result = await generate_response(db, tenant_id, chat_id, combined_text, require_confidence=True)
    response_text = llm_result["text"]

    # Low confidence / no relevant knowledge — handoff or fallback
    if response_text is None:
        if tenant_settings and tenant_settings.handoff_enabled:
            dialog.status = "handoff"
            await db.commit()
            from app.modules.trigger_engine.service import _cancel_pending_triggers
            await _cancel_pending_triggers(db, dialog_id)
            from app.modules.conversation_memory.service import summarize_dialog
            from app.modules.crm_integration.service import handle_handoff
            summary = await summarize_dialog(db, dialog_id)
            await handle_handoff(db, dialog, "rag_low_confidence", summary)
            logger.info("rag_handoff_low_confidence", dialog_id=dialog_id, tenant_id=tenant_id)
            return {"status": "handoff", "dialog_id": dialog_id}
        else:
            response_text = (
                "Извините, я не уверен в точном ответе на этот вопрос. "
                "Могу уточнить у коллеги и вернуться к вам."
            )

    # Update current stage from LLM self-assessment
    if llm_result["stage"]:
        dialog.current_stage = llm_result["stage"]

    # Forced handoff flag (e.g. first contact with complex question and low RAG confidence)
    force_handoff = llm_result.get("force_handoff", False)

    # Data deletion request — GDPR / 152-FZ right to be forgotten
    if llm_result.get("delete_request"):
        logger.info("data_deletion_requested", dialog_id=dialog_id, tenant_id=tenant_id)
        from app.modules.trigger_engine.service import _cancel_pending_triggers
        await _cancel_pending_triggers(db, dialog_id)
        from app.modules.conversation_memory.service import delete_dialog_data
        await delete_dialog_data(db, dialog_id)
        # Send confirmation (response_text already contains LLM confirmation)
        try:
            await send_outbound(tenant_id, channel_id, chat_id, response_text, chat_type, wazzup_key)
        except Exception as exc:
            logger.error("wazzup_outbound_failed", error=str(exc), dialog_id=dialog_id)
        return {"status": "deleted", "dialog_id": dialog_id}

    # Script completed — handoff to manager, no more follow-ups
    if llm_result["script_complete"]:
        dialog.status = "handoff"
        await db.commit()
        from app.modules.trigger_engine.service import _cancel_pending_triggers
        await _cancel_pending_triggers(db, dialog_id)
        logger.info("script_complete_handoff", dialog_id=dialog_id, tenant_id=tenant_id, stage=dialog.current_stage)
        # Still send the final response (e.g. "Записал вас на оплату...")
        # Then handoff

    # Off-topic handling: count consecutive off-topic interactions
    elif llm_result["is_off_topic"]:
        dialog.off_topic_count += 1
        logger.info("off_topic_detected", dialog_id=dialog_id, count=dialog.off_topic_count)
        if dialog.off_topic_count >= 2:
            # Flood: client trolling with off-topic questions
            dialog.status = "flood"
            dialog.is_flood_suspected = True
            await db.commit()
            from app.modules.trigger_engine.service import _cancel_pending_triggers
            await _cancel_pending_triggers(db, dialog_id)
            logger.info("off_topic_flood", dialog_id=dialog_id, tenant_id=tenant_id)
            return {"status": "flood", "dialog_id": dialog_id}
    else:
        # Reset off-topic counter on normal response
        if dialog.off_topic_count > 0:
            dialog.off_topic_count = 0

    await db.commit()

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

    # Add bot response note to CRM
    if response_text:
        from app.modules.crm_integration.service import add_dialog_note_to_crm
        await add_dialog_note_to_crm(db, dialog, f"Бот: {response_text[:500]}", prefix="[Ответ бота] ")

    # CRM: script complete
    if llm_result.get("script_complete"):
        from app.modules.conversation_memory.service import summarize_dialog
        summary = await summarize_dialog(db, dialog_id)
        from app.modules.crm_integration.service import handle_script_complete
        await handle_script_complete(db, dialog, summary)

    # CRM: forced handoff after sending engagement message
    if force_handoff and dialog.status not in ("handoff", "flood", "closed"):
        dialog.status = "handoff"
        await db.commit()
        from app.modules.trigger_engine.service import _cancel_pending_triggers
        await _cancel_pending_triggers(db, dialog_id)
        from app.modules.conversation_memory.service import summarize_dialog
        from app.modules.crm_integration.service import handle_handoff
        summary = await summarize_dialog(db, dialog_id)
        await handle_handoff(db, dialog, "first_contact_complex_question", summary)
        logger.info(
            "force_handoff_executed",
            dialog_id=dialog_id,
            tenant_id=tenant_id,
            reason="first_contact_complex_question",
        )

    # CRM: flood
    if dialog.status == "flood":
        from app.modules.crm_integration.service import handle_flood
        await handle_flood(db, dialog)

    # Schedule follow-up triggers after bot response (skip if dialog is already handed off)
    if dialog.status == "active":
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
