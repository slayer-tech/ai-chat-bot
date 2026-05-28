"""Anti-spam and flood detection."""

import re
from datetime import datetime, timedelta, timezone
from typing import Optional

import structlog
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.yandex_gpt import yandex_gpt_client
from app.db.models import Dialog, Message, TenantSettings
from app.modules.smart_escalation.service import _do_handoff

logger = structlog.get_logger()


def normalize_text(text: str) -> str:
    """Normalize text for duplicate detection."""
    return re.sub(r"[^\w\s]", "", text).strip().lower()


async def check_flood(
    db: AsyncSession,
    tenant_id: int,
    external_user_id: str,
    text: str,
) -> bool:
    """Check if the user is flooding/spamming.

    Returns:
        True if flood detected and handled.
    """
    settings = await db.scalar(
        select(TenantSettings).where(TenantSettings.tenant_id == tenant_id)
    )
    if not settings:
        return False

    dialog = await db.scalar(
        select(Dialog).where(
            Dialog.tenant_id == tenant_id,
            Dialog.external_user_id == external_user_id,
        )
    )
    if not dialog:
        return False
    # Already flagged as flood — keep blocking
    if dialog.status == "flood":
        return True
    dialog_id = dialog.id

    # Rate limits: count messages in last 5 and 10 minutes
    now = datetime.now(timezone.utc)
    five_min_ago = now - timedelta(minutes=5)
    ten_min_ago = now - timedelta(minutes=10)

    count_5min = await db.scalar(
        select(func.count(Message.id))
        .where(
            Message.dialog_id == dialog_id,
            Message.created_at >= five_min_ago,
        )
    ) or 0

    count_10min = await db.scalar(
        select(func.count(Message.id))
        .where(
            Message.dialog_id == dialog_id,
            Message.created_at >= ten_min_ago,
        )
    ) or 0

    if count_5min >= settings.rate_limit_5min or count_10min >= settings.rate_limit_10min:
        await _handle_flood(db, dialog, settings)
        return True

    # Duplicate detection
    recent = await db.execute(
        select(Message)
        .where(Message.dialog_id == dialog_id)
        .order_by(desc(Message.created_at))
        .limit(settings.duplicate_threshold)
    )
    messages = list(reversed(recent.scalars().all()))
    if len(messages) >= settings.duplicate_threshold:
        norms = [normalize_text(m.content_original or "") for m in messages]
        if all(n == norms[0] and n for n in norms):
            await _handle_flood(db, dialog, settings)
            return True

    # Toxic / aggression detection via Groq
    if await _is_toxic(text):
        await _do_handoff(db, dialog, reason="toxic")
        return True

    return False


async def _is_toxic(text: str) -> bool:
    """YandexGPT Lite sentiment/toxicity check."""
    system_prompt = (
        "Ты анализатор токсичности. Определи, содержит ли сообщение агрессию, оскорбления или мат. "
        "Верни строго JSON: {\"is_toxic\": true/false}"
    )
    try:
        resp = await yandex_gpt_client.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": text},
            ],
            temperature=0.3,
            max_tokens=50,
        )
        content = resp["choices"][0]["message"]["content"]
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("\n", 1)[0]
        import json

        data = json.loads(content)
        return bool(data.get("is_toxic", False))
    except Exception as exc:
        logger.error("toxic_check_failed", error=str(exc))
        return False


async def _handle_flood(
    db: AsyncSession,
    dialog: Dialog,
    settings: TenantSettings,
) -> None:
    """Mark dialog as flood and notify CRM, cancel follow-ups."""
    dialog.status = "flood"
    dialog.is_flood_suspected = True
    await db.commit()

    # Cancel any pending follow-ups — dialog is blocked
    from app.modules.trigger_engine.service import _cancel_pending_triggers
    await _cancel_pending_triggers(db, dialog.id)

    # CRM notify — COMMENTED OUT FOR TESTING (no CRM connected yet)
    # if settings.crm_type and dialog.crm_lead_id:
    #     adapter = get_crm_adapter(settings.crm_type, settings.crm_config or {})
    #     try:
    #         await adapter.add_note(
    #             dialog.crm_lead_id,
    #             "Клиент флудит/спамит. Проверьте вручную.",
    #         )
    #         await adapter.create_task(
    #             dialog.crm_lead_id,
    #             "Клиент флудит — проверить вручную",
    #         )
    #     except Exception as exc:
    #         logger.error("crm_flood_notify_failed", error=str(exc))

    logger.info("flood_detected", dialog_id=dialog.id)
