"""Async Wazzup API client for multi-channel messaging."""

import re
from typing import Any, Optional

import httpx
import structlog
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import ExternalAPIError

logger = structlog.get_logger()


class WazzupClient:
    """Client for Wazzup API (WhatsApp, Telegram, MAX, etc.)."""

    def __init__(self) -> None:
        self.base_url = settings.WAZZUP_BASE_URL
        self.api_key = None  # Per-tenant only — no global fallback

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.NetworkError)),
        reraise=True,
    )
    def _normalize_chat_id(self, chat_id: str, chat_type: str) -> str:
        if chat_type == "whatsapp":
            return re.sub(r"\D", "", chat_id)
        if chat_type == "telegram":
            return chat_id.strip()
        return chat_id.strip()

    async def send_message(
        self,
        channel_id: str,
        chat_id: str,
        text: str,
        chat_type: str = "whatsapp",
        api_key: Optional[str] = None,
    ) -> dict[str, Any]:
        """Send an outbound message via Wazzup.

        Args:
            channel_id: Wazzup channel UUID (from webhook).
            chat_id: External chat/user ID.
            text: Message text.
            api_key: Optional tenant-specific API key. Falls back to global settings.

        Returns:
            API response JSON.
        """
        normalized_chat_id = self._normalize_chat_id(chat_id, chat_type)
        payload = {
            "channelId": channel_id,
            "chatId": normalized_chat_id,
            "text": text,
            "chatType": chat_type,
        }
        key = api_key or self.api_key
        headers = {
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
        }
        logger.info("wazzup_send_payload", payload=payload, has_custom_key=bool(api_key))
        async with httpx.AsyncClient(timeout=15.0, headers=headers) as client:
            try:
                resp = await client.post(f"{self.base_url}/message", json=payload)
                logger.info("wazzup_send_response", status=resp.status_code, body=resp.text)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPStatusError as exc:
                logger.error(
                    "wazzup_send_error",
                    status=exc.response.status_code,
                    body=exc.response.text,
                )
                raise ExternalAPIError(f"Wazzup error: {exc.response.status_code}") from exc
            except Exception as exc:
                logger.error("wazzup_send_exception", error=str(exc))
                raise ExternalAPIError("Wazzup request failed") from exc

    async def set_webhook(self, api_key: str, webhook_url: str) -> dict[str, Any]:
        """Register or update webhook URL in Wazzup.

        Args:
            api_key: Tenant-specific Wazzup API key.
            webhook_url: Public URL where Wazzup will send events.

        Returns:
            API response JSON.
        """
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "webhooksUri": webhook_url,
            "subscriptions": {
                "messagesAndStatuses": True,
                "contactsAndDealsCreation": False,
                "channelsUpdates": False,
                "templateStatus": False,
            },
        }
        logger.info("wazzup_set_webhook", url=webhook_url)
        async with httpx.AsyncClient(timeout=15.0, headers=headers) as client:
            try:
                resp = await client.patch(f"{self.base_url}/webhooks", json=payload)
                logger.info("wazzup_set_webhook_response", status=resp.status_code, body=resp.text)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPStatusError as exc:
                logger.error(
                    "wazzup_set_webhook_error",
                    status=exc.response.status_code,
                    body=exc.response.text,
                )
                raise ExternalAPIError(f"Wazzup webhook registration error: {exc.response.status_code}") from exc
            except Exception as exc:
                logger.error("wazzup_set_webhook_exception", error=str(exc))
                raise ExternalAPIError("Wazzup webhook registration failed") from exc

    def verify_webhook_signature(self, body: bytes, signature: Optional[str]) -> bool:
        """Verify Wazzup webhook signature.

        Args:
            body: Raw request body bytes.
            signature: Signature header value.

        Returns:
            True if signature is valid or no secret configured.
        """
        import hmac
        import hashlib

        secret = settings.WAZZUP_WEBHOOK_SECRET
        if not secret:
            return True
        if not signature:
            return False
        expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(expected, signature)


wazzup_client = WazzupClient()
