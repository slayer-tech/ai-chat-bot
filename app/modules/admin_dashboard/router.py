"""Admin dashboard routers."""

from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_tenant_id, get_current_user, require_role
from app.db.session import get_db
from app.modules.analytics.service import get_dashboard_stats
from app.schemas.analytics import DashboardStats, SuperAdminDashboard

super_dashboard = APIRouter(prefix="/api/v1/super", tags=["super_dashboard"])
tenant_dashboard = APIRouter(prefix="/api/v1/admin", tags=["tenant_dashboard"])


@super_dashboard.get("/analytics")
async def super_analytics(
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_role("superadmin")),
) -> SuperAdminDashboard:
    from sqlalchemy import func
    from app.db.models import BillingLog, Tenant

    total_tenants = await db.scalar(select(func.count(Tenant.id)))
    total_messages = await db.scalar(
        select(func.sum(BillingLog.quantity)).where(BillingLog.action.in_(["incoming", "outgoing"]))
    )
    total_revenue = await db.scalar(select(func.sum(BillingLog.cost_usd)))
    return SuperAdminDashboard(
        total_tenants=total_tenants or 0,
        total_messages_all_time=total_messages or 0,
        total_revenue_usd=total_revenue or 0.0,
        growth_percent=0.0,
    )


@tenant_dashboard.get("/dashboard")
async def tenant_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> DashboardStats:
    stats = await get_dashboard_stats(db, tenant_id)
    return DashboardStats(**stats)
