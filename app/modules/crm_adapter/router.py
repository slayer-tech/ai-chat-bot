"""CRM webhook and config routes."""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_tenant_id, get_current_user, require_role
from app.db.session import get_db
from app.schemas.webhook import CRMStatusUpdate

router = APIRouter(prefix="/webhook", tags=["crm_webhooks"])
crm_config_router = APIRouter(prefix="/api/v1/admin", tags=["crm_config"])


@router.post("/crm")
async def crm_webhook(
    payload: CRMStatusUpdate,
) -> dict[str, str]:
    """Receive status updates from CRM."""
    # Update lead status in DB if needed
    return {"status": "received"}


@crm_config_router.get("/crm/config")
async def get_crm_config(
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> dict[str, Any]:
    from app.modules.tenants.service import get_tenant_settings

    settings = await get_tenant_settings(db, tenant_id)
    if not settings:
        return {}
    return {
        "crm_type": settings.crm_type,
        "crm_config": settings.crm_config,
    }
