"""Tenants and admin business logic."""

from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AuthenticationError, ValidationError
from app.core.security import get_password_hash, verify_password
from app.db.models import TariffPlan, Tenant, TenantAdmin, TenantSettings
from app.schemas.tenant import TenantAdminCreate, TenantCreate, TenantUpdate, TenantSettingsUpdate
from app.utils.encryption import encrypt_value, decrypt_value


async def create_tenant(db: AsyncSession, data: TenantCreate) -> Tenant:
    """Register a new tenant with settings."""
    existing = await db.scalar(select(Tenant).where(Tenant.email == data.email))
    if existing:
        raise ValidationError("Email already registered")
    tenant = Tenant(
        email=data.email,
        password_hash=get_password_hash(data.password),
        company_name=data.company_name,
        inn=data.inn,
        tariff_id=data.tariff_id,
        timezone=data.timezone,
    )
    db.add(tenant)
    await db.flush()
    # Create default settings
    db.add(TenantSettings(tenant_id=tenant.id))
    await db.commit()
    await db.refresh(tenant)
    return tenant


async def get_tenant_by_id(db: AsyncSession, tenant_id: int) -> Optional[Tenant]:
    """Fetch tenant by ID."""
    return await db.scalar(select(Tenant).where(Tenant.id == tenant_id))


async def get_tenant_by_email(db: AsyncSession, email: str) -> Optional[Tenant]:
    """Fetch tenant by email."""
    return await db.scalar(select(Tenant).where(Tenant.email == email))


async def update_tenant(
    db: AsyncSession, tenant_id: int, data: TenantUpdate
) -> Tenant:
    """Update tenant fields."""
    tenant = await get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise ValidationError("Tenant not found")
    update_data = data.model_dump(exclude_unset=True)
    if update_data:
        await db.execute(
            update(Tenant).where(Tenant.id == tenant_id).values(**update_data)
        )
        await db.commit()
        await db.refresh(tenant)
    return tenant


async def reset_used_messages(db: AsyncSession, tenant_id: int) -> None:
    """Reset monthly message counter."""
    await db.execute(
        update(Tenant).where(Tenant.id == tenant_id).values(used_messages=0)
    )
    await db.commit()


async def increment_message_count(db: AsyncSession, tenant_id: int, amount: int = 1) -> None:
    """Increment used_messages for a tenant."""
    tenant = await get_tenant_by_id(db, tenant_id)
    if not tenant:
        return
    if tenant.tariff_id:
        tariff = await db.scalar(select(TariffPlan).where(TariffPlan.id == tenant.tariff_id))
        if tariff and tenant.used_messages + amount > tariff.max_messages:
            raise ValidationError("Лимит сообщений исчерпан. Пополните тариф.")
    tenant.used_messages += amount
    await db.commit()


async def create_admin(db: AsyncSession, data: TenantAdminCreate) -> TenantAdmin:
    """Create a tenant admin or superadmin."""
    admin = TenantAdmin(
        tenant_id=data.tenant_id,
        email=data.email,
        password_hash=get_password_hash(data.password),
        role=data.role,
    )
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    return admin


async def get_admin_by_email(db: AsyncSession, email: str) -> Optional[TenantAdmin]:
    """Fetch admin by email."""
    return await db.scalar(select(TenantAdmin).where(TenantAdmin.email == email))


async def authenticate_admin(db: AsyncSession, email: str, password: str) -> TenantAdmin:
    """Verify credentials and return admin."""
    admin = await get_admin_by_email(db, email)
    if not admin or not verify_password(password, admin.password_hash):
        raise AuthenticationError("Invalid email or password")
    return admin


async def get_tenant_settings(db: AsyncSession, tenant_id: int) -> Optional[TenantSettings]:
    """Fetch tenant settings."""
    return await db.scalar(select(TenantSettings).where(TenantSettings.tenant_id == tenant_id))


async def update_tenant_settings(
    db: AsyncSession, tenant_id: int, data: TenantSettingsUpdate
) -> TenantSettings:
    """Upsert tenant settings."""
    settings = await get_tenant_settings(db, tenant_id)
    if not settings:
        settings = TenantSettings(tenant_id=tenant_id)
        db.add(settings)
    from datetime import datetime as _datetime

    update_data = data.model_dump(exclude_unset=True)

    # SECURITY: Encrypt wazzup_api_key at rest
    if "wazzup_api_key" in update_data and update_data["wazzup_api_key"]:
        try:
            update_data["wazzup_api_key"] = encrypt_value(update_data["wazzup_api_key"])
        except Exception:
            # If encryption is not configured, store as-is (warn in logs)
            import structlog
            logger = structlog.get_logger()
            logger.warning("wazzup_api_key_encryption_failed", tenant_id=tenant_id)

    for key, value in update_data.items():
        if key in ("smart_delay_start", "smart_delay_end") and isinstance(value, str):
            value = _datetime.strptime(value, "%H:%M").time()
        setattr(settings, key, value)
    await db.commit()
    await db.refresh(settings)
    return settings


async def get_decrypted_wazzup_api_key(
    db: AsyncSession, tenant_id: int
) -> Optional[str]:
    """Fetch and decrypt tenant's Wazzup API key."""
    tenant_settings = await get_tenant_settings(db, tenant_id)
    if not tenant_settings or not tenant_settings.wazzup_api_key:
        return None
    encrypted = tenant_settings.wazzup_api_key
    # Heuristic: encrypted values from our encrypt_value() are base64 and ~100+ chars
    # Plaintext API keys are typically 36-64 chars
    if len(encrypted) > 80:
        try:
            return decrypt_value(encrypted)
        except Exception:
            # If decryption fails, maybe it was stored plaintext before migration
            return encrypted
    return encrypted


async def list_tenants_with_stats(db: AsyncSession) -> list[dict[str, Any]]:
    """Return tenants with aggregated stats for superadmin."""
    from sqlalchemy import func
    from app.db.models import Dialog

    result = await db.execute(
        select(
            Tenant,
            TariffPlan.name.label("tariff_name"),
            TariffPlan.max_messages,
            func.max(Dialog.last_message_at).label("last_activity"),
            func.count(Dialog.id).label("handoffs_count"),
        )
        .outerjoin(TariffPlan, Tenant.tariff_id == TariffPlan.id)
        .outerjoin(Dialog, Tenant.id == Dialog.tenant_id)
        .where(Dialog.status == "handoff")
        .group_by(Tenant.id, TariffPlan.name, TariffPlan.max_messages)
        .order_by(Tenant.created_at.desc())
    )
    rows = result.all()
    out = []
    for row in rows:
        tenant = row[0]
        out.append(
            {
                "id": tenant.id,
                "company_name": tenant.company_name,
                "email": tenant.email,
                "inn": tenant.inn,
                "tariff_name": row.tariff_name,
                "max_messages": row.max_messages,
                "used_messages": tenant.used_messages,
                "left_messages": (row.max_messages or 0) - tenant.used_messages,
                "is_active": tenant.is_active,
                "is_blocked": tenant.is_blocked,
                "created_at": tenant.created_at,
                "last_activity": row.last_activity,
                "crm_type": None,
                "handoffs_count": row.handoffs_count or 0,
            }
        )
    return out
