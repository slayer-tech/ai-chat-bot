"""Celery tasks for follow-ups and maintenance."""

from datetime import datetime, timezone

from asgiref.sync import async_to_sync
from celery import shared_task

from app.db.session import AsyncSessionLocal
from app.modules.tenants.service import get_tenant_by_id, reset_used_messages
from app.modules.trigger_engine.service import process_pending_triggers


async def _process_followups_async() -> None:
    """Async implementation of follow-up processing."""
    async with AsyncSessionLocal() as db:
        await process_pending_triggers(db)


@shared_task
def process_followups() -> None:
    """Process pending follow-up triggers."""
    async_to_sync(_process_followups_async)()


async def _reset_monthly_messages_async() -> None:
    """Async implementation of monthly reset."""
    now = datetime.now(timezone.utc)
    if now.day != 1:
        return
    async with AsyncSessionLocal() as db:
        from sqlalchemy import select
        from app.db.models import Tenant

        result = await db.execute(select(Tenant.id).where(Tenant.is_active == True))
        tenant_ids = result.scalars().all()
        for tid in tenant_ids:
            await reset_used_messages(db, tid)


@shared_task
def reset_monthly_messages() -> None:
    """Reset used_messages for all tenants on the 1st of the month."""
    async_to_sync(_reset_monthly_messages_async)()
