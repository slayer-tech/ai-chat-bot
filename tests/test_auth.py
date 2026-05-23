"""Auth tests."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.models import TenantAdmin


@pytest.mark.asyncio
async def test_login_success(async_client: AsyncClient, sample_admin: TenantAdmin):
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": sample_admin.email, "password": "adminpass"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["role"] == "tenant_admin"


@pytest.mark.asyncio
async def test_login_failure(async_client: AsyncClient):
    resp = await async_client.post(
        "/api/v1/auth/login",
        json={"email": "bad@example.com", "password": "wrong"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_refresh_token(async_client: AsyncClient, sample_admin: TenantAdmin):
    token = create_access_token(
        {"sub": str(sample_admin.id), "role": sample_admin.role, "tenant_id": sample_admin.tenant_id}
    )
    resp = await async_client.post(
        "/api/v1/auth/refresh",
        headers={"Authorization": f"Bearer {token}", "X-Refresh-Token": "dummy"},
    )
    # Will fail because dummy refresh token is invalid
    assert resp.status_code in (401, 422)


def test_password_hashing():
    hashed = get_password_hash("secret")
    assert verify_password("secret", hashed) is True
    assert verify_password("wrong", hashed) is False
