"""LLM router: all text queries go directly to GPT-4o."""

from typing import Optional

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.yandex_gpt import yandex_gpt_client

from app.core.config import settings as app_settings
from app.db.models import Dialog
from app.modules.conversation_memory.service import build_context
from app.modules.rag_knowledge_base.service import search_knowledge_with_scores

logger = structlog.get_logger()

# Cosine distance threshold: lower = more similar. > 0.35 = low confidence.
RAG_CONFIDENCE_THRESHOLD = 0.35


async def generate_response(
    db: AsyncSession,
    tenant_id: int,
    external_user_id: str,
    current_message: str,
    require_confidence: bool = True,
) -> Optional[str]:
    """Generate a bot response using GPT-4o with RAG + memory + sales script.

    Args:
        db: Database session.
        tenant_id: Tenant ID.
        external_user_id: User identifier.
        current_message: Tokenized current message.
        require_confidence: If True and no relevant RAG found, returns None (handoff/fallback).

    Returns:
        Generated response text, or None if confidence too low and require_confidence=True.
    """
    from sqlalchemy import select

    dialog = await db.scalar(
        select(Dialog).where(
            Dialog.tenant_id == tenant_id,
            Dialog.external_user_id == external_user_id,
        )
    )
    dialog_id = dialog.id if dialog else 0

    # Fetch tenant settings
    from app.modules.tenants.service import get_tenant_settings

    settings_obj = await get_tenant_settings(db, tenant_id)
    system_prompt = settings_obj.system_prompt if settings_obj else ""
    if not system_prompt:
        system_prompt = (
            "You are a helpful Russian sales assistant. "
            "Answer concisely, professionally, and in Russian."
        )

    # FAQ context
    faq_text = ""
    if settings_obj and settings_obj.faq_items:
        faq_lines = []
        for item in settings_obj.faq_items:
            q = item.get("question", "")
            a = item.get("answer", "")
            if q and a:
                faq_lines.append(f"В: {q}\nО: {a}")
        faq_text = "\n\n".join(faq_lines)

    # RAG with confidence scores
    rag_results = await search_knowledge_with_scores(db, tenant_id, current_message, top_k=3)
    good_chunks = [r for r in rag_results if r["distance"] < RAG_CONFIDENCE_THRESHOLD]
    rag_text = "\n".join(r["content"] for r in good_chunks)

    # Sales script context
    sales_script = settings_obj.sales_script_text if settings_obj else ""
    sales_script_snippet = sales_script[:6000] if sales_script else ""

    # Check confidence if required:
    # Script and FAQ are primary knowledge sources — bot should answer based on them.
    # RAG is supplementary. Handoff only when no script, no FAQ, and no confident RAG.
    has_primary_source = bool(sales_script_snippet.strip()) or bool(faq_text.strip())
    has_confident_rag = bool(good_chunks)
    if require_confidence and not has_primary_source and not has_confident_rag:
        if rag_results:
            logger.info(
                "rag_low_confidence",
                tenant_id=tenant_id,
                dialog_id=dialog_id,
                query=current_message[:50],
                min_distance=min(r["distance"] for r in rag_results),
            )
        else:
            logger.info(
                "no_knowledge_source",
                tenant_id=tenant_id,
                dialog_id=dialog_id,
                query=current_message[:50],
            )
        return None

    # Conversation context
    conv_context = await build_context(db, dialog_id)

    # Guard against empty current message
    if not current_message or not current_message.strip():
        logger.warning("generate_response_empty_message", dialog_id=dialog_id, tenant_id=tenant_id)
        return "Извините, я не получил текст сообщения. Можете повторить?"

    # Build objection-aware system prompt
    full_system = system_prompt.strip()
    if sales_script_snippet:
        full_system += (
            "\n\n[СКРИПТ ПРОДАЖ]\n"
            f"{sales_script_snippet}\n\n"
            "Следуй скрипту продаж, но адаптируй под диалог. "
            "Если клиент выражает возражения (дорого, подумаю, не нужно, сравниваю с конкурентами) — "
            "отрабатывай их как опытный продавец: сочувствуй, задавай уточняющие вопросы, "
            "покажи ценность, предложи выгоду. Не дави, но будь убедительным."
        )
    else:
        full_system += (
            "\n\nЕсли клиент выражает возражения (дорого, подумаю, не нужно, сравниваю с конкурентами) — "
            "отрабатывай их как опытный продавец: сочувствуй, задавай уточняющие вопросы, "
            "покажи ценность, предложи выгоду. Не дави, но будь убедительным."
        )

    messages: list[dict[str, str]] = []
    if full_system:
        messages.append({"role": "system", "content": full_system})
    if faq_text and faq_text.strip():
        messages.append({"role": "system", "content": f"Частые вопросы и ответы:\n{faq_text}"})
    if rag_text and rag_text.strip():
        messages.append({"role": "system", "content": f"Релевантная информация из базы знаний:\n{rag_text}"})
    messages.extend(conv_context)
    messages.append({"role": "user", "content": current_message})

    # Use YandexGPT Pro for client-facing responses (higher quality)
    resp = await yandex_gpt_client.chat_completion(
        messages=messages,
        model="yandexgpt",
        temperature=0.7,
        max_tokens=1000,
    )
    answer = resp["choices"][0]["message"]["content"].strip()
    logger.info("llm_response_generated", tenant_id=tenant_id, dialog_id=dialog_id, answer=answer)
    return answer
