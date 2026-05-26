"""LLM router: all text queries go directly to GPT-4o."""

from typing import Optional

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.yandex_gpt import yandex_gpt_client

from app.core.config import settings as app_settings
from app.db.models import Dialog
from app.modules.conversation_memory.service import build_context
from app.modules.rag_knowledge_base.service import search_knowledge

logger = structlog.get_logger()


async def generate_response(
    db: AsyncSession,
    tenant_id: int,
    external_user_id: str,
    current_message: str,
) -> str:
    """Generate a bot response using GPT-4o with RAG + memory.

    Args:
        db: Database session.
        tenant_id: Tenant ID.
        external_user_id: User identifier.
        current_message: Tokenized current message.

    Returns:
        Generated response text (tokenized).
    """
    from sqlalchemy import select

    dialog = await db.scalar(
        select(Dialog).where(
            Dialog.tenant_id == tenant_id,
            Dialog.external_user_id == external_user_id,
        )
    )
    dialog_id = dialog.id if dialog else 0

    # Fetch system prompt from tenant settings
    from app.modules.tenants.service import get_tenant_settings

    settings_obj = await get_tenant_settings(db, tenant_id)
    system_prompt = settings_obj.system_prompt if settings_obj else ""
    if not system_prompt:
        system_prompt = (
            "You are a helpful Russian sales assistant. "
            "Answer concisely, professionally, and in Russian."
        )

    # FAQ context (if no RAG or as supplement)
    faq_text = ""
    if settings_obj and settings_obj.faq_items:
        faq_lines = []
        for item in settings_obj.faq_items:
            q = item.get("question", "")
            a = item.get("answer", "")
            if q and a:
                faq_lines.append(f"В: {q}\nО: {a}")
        faq_text = "\n\n".join(faq_lines)

    # RAG context
    rag_chunks = await search_knowledge(db, tenant_id, current_message)
    rag_text = "\n".join(rag_chunks) if rag_chunks else ""

    # Conversation context
    conv_context = await build_context(db, dialog_id)

    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
    if faq_text:
        messages.append({"role": "system", "content": f"Частые вопросы и ответы:\n{faq_text}"})
    if rag_text:
        messages.append({"role": "system", "content": f"Relevant info:\n{rag_text}"})
    messages.extend(conv_context)
    messages.append({"role": "user", "content": current_message})

    resp = await yandex_gpt_client.chat_completion(
        messages=messages,
        temperature=0.7,
        max_tokens=1000,
    )
    answer = resp["choices"][0]["message"]["content"].strip()
    logger.info("llm_response_generated", tenant_id=tenant_id, dialog_id=dialog_id, answer=answer)
    return answer
