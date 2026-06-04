"""LLM router: all text queries go directly to GPT-4o."""

import re
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


def _parse_llm_tags(text: str) -> tuple[str, Optional[str], bool, bool]:
    """Parse special tags from LLM response.

    Returns:
        (clean_text, stage_name, script_complete, is_off_topic)
    """
    script_complete = "[SCRIPT_COMPLETE]" in text
    is_off_topic = "[OFF_TOPIC]" in text

    # Extract stage
    stage_match = re.search(r"\[STAGE:([^\]]+)\]", text)
    stage_name = stage_match.group(1).strip() if stage_match else None

    # Clean tags from visible text
    clean = text
    for tag in ["[SCRIPT_COMPLETE]", "[OFF_TOPIC]", "[UNSURE]"]:
        clean = clean.replace(tag, "")
    clean = re.sub(r"\[STAGE:[^\]]+\]", "", clean)
    clean = clean.strip()
    return clean, stage_name, script_complete, is_off_topic


async def generate_response(
    db: AsyncSession,
    tenant_id: int,
    external_user_id: str,
    current_message: str,
    require_confidence: bool = True,
) -> dict[str, any]:
    """Generate a bot response using GPT-4o with RAG + memory + sales script.

    Returns:
        dict with keys: text, stage, script_complete, is_off_topic
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

    # Script stages
    script_stages = settings_obj.script_stages if settings_obj else None
    stages_text = ""
    if script_stages:
        stages_text = "\n".join(f"{i+1}. {s}" for i, s in enumerate(script_stages))

    # Check confidence if required:
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
        return {"text": None, "stage": None, "script_complete": False, "is_off_topic": False}

    # Conversation context
    conv_context = await build_context(db, dialog_id)

    # Guard against empty current message
    if not current_message or not current_message.strip():
        logger.warning("generate_response_empty_message", dialog_id=dialog_id, tenant_id=tenant_id)
        return {
            "text": "Извините, я не получил текст сообщения. Можете повторить?",
            "stage": None,
            "script_complete": False,
            "is_off_topic": False,
        }

    # Build objection-aware system prompt
    full_system = system_prompt.strip()
    if sales_script_snippet:
        full_system += (
            "\n\n[СКРИПТ ПРОДАЖ]\n"
            f"{sales_script_snippet}\n\n"
            "ВАЖНО: Это не готовые сообщения для копирования — это инструкции, которые ты должен понять и применить. "
            "Пиши своими словами, адаптируя под каждого клиента. Не повторяй инструкции дословно — используй их как руководство.\n\n"
            "Если в скрипте есть плейсхолдеры в квадратных скобках [имя], [размер], [цена], [дата] и т.д. — "
            "подставляй реальные значения из диалога. Если значение неизвестно — задай уточняющий вопрос.\n\n"
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

    if stages_text:
        full_system += (
            f"\n\n[ЭТАПЫ СКРИПТА]\n{stages_text}\n\n"
            "Веди клиента по этапам скрипта. Определи текущий этап после каждого ответа. "
            "После текста ответа добавь тег [STAGE:название_этапа]. "
            "Если клиент прошёл последний этап — добавь тег [SCRIPT_COMPLETE]. "
            "Если вопрос клиента вообще не по теме — добавь тег [OFF_TOPIC] и мягко верни к теме."
        )

    full_system += (
        "\n\nВАЖНО: Отвечай ТОЛЬКО на основе предоставленной информации выше (скрипт, FAQ, база знаний). "
        "Если вопрос клиента по теме продукта/услуги, но ответа нет в источниках — "
        'начни сообщение с тега [UNSURE] и кратко предложи уточнить у менеджера. '
        "Не придумывай факты, которых нет в источниках."
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
    raw_answer = resp["choices"][0]["message"]["content"].strip()
    clean_text, stage_name, script_complete, is_off_topic = _parse_llm_tags(raw_answer)

    logger.info(
        "llm_response_generated",
        tenant_id=tenant_id,
        dialog_id=dialog_id,
        stage=stage_name,
        script_complete=script_complete,
        is_off_topic=is_off_topic,
        answer=clean_text,
    )
    return {
        "text": clean_text,
        "stage": stage_name,
        "script_complete": script_complete,
        "is_off_topic": is_off_topic,
    }
