"""Async Yandex SpeechKit STT client."""

from typing import Optional

import httpx
import structlog
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import ExternalAPIError

logger = structlog.get_logger()


class YandexSpeechKitClient:
    """Client for Yandex SpeechKit Streaming STT."""

    def __init__(self) -> None:
        # Fallback to YANDEX_API_KEY if SpeechKit key is not configured
        self.api_key = settings.YANDEX_SPEECHKIT_API_KEY or settings.YANDEX_API_KEY
        self.folder_id = settings.YANDEX_SPEECHKIT_FOLDER_ID or settings.YANDEX_FOLDER_ID
        self.base_url = settings.YANDEX_SPEECHKIT_BASE_URL
        self.headers = {
            "Authorization": f"Api-Key {self.api_key}",
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.NetworkError)),
        reraise=True,
    )
    async def recognize(
        self,
        audio_bytes: bytes,
        format_: str = "oggopus",
        sample_rate_hertz: int = 48000,
        lang: str = "ru-RU",
    ) -> str:
        """Transcribe audio bytes to text.

        Args:
            audio_bytes: Raw audio data.
            format_: Audio format (oggopus, mp3, etc.).
            sample_rate_hertz: Sample rate.
            lang: Language code.

        Returns:
            Transcribed text.
        """
        params = {
            "folderId": self.folder_id,
            "lang": lang,
            "format": format_,
            "sampleRateHertz": sample_rate_hertz,
        }
        async with httpx.AsyncClient(timeout=30.0, headers=self.headers) as client:
            try:
                resp = await client.post(
                    self.base_url,
                    params=params,
                    content=audio_bytes,
                )
                resp.raise_for_status()
                data = resp.json()
                result = data.get("result", "")
                logger.info("speechkit_recognized", chars=len(result))
                return result
            except httpx.HTTPStatusError as exc:
                logger.error(
                    "speechkit_error",
                    status=exc.response.status_code,
                    body=exc.response.text,
                )
                raise ExternalAPIError(f"SpeechKit error: {exc.response.status_code}") from exc
            except Exception as exc:
                logger.error("speechkit_exception", error=str(exc))
                raise ExternalAPIError("SpeechKit request failed") from exc


speechkit_client = YandexSpeechKitClient()
