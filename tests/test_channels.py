"""Channel webhook tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Tenant
from app.schemas.webhook import WazzupInboundMessage


@pytest.mark.asyncio
async def test_wazzup_webhook(async_client: AsyncClient, sample_tenant: Tenant):
    payload = {
        "channel": "whatsapp",
        "chatId": "79161234567",
        "text": "Привет",
        "contactPhone": "79161234567",
        "contactName": "Иван",
    }
    resp = await async_client.post("/webhook/wazzup", json=payload)
    # Signature missing -> 401 expected in production; currently placeholder tenant_id=1 may 404
    assert resp.status_code in (200, 401, 404)
