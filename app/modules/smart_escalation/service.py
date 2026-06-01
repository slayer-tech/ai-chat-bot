"""Smart escalation (Handoff 2.0)."""

import json
import re
from datetime import datetime, timezone
from typing import Optional

import structlog
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.yandex_gpt import yandex_gpt_client
from app.db.models import Dialog, Message
from app.modules.conversation_memory.service import get_recent_messages, summarize_dialog

logger = structlog.get_logger()

# Fast regex guard before calling LLM for human request detection
HUMAN_KEYWORDS_RE = re.compile(
    r"\b(человек|менеджер|оператор|живой|консультант|перезвоните|позвоните|свяжитесь|связаться|позвонить|перезвонить)\b",
    re.IGNORECASE,
)


async def check_handoff_needed(
    db: AsyncSession,
    tenant_id: int,
    external_user_id: str,
    intent: str,
    text: str,
) -> bool:
    """Determine if dialog should be escalated to human.

    Returns:
        True if handoff is triggered.
    """
    dialog = await db.scalar(
        select(Dialog).where(
            Dialog.tenant_id == tenant_id,
            Dialog.external_user_id == external_user_id,
        )
    )
    if not dialog or dialog.status in ("handoff", "flood"):
        return False

    dialog_id = dialog.id

    # 1. Two fallbacks in a row
    recent = await get_recent_messages(db, dialog_id, limit=3)
    fallback_count = sum(1 for m in recent if m.intent == "fallback")
    if fallback_count >= 2:
        await _do_handoff(db, dialog, reason="two_fallbacks")
        return True

    # 2. Client asks for human (semantic check via YandexGPT Lite)
    if intent == "handoff" or await _is_human_request(text):
        await _do_handoff(db, dialog, reason="human_request")
        return True

    # 3. Discount (non-standard)
    if intent == "discount":
        await _do_handoff(db, dialog, reason="discount")
        return True

    # 4. Stalled dialog (last 6 messages)
    if await _is_stalled(db, dialog_id):
        await _do_handoff(db, dialog, reason="stalled")
        return True

    return False


async def _is_human_request(text: str) -> bool:
    """Detect if user asks for a human. Fast regex guard first, then LLM fallback."""
    # Fast path: no human-related keywords → skip LLM call
    if not HUMAN_KEYWORDS_RE.search(text):
        return False

    system_prompt = (
        "Определи, просит ли пользователь явно связаться с живым оператором/менеджером. "
        "Верни строго JSON: {\"is_human_request\": true/false}"
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
        data = json.loads(content)
        return bool(data.get("is_human_request", False))
    except Exception as exc:
        logger.error("human_request_check_failed", error=str(exc))
        return False


async def _is_stalled(db: AsyncSession, dialog_id: int) -> bool:
    """Check if last 6 messages show no progress via YandexGPT Lite."""
    messages = await get_recent_messages(db, dialog_id, limit=6)
    if len(messages) < 6:
        return False
    texts = [f"{m.role}: {m.content_tokenized or m.content_original}" for m in reversed(messages)]
    system_prompt = (
        "Проанализируй, застрял ли диалог (нет прогресса, повторяющиеся ответы, бот крутится на месте). "
        "Верни строго JSON: {\"is_stalled\": true/false}"
    )
    try:
        resp = await yandex_gpt_client.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": "\n".join(texts)},
            ],
            temperature=0.3,
            max_tokens=50,
        )
        content = resp["choices"][0]["message"]["content"]
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("\n", 1)[0]
        data = json.loads(content)
        return bool(data.get("is_stalled", False))
    except Exception as exc:
        logger.error("stalled_check_failed", error=str(exc))
        return False


async def _do_handoff(db: AsyncSession, dialog: Dialog, reason: str) -> None:
    """Execute handoff: update dialog, create CRM lead/task/note, cancel follow-ups."""
    dialog.status = "handoff"
    dialog.is_stalled = True
    await db.commit()

    # Cancel any pending follow-ups — manager takes over
    from app.modules.trigger_engine.service import _cancel_pending_triggers
    await _cancel_pending_triggers(db, dialog.id)

    # Summarize
    summary = await summarize_dialog(db, dialog.id)

    # CRM handoff processing
    from app.modules.crm_integration.service import handle_handoff
    await handle_handoff(db, dialog, reason, summary)

    logger.info("handoff_executed", dialog_id=dialog.id, reason=reason, summary=summary)
