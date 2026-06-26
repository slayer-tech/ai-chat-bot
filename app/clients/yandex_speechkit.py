"""Async Yandex SpeechKit STT client."""

from typing import Optional

import httpx
import structlog
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


class YandexSpeechKitClient:
    """Client for Yandex SpeechKit Streaming STT."""

    def __init__(self) -> None:
        self.api_key = settings.YANDEX_SPEECHKIT_API_KEY
        self.folder_id = settings.YANDEX_SPEECHKIT_FOLDER_ID
        self.base_url = settings.YANDEX_SPEECHKIT_BASE_URL
        self.headers = {
            "Authorization": f"Api-Key {self.api_key}",
        }

    @retry(
        stop=stop_after_attempt(MAX_RETRIES),
        wait=wait_fixed(RETRY_DELAY_SECONDS),
        retry=retry_if_exception_type((Exception,)),
        reraise=True,
    )
    async def _recognize_with_retry(
        self,
        audio_bytes: bytes,
        format_: str = "oggopus",
        sample_rate_hertz: int = 48000,
        lang: str = "ru-RU",
    ) -> dict:
        """Internal SpeechKit call with retry."""
        params = {
            "folderId": self.folder_id,
            "lang": lang,
            "format": format_,
            "sampleRateHertz": sample_rate_hertz,
        }
        async with httpx.AsyncClient(timeout=30.0, headers=self.headers) as client:
            resp = await client.post(
                self.base_url,
                params=params,
                content=audio_bytes,
            )
            resp.raise_for_status()
            return resp.json()

    async def recognize(
        self,
        audio_bytes: bytes,
        format_: str = "oggopus",
        sample_rate_hertz: int = 48000,
        lang: str = "ru-RU",
    ) -> str:
        """Transcribe audio bytes to text with 5 retries every 5 seconds.

        Raises:
            ExternalAPIError: if all retries are exhausted.
        """
        logger.info(
            "speechkit_recognize_request",
            format=format_,
            sample_rate=sample_rate_hertz,
            size_bytes=len(audio_bytes),
        )
        try:
            data = await self._recognize_with_retry(
                audio_bytes,
                format_=format_,
                sample_rate_hertz=sample_rate_hertz,
                lang=lang,
            )
        except Exception as exc:
            logger.error("speechkit_recognize_failed_after_retries", error=str(exc))
            raise ExternalAPIError(f"SpeechKit error: {exc}", source="speechkit") from exc

        result = data.get("result", "")
        logger.info("speechkit_recognized", chars=len(result))
        return result


speechkit_client = YandexSpeechKitClient()
