"""Async Groq client for cheap testing (OpenAI-compatible API)."""

from typing import Any, Optional

import httpx
import structlog
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import ExternalAPIError

logger = structlog.get_logger()

DEFAULT_CHEAP_MODEL = "llama-3.1-8b-instant"


class GroqClient:
    """Groq API client (OpenAI-compatible)."""

    def __init__(self) -> None:
        self.base_url = "https://api.groq.com/openai/v1"
        self.api_key = settings.GROQ_API_KEY
        self.timeout = 20
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.NetworkError)),
        reraise=True,
    )
    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> dict[str, Any]:
        """Send a chat completion request to Groq."""
        payload = {
            "model": model or DEFAULT_CHEAP_MODEL,
            "messages": messages,
            "temperature": temperature,
        }
        if max_tokens:
            payload["max_tokens"] = max_tokens

        async with httpx.AsyncClient(timeout=self.timeout, headers=self.headers) as client:
            try:
                resp = await client.post(f"{self.base_url}/chat/completions", json=payload)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPStatusError as exc:
                logger.error(
                    "groq_chat_error",
                    status=exc.response.status_code,
                    body=exc.response.text,
                )
                raise ExternalAPIError(f"Groq error: {exc.response.status_code}") from exc
            except Exception as exc:
                logger.error("groq_chat_exception", error=str(exc))
                raise ExternalAPIError("Groq request failed") from exc

    def classify_intent_model(self) -> str:
        return DEFAULT_CHEAP_MODEL


groq_client = GroqClient()
