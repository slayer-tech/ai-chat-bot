"""Intent classification via GPT-4o (direct)."""

import json
from typing import Tuple

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

import json

from app.clients.yandex_gpt import yandex_gpt_client
from app.clients.redis_client import get_redis

logger = structlog.get_logger()

INTENTS = ["price", "meeting", "complaint", "handoff", "discount", "spam", "other", "fallback"]


async def classify_intent(text: str) -> Tuple[str, float]:
    """Classify intent using GPT-4o (or mini). Returns (intent, confidence).

    Args:
        text: Tokenized message text.

    Returns:
        Tuple of intent string and confidence score 0.0-1.0.
    """
    redis = await get_redis()
    cache_key = f"intent:{hash(text) % 1000000}"
    cached = await redis.get(cache_key)
    if cached:
        data = json.loads(cached)
        return data["intent"], data["confidence"]

    system_prompt = (
        "Ты классификатор намерений. Выбери одно намерение из списка и верни JSON:\n"
        f"Намерения: {INTENTS}\n"
        "Верни строго: {\"intent\": \"...\", \"confidence\": число от 0 до 1}\n"
        "Отвечай только JSON."
    )
    try:
        resp = await yandex_gpt_client.chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Сообщение: {text}"},
            ],
            temperature=0.3,
            max_tokens=100,
        )
        content = resp["choices"][0]["message"]["content"]
        # Strip markdown code fences if present
        content = content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("\n", 1)[0]
        data = json.loads(content)
        intent = data.get("intent", "fallback")
        confidence = float(data.get("confidence", 0.0))
        if intent not in INTENTS:
            intent = "fallback"
        await redis.setex(cache_key, 3600, json.dumps({"intent": intent, "confidence": confidence}))
        return intent, confidence
    except Exception as exc:
        logger.error("intent_classification_failed", error=str(exc))
        return "fallback", 0.0
