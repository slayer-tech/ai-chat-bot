"""Voice message processing via Yandex SpeechKit."""

from pathlib import Path
from typing import Optional

import httpx
import structlog

from app.clients.yandex_speechkit import speechkit_client

logger = structlog.get_logger()
VOICE_TMP_DIR = Path("/tmp/ai_bot_voice")


async def download_voice(url: str) -> bytes:
    """Download voice file from URL."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.content


async def process_voice_if_needed(voice_url: Optional[str]) -> str:
    """Download, transcribe, and return text.

    Returns:
        Transcribed text or empty string if no voice_url.
    """
    if not voice_url:
        return ""
    try:
        audio = await download_voice(voice_url)
        text = await speechkit_client.recognize(audio)
        logger.info("voice_transcribed", url=voice_url, chars=len(text))
        return text
    except Exception as exc:
        logger.error("voice_processing_failed", url=voice_url, error=str(exc))
        return ""
