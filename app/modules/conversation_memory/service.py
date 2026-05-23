"""Conversation memory and summarization."""

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.groq_client import groq_client
# from app.clients.yandex_gpt import yandex_gpt_client  # commented out for testing
from app.db.models import Dialog, Message


async def add_message(
    db: AsyncSession,
    tenant_id: int,
    dialog_id: int,
    role: str,
    content_original: Optional[str] = None,
    content_tokenized: Optional[str] = None,
    intent: Optional[str] = None,
    confidence: Optional[float] = None,
    has_voice: bool = False,
    voice_url: Optional[str] = None,
    tokens_used: int = 0,
    is_duplicate: bool = False,
) -> Message:
    """Add a message to the conversation history."""
    msg = Message(
        dialog_id=dialog_id,
        tenant_id=tenant_id,
        role=role,
        content_original=content_original,
        content_tokenized=content_tokenized,
        intent=intent,
        confidence=confidence,
        has_voice=has_voice,
        voice_url=voice_url,
        tokens_used=tokens_used,
        is_duplicate=is_duplicate,
    )
    db.add(msg)
    # Update dialog last_message_at
    dialog = await db.scalar(select(Dialog).where(Dialog.id == dialog_id))
    if dialog:
        dialog.last_message_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_recent_messages(
    db: AsyncSession,
    dialog_id: int,
    limit: int = 15,
) -> list[Message]:
    """Fetch recent messages for a dialog."""
    result = await db.execute(
        select(Message)
        .where(Message.dialog_id == dialog_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
    )
    return list(result.scalars().all())


async def get_message_count(db: AsyncSession, dialog_id: int) -> int:
    """Count messages in a dialog."""
    return await db.scalar(
        select(func.count(Message.id)).where(Message.dialog_id == dialog_id)
    ) or 0


async def summarize_dialog(db: AsyncSession, dialog_id: int) -> str:
    """Summarize a dialog using GPT-4o mini and store it."""
    messages = await get_recent_messages(db, dialog_id, limit=50)
    if not messages:
        return ""
    texts = [f"{m.role}: {m.content_tokenized or m.content_original}" for m in reversed(messages)]
    system_prompt = (
        "Сделай краткое резюме диалога на русском языке в 2-3 предложениях. "
        "Сфокусируйся на потребностях клиента и ключевых фактах."
    )
    resp = await groq_client.chat_completion(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "\n".join(texts)},
        ],
        model=groq_client.classify_intent_model(),
        temperature=0.3,
        max_tokens=300,
    )
    summary = resp["choices"][0]["message"]["content"].strip()
    dialog = await db.scalar(select(Dialog).where(Dialog.id == dialog_id))
    if dialog:
        dialog.summary = summary
        await db.commit()
    return summary


async def build_context(db: AsyncSession, dialog_id: int) -> list[dict[str, str]]:
    """Build conversation context: summary + last 5 messages."""
    dialog = await db.scalar(select(Dialog).where(Dialog.id == dialog_id))
    summary = dialog.summary if dialog else ""
    messages = await get_recent_messages(db, dialog_id, limit=5)
    context: list[dict[str, str]] = []
    if summary:
        context.append({"role": "system", "content": f"Summary of conversation so far: {summary}"})
    for m in reversed(messages):
        content = m.content_tokenized or m.content_original or ""
        context.append({"role": m.role, "content": content})
    return context
