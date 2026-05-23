"""Celery tasks for follow-ups and maintenance."""

from datetime import datetime, timezone

from celery import shared_task

from app.db.session import AsyncSessionLocal
from app.modules.tenants.service import get_tenant_by_id, reset_used_messages
from app.modules.trigger_engine.service import process_pending_triggers


@shared_task
async def process_followups() -> None:
    """Process pending follow-up triggers."""
    async with AsyncSessionLocal() as db:
        await process_pending_triggers(db)


@shared_task
async def reset_monthly_messages() -> None:
    """Reset used_messages for all tenants on the 1st of the month."""
    now = datetime.now(timezone.utc)
    if now.day != 1:
        return
    # In production, iterate tenants and reset
    async with AsyncSessionLocal() as db:
        # Example: reset for all active tenants
        from sqlalchemy import select
        from app.db.models import Tenant

        result = await db.execute(select(Tenant.id).where(Tenant.is_active == True))
        tenant_ids = result.scalars().all()
        for tid in tenant_ids:
            await reset_used_messages(db, tid)
