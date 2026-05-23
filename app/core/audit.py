"""Audit logging for superadmin actions."""

from datetime import datetime, timezone
from typing import Any, Optional

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import AuditLog

logger = structlog.get_logger()


async def log_audit(
    db: AsyncSession,
    *,
    actor_admin_id: int,
    tenant_id: int,
    action: str,
    field_name: Optional[str] = None,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
) -> None:
    """Persist an audit log entry for superadmin changes.

    Args:
        db: Database session.
        actor_admin_id: ID of the admin performing the action.
        tenant_id: Target tenant ID.
        action: Human-readable action description.
        field_name: Modified field name, if applicable.
        old_value: Previous value, if applicable.
        new_value: New value, if applicable.
    """
    entry = AuditLog(
        actor_admin_id=actor_admin_id,
        tenant_id=tenant_id,
        action=action,
        field_name=field_name,
        old_value=old_value,
        new_value=new_value,
        created_at=datetime.now(timezone.utc),
    )
    db.add(entry)
    await db.commit()
    logger.info(
        "audit_log_created",
        actor_admin_id=actor_admin_id,
        tenant_id=tenant_id,
        action=action,
        field_name=field_name,
    )
