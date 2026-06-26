"""LLM router: all text queries go directly to GPT-5.4-mini."""

import re
from typing import Optional

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.openai_client import openai_client

from app.core.config import settings as app_settings
from app.core.exceptions import ExternalAPIError
from app.db.models import Dialog
from app.modules.conversation_memory.service import build_context
from app.modules.rag_knowledge_base.service import search_knowledge_with_scores

logger = structlog.get_logger()

# Cosine distance threshold: lower = more similar.
# OpenAI text-embedding-3-small: relevant chunks usually ~0.15-0.35.
# Debug endpoint /api/v1/admin/knowledge/search shows actual distances.
RAG_CONFIDENCE_THRESHOLD = 0.35


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


async def _handle_llm_failure(db: AsyncSession, dialog: Optional[Dialog], error_text: str) -> None:
    """Hand off dialog to manager and record the error."""
    if not dialog:
        return
    from datetime import datetime, timezone

    from app.modules.conversation_memory.service import summarize_dialog
    from app.modules.crm_integration.service import handle_handoff
    from app.modules.trigger_engine.service import _cancel_pending_triggers

    dialog.status = "handoff"
    dialog.last_error_text = f"LLM error: {error_text}"
    dialog.last_error_at = datetime.now(timezone.utc)
    await db.commit()
    await _cancel_pending_triggers(db, dialog.id)
    summary = await summarize_dialog(db, dialog.id)
    await handle_handoff(db, dialog, "llm_api_failure", summary)
    logger.info("llm_failure_handoff", dialog_id=dialog.id, error=error_text)


def _build_funnel_overview(stages: list, current_stage_name: Optional[str]) -> str:
    """Build a funnel overview string for the LLM.

    Example output:
      ВОРОНКА:
      1. greeting — Приветствие (ТЕКУЩИЙ)
      2. diagnosis — Уточнение проблемы
      3. pricing — Обсуждение цены
      4. booking — Запись на приём
      5. closing — Завершение
    """
    if not stages:
        return ""
    lines = ["ВОРОНКА ПРОДАЖ (веди клиента к записи):"]
    for idx, stage in enumerate(stages, start=1):
        label = getattr(stage, "label", str(stage))
        name = getattr(stage, "name", str(stage))
        marker = " ⬅ ТЕКУЩИЙ" if name == current_stage_name else ""
        end_marker = " [ФИНАЛ]" if getattr(stage, "is_end", False) else ""
        lines.append(f"{idx}. [{name}] {label}{marker}{end_marker}")
    return "\n".join(lines)


