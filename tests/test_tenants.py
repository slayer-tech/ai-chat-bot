"""Tenant and settings tests."""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ValidationError
from app.db.models import Tenant, TenantSettings
from app.modules.tenants.service import (
    create_tenant,
    get_tenant_by_id,
    get_tenant_settings,
    update_tenant_settings,
)
from app.schemas.tenant import TenantCreate, TenantSettingsUpdate


@pytest.mark.asyncio
async def test_create_tenant(db: AsyncSession):
    data = TenantCreate(
        email="new@company.ru",
        password="TestPass123!",
        company_name="New Co",
        inn="7700000000",
    )
    tenant = await create_tenant(db, data)
    assert tenant.id is not None
    assert tenant.email == "new@company.ru"


@pytest.mark.asyncio
async def test_create_duplicate_tenant(db: AsyncSession, sample_tenant: Tenant):
    data = TenantCreate(
        email=sample_tenant.email,
        password="TestPass123!",
        company_name="Dup",
    )
    with pytest.raises(ValidationError):
        await create_tenant(db, data)


@pytest.mark.asyncio
async def test_get_tenant_by_id(db: AsyncSession, sample_tenant: Tenant):
    t = await get_tenant_by_id(db, sample_tenant.id)
    assert t is not None
    assert t.id == sample_tenant.id


@pytest.mark.asyncio
async def test_tenant_settings(db: AsyncSession, sample_tenant: Tenant):
    settings = await get_tenant_settings(db, sample_tenant.id)
    assert settings is not None
    updated = await update_tenant_settings(
        db,
        sample_tenant.id,
        TenantSettingsUpdate(system_prompt="Hello!"),
    )
    assert updated.system_prompt == "Hello!"
