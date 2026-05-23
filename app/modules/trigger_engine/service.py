"""Auto follow-up (trigger engine)."""

from datetime import datetime, timedelta, timezone
from typing import Optional

import structlog
from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.groq_client import groq_client
from app.clients.wazzup_client import wazzup_client
from app.db.models import Dialog, FollowupTrigger, Message
from app.modules.conversation_memory.service import build_context

logger = structlog.get_logger()

TRIGGERS = {
    "new_lead_30min": {"delay_minutes": 30, "label": "Не ответил на приветствие"},
    "no_answer_2h": {"delay_minutes": 120, "label": "Не ответил на вопрос 2ч"},
    "no_answer_24h": {"delay_minutes": 1440, "label": "Диалог завис 24ч"},
    "thinking_3d": {"delay_minutes": 4320, "label": "Сделка думает 3 дня"},
    "post_meeting_2h": {"delay_minutes": 120, "label": "Follow-up после встречи"},
    "abandoned_7d": {"delay_minutes": 10080, "label": "Реактивация"},
}


async def schedule_trigger(
    db: AsyncSession,
    tenant_id: int,
    dialog_id: int,
    trigger_type: str,
    scheduled_at: Optional[datetime] = None,
) -> FollowupTrigger:
    """Schedule a follow-up trigger."""
    if trigger_type not in TRIGGERS:
        raise ValueError(f"Unknown trigger type: {trigger_type}")
    delay = TRIGGERS[trigger_type]["delay_minutes"]
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
    return trigger


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
        # Generate follow-up text with GPT-4o
        context = await build_context(db, dialog.id)
        prompt = (
            "You are a polite Russian sales assistant. Write a short follow-up message "
            "based on the conversation history. Keep it under 200 chars.\n\n"
            + "\n".join(f"{m['role']}: {m['content']}" for m in context[-5:])
        )
        try:
            resp = await groq_client.chat_completion(
                messages=[{"role": "system", "content": prompt}],
                model=groq_client.classify_intent_model(),
                temperature=0.7,
                max_tokens=150,
            )
            text_plain = resp["choices"][0]["message"]["content"].strip()
            await wazzup_client.send_message(dialog.channel, dialog.external_user_id, text_plain)
            trig.status = "sent"
            trig.sent_at = now
            await db.commit()
            logger.info("followup_sent", trigger_id=trig.id, dialog_id=dialog.id)
        except Exception as exc:
            logger.error("followup_failed", trigger_id=trig.id, error=str(exc))
