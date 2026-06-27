"""Async OpenAI client for chat and embeddings."""

from typing import Any, Optional

import structlog
from openai import AsyncOpenAI
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_fixed,
)

from app.core.config import settings
from app.core.exceptions import ExternalAPIError

logger = structlog.get_logger()

MAX_RETRIES = 5
RETRY_DELAY_SECONDS = 5

# Models that require the newer `max_completion_tokens` parameter instead of
# the legacy `max_tokens` (e.g. GPT-5.x and OpenAI reasoning series).
_MAX_COMPLETION_TOKENS_PREFIXES = ("gpt-5", "o1", "o3", "o4")


def _max_tokens_param(model: str) -> str:
    """Return the correct token-limit key for the given model."""
    lowered = model.lower()
    if any(lowered.startswith(prefix) for prefix in _MAX_COMPLETION_TOKENS_PREFIXES):
        return "max_completion_tokens"
    return "max_tokens"


class OpenAIClient:
    """Unified async client for OpenAI API."""

    def __init__(self) -> None:
        self.client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
        )

    @retry(
        stop=stop_after_attempt(MAX_RETRIES),
        wait=wait_fixed(RETRY_DELAY_SECONDS),
        retry=retry_if_exception_type((Exception,)),
        reraise=True,
    )
    async def _chat_completion_with_retry(
        self,
        messages: list[dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        tools: Optional[list[dict[str, Any]]] = None,
    ) -> dict[str, Any]:
        """Internal chat completion call with retry."""
        model = model or settings.OPENAI_GPT_MODEL
        token_key = _max_tokens_param(model)
        kwargs: dict[str, Any] = {
            "model": model,
            "messages": messages,  # type: ignore[arg-type]
            "temperature": temperature,
            token_key: max_tokens,
        }
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = "auto"
        return await self.client.chat.completions.create(**kwargs)

    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        tools: Optional[list[dict[str, Any]]] = None,
    ) -> dict[str, Any]:
        """Call OpenAI chat completion with 5 retries every 5 seconds.

        Returns Groq-compatible format for backwards compatibility:
        {"choices": [{"message": {"role": "assistant", "content": "...",
        "tool_calls": [...]}}]}

        Raises:
            ExternalAPIError: if all retries are exhausted.
        """
        model = model or settings.OPENAI_GPT_MODEL
        logger.info(
            "openai_chat_request",
            model=model,
            messages_count=len(messages),
            temperature=temperature,
            max_tokens=max_tokens,
            tools_count=len(tools) if tools else 0,
        )
        try:
            resp = await self._chat_completion_with_retry(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                tools=tools,
            )
        except Exception as exc:
            logger.error("openai_chat_failed_after_retries", error=str(exc))
            raise ExternalAPIError(f"OpenAI chat failed: {exc}", source="openai") from exc

        message = resp.choices[0].message
        result_message: dict[str, Any] = {
            "role": message.role,
            "content": (message.content or "").strip(),
        }
        if getattr(message, "tool_calls", None):
            result_message["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": tc.type,
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    },
                }
                for tc in message.tool_calls
            ]
        return {"choices": [{"message": result_message}]}

    @retry(
        stop=stop_after_attempt(MAX_RETRIES),
        wait=wait_fixed(RETRY_DELAY_SECONDS),
        retry=retry_if_exception_type((Exception,)),
        reraise=True,
    )
    async def _embed_with_retry(self, texts: list[str]) -> list[list[float]]:
        """Internal embedding call with retry."""
        resp = await self.client.embeddings.create(
            input=texts,
            model=settings.OPENAI_EMBEDDING_MODEL,
            dimensions=settings.OPENAI_EMBEDDING_DIMENSION,
        )
        return [item.embedding for item in resp.data]

    async def embed(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings with 5 retries every 5 seconds.

        Raises:
            ExternalAPIError: if all retries are exhausted.
        """
        if not texts:
            return []
        valid_texts = [t for t in texts if t.strip()]
        if not valid_texts:
            return [[] for _ in texts]

        logger.info("openai_embedding_request", texts_count=len(valid_texts))
        try:
            embeddings = await self._embed_with_retry(valid_texts)
        except Exception as exc:
            logger.error("openai_embedding_failed_after_retries", error=str(exc))
            raise ExternalAPIError(f"OpenAI embedding failed: {exc}", source="openai") from exc

        result: list[list[float]] = []
        emb_iter = iter(embeddings)
        for t in texts:
            if t.strip():
                result.append(next(emb_iter))
            else:
                result.append([0.0] * settings.OPENAI_EMBEDDING_DIMENSION)
        return result


openai_client = OpenAIClient()
