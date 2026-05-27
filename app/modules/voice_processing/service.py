"""Voice message processing via Yandex SpeechKit."""

from pathlib import Path
from typing import Optional

import httpx
import structlog

from app.clients.yandex_speechkit import speechkit_client

logger = structlog.get_logger()
VOICE_TMP_DIR = Path("/tmp/ai_bot_voice")


def _detect_audio_format(audio: bytes) -> tuple[str, int]:
    """Detect audio format and sample rate from magic bytes.

    Returns:
        (format, sample_rate_hertz)
    """
    if audio[:4] == b"OggS":
        return "oggopus", 48000
    if audio[:3] == b"ID3" or (audio[:1] == b"\xff" and audio[1:2] in (b"\xfb", b"\xf3", b"\xf2")):
        return "mp3", 44100
    if audio[:4] == b"RIFF":
        return "lpcm", 16000
    # Default fallback
    return "oggopus", 48000


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
        format_, sample_rate = _detect_audio_format(audio)
        logger.info("voice_format_detected", format=format_, sample_rate=sample_rate, size=len(audio))
        text = await speechkit_client.recognize(audio, format_=format_, sample_rate_hertz=sample_rate)
        logger.info("voice_transcribed", url=voice_url, chars=len(text))
        return text
    except Exception as exc:
        logger.error("voice_processing_failed", url=voice_url, error=str(exc))
        return ""
