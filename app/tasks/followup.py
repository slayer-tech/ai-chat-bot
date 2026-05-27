"""Celery tasks for follow-ups and maintenance."""

import asyncio
from datetime import datetime, timezone

from celery import shared_task
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.models import Tenant
from app.modules.tenants.service import reset_used_messages
from app.modules.trigger_engine.service import process_pending_triggers


async def _process_followups_async() -> None:
    """Async implementation of follow-up processing."""
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
    )
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )
    async with AsyncSessionLocal() as db:
        await process_pending_triggers(db)
    await engine.dispose()


@shared_task
def process_followups() -> None:
    """Process pending follow-up triggers."""
    asyncio.run(_process_followups_async())


async def _reset_monthly_messages_async() -> None:
    """Async implementation of monthly reset."""
    now = datetime.now(timezone.utc)
    if now.day != 1:
        return
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DEBUG,
        future=True,
    )
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
    )
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Tenant.id).where(Tenant.is_active.is_(True)))
        tenant_ids = result.scalars().all()
        for tid in tenant_ids:
            await reset_used_messages(db, tid)
    await engine.dispose()


@shared_task
def reset_monthly_messages() -> None:
    """Reset used_messages for all tenants on the 1st of the month."""
    asyncio.run(_reset_monthly_messages_async())
