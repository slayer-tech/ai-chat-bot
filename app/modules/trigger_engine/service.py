"""Auto follow-up (trigger engine)."""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import structlog
from sqlalchemy import and_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.yandex_gpt import yandex_gpt_client
from app.clients.wazzup_client import wazzup_client
from app.db.models import Dialog, FollowupTrigger, Message
from app.modules.conversation_memory.service import build_context

logger = structlog.get_logger()

# Default follow-up scenarios (Russian)
DEFAULT_TRIGGERS: dict[str, dict[str, Any]] = {
    "new_lead_30min": {
        "enabled": True,
        "delay_minutes": 30,
        "label": "Не ответил на приветствие",
        "text": "",
    },
    "no_answer_2h": {
        "enabled": True,
        "delay_minutes": 120,
        "label": "Не ответил на вопрос 2 часа",
        "text": "",
    },
    "no_answer_24h": {
        "enabled": True,
        "delay_minutes": 1440,
        "label": "Диалог завис на сутки",
        "text": "",
    },
    "thinking_3d": {
        "enabled": False,
        "delay_minutes": 4320,
        "label": "Сделка думает 3 дня",
        "text": "",
    },
    "post_meeting_2h": {
        "enabled": False,
        "delay_minutes": 120,
        "label": "Фоллоу-ап после встречи",
        "text": "",
    },
    "abandoned_7d": {
        "enabled": False,
        "delay_minutes": 10080,
        "label": "Реактивация спустя неделю",
        "text": "",
    },
}


def _get_trigger_config(scenarios: Optional[dict], trigger_type: str) -> dict[str, Any]:
    """Get trigger config from tenant settings or fall back to defaults."""
    if scenarios and trigger_type in scenarios:
        cfg = scenarios[trigger_type]
        default = DEFAULT_TRIGGERS.get(trigger_type, {})
        return {
            "enabled": cfg.get("enabled", default.get("enabled", False)),
            "delay_minutes": cfg.get("delay_minutes", default.get("delay_minutes", 60)),
            "label": cfg.get("label", default.get("label", trigger_type)),
            "text": cfg.get("text", default.get("text", "")),
        }
    return DEFAULT_TRIGGERS.get(trigger_type, {"enabled": False, "delay_minutes": 60, "label": trigger_type, "text": ""})


def get_default_scenarios() -> dict[str, dict[str, Any]]:
    """Return default follow-up scenarios for new tenants."""
    return {k: dict(v) for k, v in DEFAULT_TRIGGERS.items()}


async def _cancel_pending_triggers(
    db: AsyncSession, dialog_id: int, trigger_type: Optional[str] = None
) -> None:
    """Cancel existing pending triggers for a dialog."""
    stmt = (
        update(FollowupTrigger)
        .where(
            FollowupTrigger.dialog_id == dialog_id,
            FollowupTrigger.status == "pending",
        )
        .values(status="cancelled")
        .execution_options(synchronize_session=False)
    )
    if trigger_type:
        stmt = stmt.where(FollowupTrigger.trigger_type == trigger_type)
    await db.execute(stmt)
    await db.commit()


async def schedule_trigger(
    db: AsyncSession,
    tenant_id: int,
    dialog_id: int,
    trigger_type: str,
    scenarios: Optional[dict] = None,
    scheduled_at: Optional[datetime] = None,
) -> Optional[FollowupTrigger]:
    """Schedule a follow-up trigger if enabled in tenant settings.

    Cancels any existing pending triggers for the same dialog to avoid duplicates.
    """
    cfg = _get_trigger_config(scenarios, trigger_type)
    if not cfg["enabled"]:
        return None

    # Cancel old pending triggers for this dialog so we never send duplicates
    await _cancel_pending_triggers(db, dialog_id)

    delay = cfg["delay_minutes"]
    at = scheduled_at or (datetime.now(timezone.utc) + timedelta(minutes=delay))
    trigger = FollowupTrigger(
        tenant_id=tenant_id,
        dialog_id=dialog_id,
        trigger_type=trigger_type,
        scheduled_at=at,
        status="pending",
    )
    db.add(trigger)
    await db.commit()
    await db.refresh(trigger)
    logger.info("trigger_scheduled", trigger_id=trigger.id, dialog_id=dialog_id, type=trigger_type, at=at.isoformat())
    return trigger


