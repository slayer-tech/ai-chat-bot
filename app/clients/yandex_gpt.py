"""Async YandexGPT Lite client for cheap tasks in Russian."""

import json
from typing import Any, Optional

import httpx
import structlog
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import ExternalAPIError

logger = structlog.get_logger()


class YandexGPTClient:
    """YandexGPT Lite API client (Yandex Cloud, data stays in Russia)."""

    def __init__(self) -> None:
        self.api_key = settings.YANDEX_SPEECHKIT_API_KEY
        self.folder_id = settings.YANDEX_SPEECHKIT_FOLDER_ID
        self.base_url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
        self.headers = {
            "Authorization": f"Api-Key {self.api_key}",
            "Content-Type": "application/json",
        }

    def _model_uri(self, model: Optional[str] = None) -> str:
        if model and ("pro" in model.lower() or "yandexgpt" in model.lower() and "lite" not in model.lower()):
            return f"gpt://{self.folder_id}/yandexgpt/latest"
        return f"gpt://{self.folder_id}/yandexgpt-lite/latest"

    def _headers(self, api_key: Optional[str] = None) -> dict[str, str]:
        key = api_key or self.api_key
        return {
            "Authorization": f"Api-Key {key}",
            "Content-Type": "application/json",
        }

    def _folder(self, folder_id: Optional[str] = None) -> str:
        return folder_id or self.folder_id

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.NetworkError)),
        reraise=True,
    )
    async def complete(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 500,
        api_key: Optional[str] = None,
        folder_id: Optional[str] = None,
    ) -> str:
        """Send a completion request to YandexGPT Lite.

        Args:
            system_prompt: System instruction.
            user_prompt: User text / task.
            temperature: Sampling temperature.
            max_tokens: Max tokens to generate.
            api_key: Optional tenant-specific API key.
            folder_id: Optional tenant-specific folder ID.

        Returns:
            Generated text.
        """
        payload = {
            "modelUri": f"gpt://{self._folder(folder_id)}/yandexgpt-lite/latest",
            "completionOptions": {
                "stream": False,
                "temperature": temperature,
                "maxTokens": str(max_tokens),
            },
            "messages": [
                {"role": "system", "text": system_prompt},
                {"role": "user", "text": user_prompt},
            ],
        }
        async with httpx.AsyncClient(timeout=20.0, headers=self._headers(api_key)) as client:
            try:
                resp = await client.post(self.base_url, json=payload)
                resp.raise_for_status()
                data = resp.json()
                result = data["result"]["alternatives"][0]["message"]["text"]
                logger.info("yandexgpt_lite_complete", chars=len(result))
                return result.strip()
            except httpx.HTTPStatusError as exc:
                logger.error(
                    "yandexgpt_error",
                    status=exc.response.status_code,
                    body=exc.response.text,
                )
                raise ExternalAPIError(f"YandexGPT error: {exc.response.status_code}") from exc
            except Exception as exc:
                logger.error("yandexgpt_exception", error=str(exc))
                raise ExternalAPIError("YandexGPT request failed") from exc

    async def chat_completion(
        self,
        messages: list[dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500,
        api_key: Optional[str] = None,
        folder_id: Optional[str] = None,
    ) -> dict[str, Any]:
        """OpenAI-compatible chat completion wrapper for YandexGPT.

        Converts 'content' keys to 'text' and returns Groq-compatible shape.
        """
        yandex_messages = []
        for m in messages:
            role = m.get("role", "user")
            text = m.get("content", "")
            yandex_messages.append({"role": role, "text": text})

        folder = self._folder(folder_id)
        if model and ("pro" in model.lower() or ("yandexgpt" in model.lower() and "lite" not in model.lower())):
            model_uri = f"gpt://{folder}/yandexgpt/latest"
        else:
            model_uri = f"gpt://{folder}/yandexgpt-lite/latest"

        payload = {
            "modelUri": model_uri,
            "completionOptions": {
                "stream": False,
                "temperature": temperature,
                "maxTokens": str(max_tokens),
            },
            "messages": yandex_messages,
        }
        async with httpx.AsyncClient(timeout=20.0, headers=self._headers(api_key)) as client:
            try:
                resp = await client.post(self.base_url, json=payload)
                resp.raise_for_status()
                data = resp.json()
                result_text = data["result"]["alternatives"][0]["message"]["text"]
                logger.info("yandexgpt_chat_complete", chars=len(result_text))
                return {
                    "choices": [
                        {"message": {"role": "assistant", "content": result_text.strip()}}
                    ]
                }
            except httpx.HTTPStatusError as exc:
                logger.error(
                    "yandexgpt_error",
                    status=exc.response.status_code,
                    body=exc.response.text,
                )
                raise ExternalAPIError(f"YandexGPT error: {exc.response.status_code}") from exc
            except Exception as exc:
                logger.error("yandexgpt_exception", error=str(exc))
                raise ExternalAPIError("YandexGPT request failed") from exc


yandex_gpt_client = YandexGPTClient()
