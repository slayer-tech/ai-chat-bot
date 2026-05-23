"""CRM adapter interface and implementations."""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
import structlog
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.exceptions import ExternalAPIError

logger = structlog.get_logger()


class BaseCRMAdapter(ABC):
    """Abstract CRM adapter."""

    @abstractmethod
    async def create_lead(
        self,
        name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        source: Optional[str] = None,
        tags: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        """Create a new lead/contact."""
        raise NotImplementedError

    @abstractmethod
    async def update_lead(
        self,
        lead_id: str,
        fields: dict[str, Any],
    ) -> dict[str, Any]:
        """Update lead fields."""
        raise NotImplementedError

    @abstractmethod
    async def move_to_stage(
        self,
        lead_id: str,
        pipeline_id: str,
        stage_id: str,
    ) -> dict[str, Any]:
        """Move lead to a pipeline stage."""
        raise NotImplementedError

    @abstractmethod
    async def add_note(
        self,
        lead_id: str,
        text: str,
    ) -> dict[str, Any]:
        """Add a note to the lead."""
        raise NotImplementedError

    @abstractmethod
    async def create_task(
        self,
        lead_id: str,
        text: str,
        responsible_id: Optional[str] = None,
        complete_till: Optional[int] = None,
    ) -> dict[str, Any]:
        """Create a task for a manager."""
        raise NotImplementedError


class AmoCRMAdapter(BaseCRMAdapter):
    """AmoCRM adapter."""

    def __init__(self, base_url: str = "", access_token: str = "") -> None:
        self.base_url = base_url or settings.AMOCRM_BASE_URL
        self.access_token = access_token or settings.AMOCRM_ACCESS_TOKEN
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.NetworkError)),
        reraise=True,
    )
    async def create_lead(
        self,
        name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        source: Optional[str] = None,
        tags: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {"name": name}
        custom_fields = []
        if phone:
            custom_fields.append({"field_code": "PHONE", "values": [{"value": phone}]})
        if email:
            custom_fields.append({"field_code": "EMAIL", "values": [{"value": email}]})
        if custom_fields:
            payload["custom_fields_values"] = custom_fields
        if tags:
            payload["_embedded"] = {"tags": [{"name": t} for t in tags]}

        async with httpx.AsyncClient(timeout=15.0, headers=self.headers) as client:
            resp = await client.post(f"{self.base_url}/api/v4/leads", json=[payload])
            resp.raise_for_status()
            data = resp.json()
            return {"lead_id": data["_embedded"]["leads"][0]["id"]}

    async def update_lead(
        self,
        lead_id: str,
        fields: dict[str, Any],
    ) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=15.0, headers=self.headers) as client:
            resp = await client.patch(f"{self.base_url}/api/v4/leads/{lead_id}", json=fields)
            resp.raise_for_status()
            return resp.json()

    async def move_to_stage(
        self,
        lead_id: str,
        pipeline_id: str,
        stage_id: str,
    ) -> dict[str, Any]:
        return await self.update_lead(
            lead_id,
            {"pipeline_id": int(pipeline_id), "status_id": int(stage_id)},
        )

    async def add_note(self, lead_id: str, text: str) -> dict[str, Any]:
        payload = [
            {
                "entity_id": int(lead_id),
                "note_type": "common",
                "params": {"text": text},
            }
        ]
        async with httpx.AsyncClient(timeout=15.0, headers=self.headers) as client:
            resp = await client.post(
                f"{self.base_url}/api/v4/leads/notes",
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()

    async def create_task(
        self,
        lead_id: str,
        text: str,
        responsible_id: Optional[str] = None,
        complete_till: Optional[int] = None,
    ) -> dict[str, Any]:
        import time

        payload = [
            {
                "entity_id": int(lead_id),
                "entity_type": "leads",
                "text": text,
                "complete_till": complete_till or int(time.time()) + 3600,
            }
        ]
        if responsible_id:
            payload[0]["responsible_user_id"] = int(responsible_id)
        async with httpx.AsyncClient(timeout=15.0, headers=self.headers) as client:
            resp = await client.post(f"{self.base_url}/api/v4/tasks", json=payload)
            resp.raise_for_status()
            return resp.json()


class Bitrix24Adapter(BaseCRMAdapter):
    """Bitrix24 webhook adapter."""

    def __init__(self, webhook_url: str = "") -> None:
        self.webhook_url = webhook_url or settings.BITRIX24_WEBHOOK_URL

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((httpx.HTTPStatusError, httpx.NetworkError)),
        reraise=True,
    )
    async def create_lead(
        self,
        name: str,
        phone: Optional[str] = None,
        email: Optional[str] = None,
        source: Optional[str] = None,
        tags: Optional[list[str]] = None,
    ) -> dict[str, Any]:
        fields = {
            "TITLE": name,
            "SOURCE_ID": source or "WEB",
        }
        if phone:
            fields["PHONE"] = [{"VALUE": phone, "VALUE_TYPE": "WORK"}]
        if email:
            fields["EMAIL"] = [{"VALUE": email, "VALUE_TYPE": "WORK"}]
        if tags:
            fields["TAGS"] = tags
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.webhook_url}/crm.lead.add.json",
                json={"fields": fields, "params": {"REGISTER_SONET_EVENT": "Y"}},
            )
            resp.raise_for_status()
            data = resp.json()
            return {"lead_id": data["result"]}

    async def update_lead(
        self,
        lead_id: str,
        fields: dict[str, Any],
    ) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.webhook_url}/crm.lead.update.json",
                json={"id": lead_id, "fields": fields},
            )
            resp.raise_for_status()
            return resp.json()

    async def move_to_stage(
        self,
        lead_id: str,
        pipeline_id: str,
        stage_id: str,
    ) -> dict[str, Any]:
        return await self.update_lead(
            lead_id,
            {"STATUS_ID": stage_id, "CATEGORY_ID": pipeline_id},
        )

    async def add_note(self, lead_id: str, text: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.webhook_url}/crm.lead.productrows.set.json",
                json={
                    "id": lead_id,
                    "fields": {"COMMENTS": text},
                },
            )
            resp.raise_for_status()
            # Fallback to activity if needed
            return resp.json()

    async def create_task(
        self,
        lead_id: str,
        text: str,
        responsible_id: Optional[str] = None,
        complete_till: Optional[int] = None,
    ) -> dict[str, Any]:
        import time

        fields = {
            "OWNER_ID": lead_id,
            "OWNER_TYPE_ID": 1,  # lead
            "TYPE_ID": 2,  # call
            "SUBJECT": text,
            "START_TIME": datetime.now(timezone.utc).isoformat(),
            "END_TIME": datetime.fromtimestamp(
                complete_till or int(time.time()) + 3600, tz=timezone.utc
            ).isoformat(),
            "COMPLETED": "N",
        }
        if responsible_id:
            fields["RESPONSIBLE_ID"] = responsible_id
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                f"{self.webhook_url}/crm.activity.add.json",
                json={"fields": fields},
            )
            resp.raise_for_status()
            return resp.json()


def get_crm_adapter(crm_type: str, config: Optional[dict[str, Any]] = None) -> BaseCRMAdapter:
    """Factory to return the correct CRM adapter."""
    cfg = config or {}
    if crm_type.lower() == "amocrm":
        return AmoCRMAdapter(
            base_url=cfg.get("base_url", settings.AMOCRM_BASE_URL),
            access_token=cfg.get("access_token", settings.AMOCRM_ACCESS_TOKEN),
        )
    if crm_type.lower() == "bitrix24":
        return Bitrix24Adapter(webhook_url=cfg.get("webhook_url", settings.BITRIX24_WEBHOOK_URL))
    raise ExternalAPIError(f"Unsupported CRM type: {crm_type}")
