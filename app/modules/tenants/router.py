"""Tenants and admin API routers."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.audit import log_audit
from app.core.config import settings
from app.core.exceptions import AuthenticationError, AuthorizationError, ValidationError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_tenant_id,
    get_current_user,
    require_role,
)
from app.db.session import get_db
from app.modules.tenants.service import (
    authenticate_admin,
    create_admin,
    create_tenant,
    get_admin_by_email,
    get_tenant_by_email,
    get_tenant_by_id,
    get_tenant_settings,
    list_tenants_with_stats,
    update_tenant,
    update_tenant_settings,
)
from app.schemas.tenant import (
    LoginRequest,
    TenantAdminCreate,
    TenantCreate,
    TenantListItem,
    TenantSchema,
    TenantSettingsSchema,
    TenantSettingsUpdate,
    TenantUpdate,
    TokenResponse,
)
from app.clients.redis_client import get_redis

router = APIRouter(prefix="/api/v1", tags=["auth"])
super_router = APIRouter(prefix="/api/v1/super", tags=["superadmin"])
admin_router = APIRouter(prefix="/api/v1/admin", tags=["tenant_admin"])


@router.post("/auth/register", response_model=TokenResponse)
async def register(
    payload: TenantCreate,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Register new tenant and return JWT tokens."""
    tenant = await create_tenant(db, payload)
    admin = await create_admin(
        db,
        TenantAdminCreate(
            email=payload.email,
            password=payload.password,
            tenant_id=tenant.id,
            role="tenant_admin",
        ),
    )
    data = {
        "sub": str(admin.id),
        "role": admin.role,
        "tenant_id": admin.tenant_id,
        "email": admin.email,
    }
    return TokenResponse(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
        role=admin.role,
        tenant_id=admin.tenant_id,
    )


@router.post("/auth/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Authenticate and return JWT tokens."""
    admin = await authenticate_admin(db, payload.email, payload.password)
    data = {
        "sub": str(admin.id),
        "role": admin.role,
        "tenant_id": admin.tenant_id,
        "email": admin.email,
    }
    return TokenResponse(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
        role=admin.role,
        tenant_id=admin.tenant_id,
    )


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Refresh access token using refresh token."""
    refresh_token = request.headers.get("X-Refresh-Token")
    if not refresh_token:
        raise AuthenticationError("Refresh token missing")
    redis = await get_redis()
    if await redis.get(f"blacklist:{refresh_token}"):
        raise AuthenticationError("Token revoked")
    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise AuthenticationError("Invalid token type")
    data = {
        "sub": payload["sub"],
        "role": payload["role"],
        "tenant_id": payload.get("tenant_id"),
        "email": payload["email"],
    }
    return TokenResponse(
        access_token=create_access_token(data),
        refresh_token=create_refresh_token(data),
        role=payload["role"],
        tenant_id=payload.get("tenant_id"),
    )


@router.post("/auth/logout")
async def logout(request: Request) -> dict[str, str]:
    """Blacklist refresh token on logout."""
    refresh_token = request.headers.get("X-Refresh-Token")
    if refresh_token:
        redis = await get_redis()
        await redis.setex(
            f"blacklist:{refresh_token}",
            settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 86400,
            "1",
        )
    return {"status": "logged_out"}


# Superadmin routes
@super_router.get("/tenants", response_model=list[TenantListItem])
async def list_tenants(
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_role("superadmin")),
) -> list[dict[str, Any]]:
    """List all tenants with stats."""
    return await list_tenants_with_stats(db)


@super_router.get("/tenants/{tenant_id}", response_model=TenantSchema)
async def get_tenant(
    tenant_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_role("superadmin")),
) -> TenantSchema:
    tenant = await get_tenant_by_id(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@super_router.patch("/tenants/{tenant_id}")
async def patch_tenant(
    tenant_id: int,
    data: TenantUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_role("superadmin")),
) -> TenantSchema:
    tenant = await update_tenant(db, tenant_id, data)
    await log_audit(
        db,
        actor_admin_id=int(user["sub"]),
        tenant_id=tenant_id,
        action="update_tenant",
        old_value="",
        new_value=data.model_dump_json(),
    )
    return tenant


@super_router.get("/tenants/{tenant_id}/settings", response_model=TenantSettingsSchema)
async def get_super_tenant_settings(
    tenant_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_role("superadmin")),
) -> TenantSettingsSchema:
    settings = await get_tenant_settings(db, tenant_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings


@super_router.put("/tenants/{tenant_id}/settings", response_model=TenantSettingsSchema)
async def put_super_tenant_settings(
    tenant_id: int,
    data: TenantSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    user: dict[str, Any] = Depends(require_role("superadmin")),
) -> TenantSettingsSchema:
    old = await get_tenant_settings(db, tenant_id)
    old_value = old.model_dump_json() if old else ""
    settings = await update_tenant_settings(db, tenant_id, data)
    await log_audit(
        db,
        actor_admin_id=int(user["sub"]),
        tenant_id=tenant_id,
        action="update_settings",
        old_value=old_value,
        new_value=settings.model_dump_json(),
    )
    return settings


# Tenant admin routes
@admin_router.get("/dashboard")
async def tenant_dashboard(
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> dict[str, Any]:
    from app.modules.analytics.service import get_dashboard_stats
    stats = await get_dashboard_stats(db, tenant_id)
    return stats


@admin_router.get("/settings", response_model=TenantSettingsSchema)
async def get_admin_settings(
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> TenantSettingsSchema:
    settings = await get_tenant_settings(db, tenant_id)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings


@admin_router.put("/settings", response_model=TenantSettingsSchema)
async def put_admin_settings(
    data: TenantSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> TenantSettingsSchema:
    return await update_tenant_settings(db, tenant_id, data)
