"""Analytics aggregation."""

from datetime import date, datetime, timedelta, timezone
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AnalyticsDaily, Dialog, Message, Tenant


async def get_dashboard_stats(db: AsyncSession, tenant_id: int) -> dict[str, Any]:
    """Return tenant dashboard stats."""
    tenant = await db.scalar(select(Tenant).where(Tenant.id == tenant_id))
    if not tenant:
        return {}

    now = datetime.now(timezone.utc)
    seven_days = now - timedelta(days=7)
    thirty_days = now - timedelta(days=30)
    ninety_days = now - timedelta(days=90)

    def count_unique_users(since: datetime) -> int:
        # This is sync-like pattern; in async we do separate queries
        pass

    # Use scalar queries
    unique_7 = await db.scalar(
        select(func.count(func.distinct(Dialog.external_user_id)))
        .where(Dialog.tenant_id == tenant_id, Dialog.created_at >= seven_days)
    )
    unique_30 = await db.scalar(
        select(func.count(func.distinct(Dialog.external_user_id)))
        .where(Dialog.tenant_id == tenant_id, Dialog.created_at >= thirty_days)
    )
    unique_90 = await db.scalar(
        select(func.count(func.distinct(Dialog.external_user_id)))
        .where(Dialog.tenant_id == tenant_id, Dialog.created_at >= ninety_days)
    )
    handoffs = await db.scalar(
        select(func.count(Dialog.id)).where(
            Dialog.tenant_id == tenant_id,
            Dialog.status == "handoff",
        )
    )
    spam = await db.scalar(
        select(func.count(Dialog.id)).where(
            Dialog.tenant_id == tenant_id,
            Dialog.is_flood_suspected == True,
        )
    )
    total_messages = await db.scalar(
        select(func.count(Message.id)).where(Message.tenant_id == tenant_id)
    )

    max_messages = 0
    if tenant.tariff_id:
        from app.db.models import TariffPlan

        tariff = await db.scalar(select(TariffPlan).where(TariffPlan.id == tenant.tariff_id))
        if tariff:
            max_messages = tariff.max_messages

    return {
        "tenant_id": tenant_id,
        "total_messages": total_messages or 0,
        "used_messages": tenant.used_messages,
        "left_messages": max_messages - tenant.used_messages,
        "handoffs_count": handoffs or 0,
        "spam_blocked_count": spam or 0,
        "unique_users_7d": unique_7 or 0,
        "unique_users_30d": unique_30 or 0,
        "unique_users_90d": unique_90 or 0,
    }


async def upsert_daily_metrics(
    db: AsyncSession,
    tenant_id: int,
    metrics: dict[str, Any],
) -> None:
    """Upsert daily analytics row."""
    today = date.today()
    existing = await db.scalar(
        select(AnalyticsDaily).where(
            AnalyticsDaily.tenant_id == tenant_id,
            AnalyticsDaily.date == today,
        )
    )
    if existing:
        existing.metrics = {**existing.metrics, **metrics}
    else:
        db.add(AnalyticsDaily(tenant_id=tenant_id, date=today, metrics=metrics))
    await db.commit()
