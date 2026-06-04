"""Celery tasks for follow-ups and maintenance."""

import asyncio
from datetime import datetime, timezone

from celery import shared_task
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.models import Dialog, FollowupTrigger, Message, Tenant, TokenVault
from app.modules.tenants.service import reset_used_messages
from app.modules.trigger_engine.service import process_inactive_dialogs, process_pending_triggers
from sqlalchemy import delete, select, and_


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


async def _process_inactive_dialogs_async() -> None:
    """Async implementation of inactive dialog reactivation."""
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
        await process_inactive_dialogs(db)
    await engine.dispose()


@shared_task
def reactivate_inactive_dialogs() -> None:
    """Send follow-ups to dialogs inactive for N days."""
    asyncio.run(_process_inactive_dialogs_async())


async def _cleanup_expired_data_async() -> None:
    """Delete dialogs and messages older than tenant's data_retention_days."""
    from datetime import datetime, timezone, timedelta
    from app.db.models import TenantSettings

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
        now = datetime.now(timezone.utc)

        # Find all tenant settings with retention policy
        result = await db.execute(select(TenantSettings.tenant_id, TenantSettings.data_retention_days))
        tenant_retention = {row.tenant_id: row.data_retention_days for row in result.all()}

        # Default retention: 90 days
        default_retention = 90

        # Find dialogs to delete: either expired by retention OR deletion requested
        result = await db.execute(
            select(Dialog.id, Dialog.tenant_id, Dialog.last_message_at, Dialog.data_deletion_requested_at)
            .where(
                and_(
                    Dialog.status.in_(["handoff", "flood", "closed"]),
                    Dialog.data_deleted_at.is_(None),
                )
            )
        )
        dialogs_to_delete = []
        for row in result.all():
            dialog_id, tenant_id, last_msg_at, deletion_requested = row
            if deletion_requested:
                dialogs_to_delete.append(dialog_id)
                continue
            retention = tenant_retention.get(tenant_id, default_retention)
            cutoff = now - timedelta(days=retention)
            if last_msg_at and last_msg_at < cutoff:
                dialogs_to_delete.append(dialog_id)

        if not dialogs_to_delete:
            await engine.dispose()
            return

        # Delete related data in order (avoid FK constraints)
        batch_size = 500
        for i in range(0, len(dialogs_to_delete), batch_size):
            batch = dialogs_to_delete[i:i + batch_size]
            await db.execute(delete(Message).where(Message.dialog_id.in_(batch)))
            await db.execute(delete(FollowupTrigger).where(FollowupTrigger.dialog_id.in_(batch)))
            await db.execute(delete(TokenVault).where(TokenVault.dialog_id.in_(batch)))
            # TokenAccessLog is linked by token_hash, not dialog_id — skip for now
            # Mark dialogs as deleted
            from sqlalchemy import update
            await db.execute(
                update(Dialog)
                .where(Dialog.id.in_(batch))
                .values(data_deleted_at=now)
            )
            await db.commit()

    await engine.dispose()


@shared_task
def cleanup_expired_data() -> None:
    """Daily cleanup of expired dialog data per GDPR/152-FZ."""
    asyncio.run(_cleanup_expired_data_async())