def _is_within_business_hours(now_utc: datetime, tenant_settings) -> bool:
    """Check if current UTC time falls within tenant's business hours.

    If smart_delay_start/end are not set — always returns True.
    """
    if not tenant_settings:
        return True
    start = tenant_settings.smart_delay_start
    end = tenant_settings.smart_delay_end
    if not start or not end:
        return True

    import pytz

    tz_name = tenant_settings.timezone or "Europe/Moscow"
    try:
        tz = pytz.timezone(tz_name)
    except Exception:
        tz = pytz.timezone("Europe/Moscow")

    now_local = now_utc.astimezone(tz)
    current_time = now_local.time()

    if start <= end:
        return start <= current_time <= end
    else:
        # Overnight window (e.g. 22:00 - 08:00)
        return current_time >= start or current_time <= end


async def process_pending_triggers(db: AsyncSession) -> None:
    """Process due follow-up triggers."""
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(FollowupTrigger)
        .where(
            and_(
                FollowupTrigger.status == "pending",
                FollowupTrigger.scheduled_at <= now,
            )
        )
        .order_by(FollowupTrigger.scheduled_at)
    )
    triggers = result.scalars().all()

    for trig in triggers:
        dialog = await db.scalar(select(Dialog).where(Dialog.id == trig.dialog_id))
        if not dialog or dialog.status != "active":
            trig.status = "cancelled"
            await db.commit()
            continue

        # Fetch tenant settings for follow-up config
        from app.modules.tenants.service import get_tenant_settings
        tenant_settings = await get_tenant_settings(db, dialog.tenant_id)

        if not tenant_settings or not tenant_settings.followup_enabled:
            trig.status = "cancelled"
            await db.commit()
            continue

        # Respect business hours — skip and keep pending until within hours
        if not _is_within_business_hours(now, tenant_settings):
            logger.info(
                "followup_outside_business_hours",
                trigger_id=trig.id,
                tenant_id=dialog.tenant_id,
                timezone=tenant_settings.timezone,
                start=str(tenant_settings.smart_delay_start),
                end=str(tenant_settings.smart_delay_end),
            )
            continue

        cfg = _get_trigger_config(tenant_settings.followup_scenarios, trig.trigger_type)
        if not cfg["enabled"]:
            trig.status = "cancelled"
            await db.commit()
            continue

        # Fail-safe: if user replied after the trigger was scheduled, cancel it
        last_user_msg = await db.scalar(
            select(Message)
            .where(Message.dialog_id == dialog.id, Message.role == "user")
            .order_by(Message.created_at.desc())
        )
        last_bot_msg = await db.scalar(
            select(Message)
            .where(Message.dialog_id == dialog.id, Message.role == "assistant")
            .order_by(Message.created_at.desc())
        )
        if last_user_msg and last_bot_msg and last_user_msg.created_at > last_bot_msg.created_at:
            logger.info(
                "followup_cancelled_user_replied",
                trigger_id=trig.id,
                dialog_id=dialog.id,
                last_user_at=last_user_msg.created_at.isoformat(),
                last_bot_at=last_bot_msg.created_at.isoformat(),
            )
            trig.status = "cancelled"
            await db.commit()
            continue

        # Use custom text if provided, otherwise generate with YandexGPT
        text_plain = cfg.get("text", "").strip()
        if not text_plain:
            context = await build_context(db, dialog.id)
            prompt = (
                "Ты вежливый русскоязычный sales-ассистент. Напиши короткое follow-up сообщение "
                "на основе истории диалога. Не более 200 символов. Будь дружелюбным и ненавязчивым.\n\n"
                + "\n".join(f"{'Клиент' if m['role'] == 'user' else 'Ассистент'}: {m['content']}" for m in context[-5:])
            )
            try:
                resp = await yandex_gpt_client.chat_completion(
                    messages=[{"role": "system", "content": prompt}],
                    temperature=0.7,
                    max_tokens=150,
                )
                text_plain = resp["choices"][0]["message"]["content"].strip()
            except Exception as exc:
                logger.error("followup_generation_failed", trigger_id=trig.id, error=str(exc))
                trig.status = "failed"
                await db.commit()
                continue

        wazzup_key = tenant_settings.wazzup_api_key if tenant_settings else None
        if not dialog.channel_id:
            logger.warning("followup_no_channel_id", dialog_id=dialog.id)
            trig.status = "failed"
            await db.commit()
            continue
        try:
            await wazzup_client.send_message(
                dialog.channel_id,
                dialog.external_user_id,
                text_plain,
                chat_type=dialog.channel,
                api_key=wazzup_key,
            )
            trig.status = "sent"
            trig.sent_at = now
            await db.commit()
            logger.info("followup_sent", trigger_id=trig.id, dialog_id=dialog.id, type=trig.trigger_type)
        except Exception as exc:
            logger.error("followup_failed", trigger_id=trig.id, error=str(exc))
            trig.status = "failed"
            await db.commit()
