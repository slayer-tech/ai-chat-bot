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

# Cosine distance threshold: lower = more similar.
# Yandex Embeddings 256-dim: practical cutoff ~0.60 for medical content.
# Debug endpoint /api/v1/admin/knowledge/search shows actual distances.
RAG_CONFIDENCE_THRESHOLD = 0.72


def _parse_llm_tags(text: str) -> tuple[str, Optional[str], bool, bool, bool]:
    """Parse special tags from LLM response.

    Returns:
        (clean_text, stage_name, script_complete, is_off_topic, delete_request)
    """
    script_complete = "[SCRIPT_COMPLETE]" in text
    is_off_topic = "[OFF_TOPIC]" in text
    delete_request = "[DELETE_REQUEST]" in text

    # Extract stage
    stage_match = re.search(r"\[STAGE:([^\]]+)\]", text)
    stage_name = stage_match.group(1).strip() if stage_match else None

    # Clean tags from visible text
    clean = text
    for tag in ["[SCRIPT_COMPLETE]", "[OFF_TOPIC]", "[UNSURE]", "[DELETE_REQUEST]"]:
        clean = clean.replace(tag, "")
    clean = re.sub(r"\[STAGE:[^\]]+\]", "", clean)
    clean = clean.strip()
    return clean, stage_name, script_complete, is_off_topic, delete_request


