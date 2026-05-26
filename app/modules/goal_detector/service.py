"""Goal detection: check if the target action (sale, appointment, etc.) is reached."""

from typing import Optional

import structlog

from app.clients.yandex_gpt import yandex_gpt_client

logger = structlog.get_logger()

_TARGET_LABELS = {
    "appointment": "запись на приём/встречу",
    "sale": "продажа/закрытие сделки",
    "support": "получение ответа на вопрос",
}


async def check_goal_reached(
    target_action: Optional[str],
    conversation_context: list[dict[str, str]],
) -> bool:
    """Check if the target action has been reached based on conversation history.

    Uses a lightweight LLM call to evaluate whether the goal is achieved.

    Args:
        target_action: One of 'appointment', 'sale', 'support', or None.
        conversation_context: Last N messages of the conversation.

    Returns:
        True if the goal is reached, False otherwise.
    """
    if not target_action or target_action not in _TARGET_LABELS:
        return False

    label = _TARGET_LABELS[target_action]
    history = "\n".join(
        f"{'Клиент' if m['role'] == 'user' else 'Ассистент'}: {m['content']}"
        for m in conversation_context[-6:]
    )

    system_prompt = (
        f"Ты — аналитик диалогов. Определи, достигнуто ли целевое действие: {label}.\n"
        "Ответь ТОЛЬКО одним словом: ДА или НЕТ.\n"
        "ДА — если клиент согласился на запись, покупку, или получил исчерпывающий ответ.\n"
        "НЕТ — если клиент ещё спрашивает, сомневается, или диалог не завершён."
    )

    try:
        resp = await yandex_gpt_client.complete(
            system_prompt=system_prompt,
            user_prompt=f"Диалог:\n{history}\n\nДостигнуто ли целевое действие ({label})?",
            temperature=0.1,
            max_tokens=10,
        )
        result = resp.strip().upper()
        reached = "ДА" in result or "YES" in result
        logger.info(
            "goal_check_result",
            target_action=target_action,
            reached=reached,
            raw=resp,
        )
        return reached
    except Exception as exc:
        logger.error("goal_check_failed", error=str(exc))
        return False
