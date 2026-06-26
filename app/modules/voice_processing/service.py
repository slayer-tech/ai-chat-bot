"""Voice message processing via Yandex SpeechKit."""

import subprocess
from pathlib import Path
from typing import Optional

import httpx
import structlog

from app.clients.yandex_speechkit import speechkit_client
from app.core.exceptions import ExternalAPIError

logger = structlog.get_logger()
VOICE_TMP_DIR = Path("/tmp/ai_bot_voice")


def _is_ogg_opus(audio: bytes) -> bool:
    """Check if audio is already OGG Opus."""
    return audio[:4] == b"OggS"


def _convert_to_ogg_opus(audio: bytes) -> bytes:
    """Convert any audio to OGG Opus using ffmpeg."""
    proc = subprocess.run(
        [
            "ffmpeg",
            "-i", "pipe:0",
            "-c:a", "libopus",
            "-b:a", "24k",
            "-ar", "48000",
            "-f", "ogg",
            "pipe:1",
        ],
        input=audio,
        capture_output=True,
    )
    if proc.returncode != 0:
        stderr = proc.stderr.decode("utf-8", errors="replace")[:200]
        logger.error("ffmpeg_convert_failed", stderr=stderr)
        raise RuntimeError(f"ffmpeg failed: {stderr}")
    return proc.stdout


def get_voice_duration_seconds(audio_bytes: bytes) -> Optional[float]:
    """Get audio duration in seconds using ffprobe."""
    try:
        proc = subprocess.run(
            [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                "-",
            ],
            input=audio_bytes,
            capture_output=True,
        )
        if proc.returncode == 0:
            return float(proc.stdout.decode().strip())
    except Exception as exc:
        logger.warning("ffprobe_duration_failed", error=str(exc))
    return None


async def download_voice(url: str) -> bytes:
    """Download voice file from URL."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.content


async def process_voice_if_needed(voice_url: Optional[str], audio_bytes: Optional[bytes] = None) -> str:
    """Download, transcribe via Yandex SpeechKit, and return text.

    Args:
        voice_url: URL to download audio from (ignored if audio_bytes provided).
        audio_bytes: Pre-downloaded audio bytes.

    Returns:
        Transcribed text or empty string if no voice_url/audio_bytes.

    Raises:
        ExternalAPIError: if SpeechKit fails after all retries.
    """
    if not voice_url and not audio_bytes:
        return ""
    try:
        audio = audio_bytes if audio_bytes is not None else await download_voice(voice_url)
        if not _is_ogg_opus(audio):
            logger.info("voice_converting_to_ogg_opus", original_size=len(audio))
            audio = _convert_to_ogg_opus(audio)
            logger.info("voice_converted", new_size=len(audio))
        text = await speechkit_client.recognize(audio)
        logger.info("voice_transcribed", url=voice_url, chars=len(text))
        return text
    except ExternalAPIError:
        raise
    except Exception as exc:
        logger.error("voice_processing_failed", url=voice_url, error=str(exc))
        raise ExternalAPIError(f"Voice processing failed: {exc}", source="voice_processing") from exc
