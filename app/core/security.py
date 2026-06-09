"""Security utilities: JWT, password hashing, RBAC."""

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext

from app.core.config import settings
from app.core.exceptions import AuthenticationError, AuthorizationError

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
http_bearer = HTTPBearer(auto_error=False)


def _prehash_password(password: str) -> str:
    """Pre-hash password with SHA-256 to avoid bcrypt 72-byte limit."""
    import hashlib
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hash."""
    return pwd_context.verify(_prehash_password(plain_password), hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(_prehash_password(password))


def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create a short-lived JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    """Create a long-lived JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": True, "verify_signature": True},
        )
        return payload
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("Token expired") from exc
    except jwt.InvalidTokenError as exc:
        raise AuthenticationError("Invalid token") from exc


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
) -> dict[str, Any]:
    """Dependency to extract and validate current user from JWT."""
    if credentials is None:
        raise AuthenticationError("Authorization header missing")
    token = credentials.credentials
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise AuthenticationError("Invalid token type")
    # Attach to request state for downstream use
    request.state.user = payload
    return payload


def require_role(*roles: str):
    """Dependency factory to enforce RBAC roles."""

    async def role_checker(
        request: Request,
        user: dict[str, Any] = Depends(get_current_user),
    ) -> dict[str, Any]:
        user_role = user.get("role")
        if user_role not in roles:
            raise AuthorizationError(f"Role '{user_role}' not in {roles}")
        request.state.user = user
        return user

    return role_checker


async def _verify_tenant_ownership(
    user: dict[str, Any], tenant_id: int
) -> None:
    """Verify the authenticated user belongs to the requested tenant.

    Superadmins can access any tenant. Tenant admins are restricted
    to their own tenant.
    """
    user_role = user.get("role")
    user_tenant_id = user.get("tenant_id")

    if user_role == "superadmin":
        return

    if user_tenant_id is None or int(user_tenant_id) != int(tenant_id):
        raise AuthorizationError("Access denied: tenant ID mismatch")


async def get_current_tenant_id(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(http_bearer),
) -> int:
    """Extract tenant id from X-Tenant-ID header or JWT payload.

    SECURITY: Verifies the authenticated user actually belongs to
    the requested tenant to prevent IDOR attacks.
    """
    # First, get authenticated user
    user = getattr(request.state, "user", None)
    if user is None and credentials:
        try:
            user = decode_token(credentials.credentials)
            request.state.user = user
        except Exception:
            raise AuthenticationError("Invalid authentication token")

    if user is None:
        raise AuthenticationError("Authentication required")

    header = request.headers.get("X-Tenant-ID")
    if header:
        try:
            tenant_id = int(header)
        except ValueError as exc:
            raise AuthenticationError("Invalid X-Tenant-ID") from exc
        await _verify_tenant_ownership(user, tenant_id)
        return tenant_id

    # Try token directly
    tenant_id = user.get("tenant_id")
    if tenant_id is not None:
        await _verify_tenant_ownership(user, tenant_id)
        return int(tenant_id)

    raise AuthenticationError("Tenant identifier missing")
