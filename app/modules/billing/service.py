"""Billing and message counting."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import BillingLog
from app.modules.tenants.service import increment_message_count


async def log_billing(
    db: AsyncSession,
    tenant_id: int,
    action: str,
    quantity: int = 1,
    cost_usd: float = 0.0,
    description: str = "",
) -> None:
    """Log a billing event and increment tenant counter.

    Args:
        db: DB session.
        tenant_id: Tenant ID.
        action: incoming | outgoing | handoff | voice.
        quantity: Message count.
        cost_usd: Estimated cost.
        description: Optional description.
    """
    entry = BillingLog(
        tenant_id=tenant_id,
        action=action,
        quantity=quantity,
        cost_usd=cost_usd,
        description=description,
    )
    db.add(entry)
    await increment_message_count(db, tenant_id, quantity)
    await db.commit()
