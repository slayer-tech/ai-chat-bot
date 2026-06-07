"""Async Yandex Embeddings client (text-search-doc / text-search-query)."""

import asyncio
from typing import Optional

import httpx
import structlog
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import ExternalAPIError

logger = structlog.get_logger()


class YandexEmbeddingsClient:
    """Client for Yandex Cloud text embeddings (256-dim)."""

    def __init__(self) -> None:
        self.api_key = settings.YANDEX_SPEECHKIT_API_KEY
        self.folder_id = settings.YANDEX_SPEECHKIT_FOLDER_ID
        self.base_url = "https://llm.api.cloud.yandex.net/foundationModels/v1/textEmbedding"
        self.headers = {
            "Authorization": f"Api-Key {self.api_key}",
            "Content-Type": "application/json",
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.NetworkError)),
        reraise=True,
    )
    async def _embed_single(
        self,
        client: httpx.AsyncClient,
        text: str,
        model_uri: str,
    ) -> list[float]:
        """Embed a single text with per-request retry."""
        payload = {
            "modelUri": model_uri,
            "text": text,
        }
        resp = await client.post(self.base_url, json=payload)
        resp.raise_for_status()
        data = resp.json()
        return [float(v) for v in data["embedding"]]

    async def embed(
        self,
        texts: list[str],
        model_type: str = "text-search-doc",
    ) -> list[list[float]]:
        """Get embeddings for a list of texts.

        Args:
            texts: List of texts to embed.
            model_type: "text-search-doc" for documents, "text-search-query" for queries.

        Returns:
            List of 256-dimensional float vectors.
        """
        model_uri = f"emb://{self.folder_id}/{model_type}/latest"
        results: list[list[float]] = []

        # Yandex embeddings API: 10 requests/sec limit.
        # Sleep 0.12s between calls = ~8.3 req/sec (safe margin).
        async with httpx.AsyncClient(timeout=20.0, headers=self.headers) as client:
            for i, text in enumerate(texts):
                if i > 0:
                    await asyncio.sleep(0.12)
                try:
                    embedding = await self._embed_single(client, text, model_uri)
                    results.append(embedding)
                except httpx.HTTPStatusError as exc:
                    logger.error(
                        "yandex_embeddings_error",
                        status=exc.response.status_code,
                        body=exc.response.text,
                        text_preview=text[:100],
                    )
                    raise ExternalAPIError(f"Yandex Embeddings error: {exc.response.status_code}") from exc
                except Exception as exc:
                    logger.error("yandex_embeddings_exception", error=str(exc), text_preview=text[:100])
                    raise ExternalAPIError("Yandex Embeddings request failed") from exc

        logger.info("yandex_embeddings_batch", count=len(results), dim=len(results[0]) if results else 0)
        return results


yandex_embeddings_client = YandexEmbeddingsClient()