async def generate_response(
    db: AsyncSession,
    tenant_id: int,
    external_user_id: str,
    current_message: str,
    require_confidence: bool = True,
) -> dict[str, any]:
    """Generate a bot response using GPT-4o with RAG + memory + state machine.

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

    # Fetch tenant settings and dialog stages
    from app.modules.dialog_stages.service import list_stages
    from app.modules.tenants.service import get_tenant_settings

    settings_obj = await get_tenant_settings(db, tenant_id)
    system_prompt = settings_obj.system_prompt if settings_obj else ""
    if not system_prompt:
        system_prompt = (
            "You are a helpful Russian sales assistant. "
            "Answer concisely, professionally, and in Russian."
        )

    # Load state machine stages
    all_stages = await list_stages(db, tenant_id)
    current_stage_name = dialog.current_stage if dialog else None
    current_stage = None
    if current_stage_name and all_stages:
        from app.modules.dialog_stages.service import get_stage_by_name
        current_stage = await get_stage_by_name(db, tenant_id, current_stage_name)

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
        current_stage=current_stage_name,
        stages_count=len(all_stages),
    )

    # Sales script context — truncated to keep prompt cheap
    sales_script = settings_obj.sales_script_text if settings_obj else ""
    sales_script_snippet = sales_script[:4000] if sales_script else ""

    # Check confidence if required:
    has_primary_source = bool(sales_script_snippet.strip()) or bool(current_stage)
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
        return {"text": None, "stage": None, "script_complete": False, "is_off_topic": False, "delete_request": False}

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
            "delete_request": False,
        }

    # Build system prompt
    full_system = system_prompt.strip()

    # Base guard rails
    full_system += (
        "\n\nКРИТИЧЕСКИЕ ЗАПРЕТЫ (нарушение = увольнение):\n"
        "- НИКОГДА не придумывай цены и НЕ гадай. НО: если цена точно указана в базе знаний (RAG) или FAQ — назови её.\n"
        "  ПРАВИЛЬНО (цена есть в RAG): 'Консультация бесплатная при записи через сайт или WhatsApp.'\n"
        "  ПРАВИЛЬНО (цены нет в источниках): 'Точную стоимость скажет врач на консультации. Могу записать.'\n"
        "  НЕПРАВИЛЬНО: 'имплант от 40 000' (если в источниках нет этой цены).\n"
        "- НИКОГДА не переноси цену одной услуги на другую.\n"
        "- НИКОГДА не говори 'уточню и вернусь', 'спрошу у коллег', 'перезвоню' — ты бот, не можешь этого делать.\n"
        "  ПРАВИЛЬНО: 'Давайте запишем вас на консультацию — врач ответит на все вопросы.'\n"
        "- НИКОГДА не здоровайся ('Здравствуйте', 'Привет') если это не первое сообщение в диалоге.\n"
        "- Если клиент спрашивает цену на услугу, которой нет в источниках — направь на консультацию/запись, не называй цифру.\n"
        "- Не выводи клиенту текст в квадратных скобках [имя], [цена], [дата]. Подставляй реальные значения из диалога/RAG.\n"
    )

    # Funnel overview (state machine)
    funnel_overview = _build_funnel_overview(all_stages, current_stage_name)
    if funnel_overview:
        full_system += f"\n\n{funnel_overview}\n\n"
        full_system += (
            "Твоя задача — вести клиента по воронке к записи (booking) и завершению (closing). "
            "После каждого ответа добавь тег [STAGE:название_этапа] на новой строке. "
            "Название этапа должно точно совпадать с именем в квадратных скобках из воронки. "
            "Если клиент согласился на запись — переходи к [STAGE:booking]. "
            "Если диалог завершён (запись подтверждена или клиент попрощался) — [STAGE:closing] + [SCRIPT_COMPLETE]."
        )

    # Current stage prompt
    if current_stage and current_stage.system_prompt:
        full_system += (
            f"\n\n[ТЕКУЩИЙ ЭТАП: {current_stage.label} ({current_stage.name})]\n"
            f"{current_stage.system_prompt.strip()}\n"
        )
    elif sales_script_snippet:
        # Fallback to legacy sales script if no state machine stages
        full_system += (
            "\n\n[СКРИПТ ПРОДАЖ]\n"
            f"{sales_script_snippet}\n\n"
            "ВАЖНО: Это не готовые сообщения для копирования — это инструкции, которые ты должен понять и применить. "
            "Пиши своими словами, адаптируя под каждого клиента. "
            "Следуй скрипту продаж, но адаптируй под диалог. "
            "Если клиент выражает возражения (дорого, подумаю, не нужно, сравниваю с конкурентами) — "
            "отрабатывай их как опытный продавец: сочувствуй, задавай уточняющие вопросы, "
            "покажи ценность, предложи выгоду. Не дави, но будь убедительным."
        )

    # Embed RAG directly into system prompt for higher priority vs sales script
    if rag_text and rag_text.strip():
        full_system += f"\n\n[БАЗА ЗНАНИЙ (релевантные фрагменты)]\n{rag_text}\n"

    full_system += (
        "\n\nПРАВИЛО РАБОТЫ С ИСТОЧНИКАМИ:\n"
        "1. Отвечай из базы знаний (RAG) или FAQ — приоритет №1.\n"
        "2. Информационные вопросы (цена, Wi-Fi, адрес, время) — нормальные, отвечай из базы.\n"
        "3. Нет ответа в источниках — [UNSURE], предложи уточнить.\n"
        "4. Off-topic (погода, политика) — [OFF_TOPIC], верни к теме.\n"
        "5. Не придумывай. Если цена есть в RAG — назови. Если нет — предложи консультацию.\n\n"
        "ЕСЛИ КЛИЕНТ ПРОСИТ УДАЛИТЬ ДАННЫЕ — [DELETE_REQUEST]."
    )

    messages: list[dict[str, str]] = []
    if full_system:
        messages.append({"role": "system", "content": full_system})
    messages.extend(conv_context)
    messages.append({"role": "user", "content": current_message})

    # Single model: GPT-5.4-mini for everything.
    try:
        resp = await openai_client.chat_completion(
            messages=messages,
            model=app_settings.OPENAI_GPT_MODEL,
            temperature=0.7,
            max_tokens=1000,
        )
    except ExternalAPIError as exc:
        logger.error(
            "llm_openai_failed",
            tenant_id=tenant_id,
            dialog_id=dialog_id,
            error=str(exc),
        )
        await _handle_llm_failure(db, dialog, str(exc))
        return {
            "text": "Извините, не удалось обработать запрос. Перевожу на менеджера.",
            "stage": current_stage_name,
            "script_complete": False,
            "is_off_topic": False,
            "delete_request": False,
        }
    raw_answer = resp["choices"][0]["message"]["content"].strip()
    clean_text, stage_name, script_complete, is_off_topic, delete_request = _parse_llm_tags(raw_answer)

    # Validate stage_name against known stages; keep current if unknown
    validated_stage = stage_name
    if stage_name and all_stages:
        valid_names = {s.name for s in all_stages}
        if stage_name not in valid_names:
            logger.warning(
                "llm_unknown_stage",
                tenant_id=tenant_id,
                dialog_id=dialog_id,
                stage=stage_name,
                valid_names=list(valid_names),
            )
            validated_stage = current_stage_name

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
        stage=validated_stage,
        raw_stage=stage_name,
        script_complete=script_complete,
        is_off_topic=is_off_topic,
        delete_request=delete_request,
        answer=clean_text,
    )
    return {
        "text": clean_text,
        "stage": validated_stage,
        "script_complete": script_complete,
        "is_off_topic": is_off_topic,
        "delete_request": delete_request,
    }