async def generate_response(
    db: AsyncSession,
    tenant_id: int,
    external_user_id: str,
    current_message: str,
    require_confidence: bool = True,
) -> dict[str, any]:
    """Generate a bot response using GPT-4o with RAG + memory + sales script.

    Returns:
        dict with keys: text, stage, script_complete, is_off_topic, delete_request
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

    # RAG with confidence scores — top 3 chunks to keep prompt short and cheap
    rag_results = await search_knowledge_with_scores(db, tenant_id, current_message, top_k=3)
    good_chunks = [r for r in rag_results if r["distance"] < RAG_CONFIDENCE_THRESHOLD]
    rag_text = "\n".join(r["content"] for r in good_chunks)

    logger.info(
        "rag_search_results",
        tenant_id=tenant_id,
        dialog_id=dialog_id,
        query=current_message[:50],
        chunks_found=len(rag_results),
        confident_chunks=len(good_chunks),
        best_distance=rag_results[0]["distance"] if rag_results else None,
        rag_text_preview=rag_text[:200] if rag_text else None,
    )

    # Sales script context — truncated to keep prompt cheap
    sales_script = settings_obj.sales_script_text if settings_obj else ""
    sales_script_snippet = sales_script[:2000] if sales_script else ""

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
            "ПРАВИЛО ПЛЕЙСХОЛДЕРОВ: Не выводи клиенту текст в квадратных скобках [имя], [цена], [дата]. "
            "Подставляй реальные значения из диалога/RAG. Если неизвестно — предложи запись или конкретные варианты.\n\n"
            "КРИТИЧЕСКИЕ ЗАПРЕТЫ (нарушение = увольнение):\n"
            "- НИКОГДА не придумывай цены и НЕ гадай. НО: если цена точно указана в базе знаний (RAG) или FAQ — назови её.\n"
            "  ПРАВИЛЬНО (цена есть в RAG): 'Консультация бесплатная при записи через сайт или WhatsApp.'\n"
            "  ПРАВИЛЬНО (цены нет в источниках): 'Точную стоимость скажет врач на консультации. Могу записать.'\n"
            "  НЕПРАВИЛЬНО: 'имплант от 40 000' (если в источниках нет этой цены).\n"
            "- НИКОГДА не переноси цену одной услуги на другую. Цена удаления зуба (4000₽) НЕ является ценой импланта.\n"
            "  Если цена указана для конкретной услуги (например, удаление) — не применяй её к другой услуге (имплант, коронка).\n"
            "- НИКОГДА не говори 'уточню и вернусь', 'спрошу у коллег', 'перезвоню' — ты бот, не можешь этого делать.\n"
            "  ПРАВИЛЬНО: 'Давайте запишем вас на консультацию — врач ответит на все вопросы.'\n"
            "- НИКОГДА не здоровайся ('Здравствуйте', 'Привет') если это не первое сообщение в диалоге.\n"
            "- Если клиент спрашивает цену на услугу, которой нет в источниках — направь на консультацию/запись, не называй цифру.\n\n"
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
            "Если клиент прошёл последний этап — добавь тег [SCRIPT_COMPLETE]."
        )

    full_system += (
        "\n\nПРАВИЛО РАБОТЫ С ИСТОЧНИКАМИ:\n"
        "1. Отвечай из базы знаний (RAG) или FAQ — приоритет №1.\n"
        "2. Информационные вопросы (цена, Wi-Fi, адрес, время) — нормальные, отвечай из базы.\n"
        "3. Нет ответа в источниках — [UNSURE], предложи уточнить.\n"
        "4. Off-topic (погода, политика) — [OFF_TOPIC], верни к теме.\n"
        "5. Не придумывай. Если цена есть в RAG — назови. Если нет — предложи консультацию.\n\n"
        "ЕСЛИ КЛИЕНТ ПРОСИТ УДАЛИТЬ ДАННЫЕ — [DELETE_REQUEST]."
    )

    # Embed RAG/FAQ directly into system prompt for higher priority vs sales script
    sources_text = ""
    if rag_text and rag_text.strip():
        sources_text += f"\n\n[БАЗА ЗНАНИЙ (релевантные фрагменты)]\n{rag_text}\n"
    if faq_text and faq_text.strip():
        sources_text += f"\n[FAQ]\n{faq_text}\n"
    if sources_text:
        full_system += sources_text

    messages: list[dict[str, str]] = []
    if full_system:
        messages.append({"role": "system", "content": full_system})
    messages.extend(conv_context)
    messages.append({"role": "user", "content": current_message})

    # Smart model switching: Lite for RAG-based queries (cheap), Pro for sales/complex
    use_lite = bool(good_chunks) and bool(rag_text.strip())
    resp = await yandex_gpt_client.chat_completion(
        messages=messages,
        model="yandexgpt-lite" if use_lite else "yandexgpt",
        temperature=0.7,
        max_tokens=1000,
    )
    raw_answer = resp["choices"][0]["message"]["content"].strip()
    clean_text, stage_name, script_complete, is_off_topic, delete_request = _parse_llm_tags(raw_answer)

    # Post-processing: catch any remaining [placeholder] brackets and replace with fallback
    import re as _re
    def _placeholder_fallback(match: _re.Match) -> str:
        key = match.group(1).strip().lower()
        fallbacks = {
            "цена": "Давайте запишем на консультацию — врач назовет точную стоимость",
            "цена_руб": "Давайте запишем на консультацию — врач назовет точную стоимость",
            "стоимость": "Давайте запишем на консультацию — врач назовет точную стоимость",
            "дата": "Когда вам удобно",
            "время": "На какое время",
            "имя": "",
            "фио": "",
            "телефон": "",
            "email": "",
            "адрес": "",
            "размер": "",
            "продукт": "",
        }
        return fallbacks.get(key, "")

    if _re.search(r'\[[^\]]+\]', clean_text):
        logger.warning("placeholder_leak_detected", dialog_id=dialog_id, tenant_id=tenant_id, raw=clean_text[:200])
        clean_text = _re.sub(r'\[([^\]]+)\]', _placeholder_fallback, clean_text)
        # Clean up awkward spaces after removing empty fallbacks
        clean_text = _re.sub(r'\s+,', ',', clean_text)
        clean_text = _re.sub(r',\s*,', ',', clean_text)
        clean_text = _re.sub(r'\s+', ' ', clean_text).strip()

    logger.info(
        "llm_response_generated",
        tenant_id=tenant_id,
        dialog_id=dialog_id,
        stage=stage_name,
        script_complete=script_complete,
        is_off_topic=is_off_topic,
        delete_request=delete_request,
        answer=clean_text,
    )
    return {
        "text": clean_text,
        "stage": stage_name,
        "script_complete": script_complete,
        "is_off_topic": is_off_topic,
        "delete_request": delete_request,
    }
