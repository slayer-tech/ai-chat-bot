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
                # Wazzup returns plain "OK" on success, not JSON
                try:
                    return resp.json()
                except Exception:
                    return {"status": "ok", "body": resp.text}
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

    def verify_webhook_auth(self, authorization: Optional[str], expected_api_key: Optional[str]) -> bool:
        """Verify Wazzup webhook Authorization header.

        Wazzup does NOT send HMAC signatures. When a crmKey is configured,
        it echoes back the API key in the Authorization: Bearer <key> header.

        Args:
            authorization: Authorization header from the webhook request.
            expected_api_key: Tenant's Wazzup API key stored in settings.

        Returns:
            True if valid or no API key is configured (backwards compatible).
        """
        if not expected_api_key:
            # If tenant has no API key configured, we cannot verify — allow through
            return True
        if not authorization:
            return False
        # Extract Bearer token
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return False
        token = parts[1]
        # Use constant-time comparison to avoid timing attacks
        import hmac
        return hmac.compare_digest(token, expected_api_key)


wazzup_client = WazzupClient()
