"""Redis-backed rate limiting middleware.

Uses a sliding window algorithm via Redis INCR + EXPIRE.
Different limits apply to different endpoint categories.
"""

import time
from typing import Optional

import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import settings

logger = structlog.get_logger()

# Endpoint categories and their limits
_AUTH_PATHS = {"/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/setup-superadmin"}
_WEBHOOK_PATHS = {"/webhook/"}
_ADMIN_PATHS = {"/api/v1/admin/", "/api/v1/super/"}

# Exempt paths
_EXEMPT_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware with Redis-backed sliding windows."""

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip exempt paths
        if any(path.startswith(ep) for ep in _EXEMPT_PATHS):
            return await call_next(request)

        # Determine rate limit key and threshold
        limit_key, limit, window = self._get_limit(request, path)
        if limit_key is None:
            return await call_next(request)

        # Check rate limit via Redis
        is_allowed, remaining = await self._check_limit(limit_key, limit, window)
        if not is_allowed:
            logger.warning("rate_limit_exceeded", key=limit_key, path=path)
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please try again later."},
                headers={
                    "Retry-After": str(window),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining - 1))
        return response

    def _get_limit(
        self, request: Request, path: str
    ) -> tuple[Optional[str], int, int]:
        """Return (redis_key, limit, window_seconds) for the request."""
        client_ip = self._get_client_ip(request)

        # Auth endpoints: per-IP strict limits
        if path in _AUTH_PATHS:
            key = f"ratelimit:auth:{client_ip}"
            return key, 5, 60  # 5 attempts per minute

        # Webhooks: per-IP moderate limits
        if any(path.startswith(wp) for wp in _WEBHOOK_PATHS):
            key = f"ratelimit:webhook:{client_ip}"
            return key, 60, 60  # 60 per minute

        # Admin API: per-tenant or per-IP
        if any(path.startswith(ap) for ap in _ADMIN_PATHS):
            tenant_id = request.headers.get("X-Tenant-ID")
            if tenant_id:
                key = f"ratelimit:tenant:{tenant_id}"
                return key, settings.RATE_LIMIT_TENANT_PER_MINUTE, 60
            key = f"ratelimit:admin:{client_ip}"
            return key, settings.RATE_LIMIT_IP_PER_MINUTE, 60

        # Default: per-IP
        key = f"ratelimit:ip:{client_ip}"
        return key, settings.RATE_LIMIT_IP_PER_MINUTE, 60

    def _get_client_ip(self, request: Request) -> str:
        """Extract real client IP, respecting X-Forwarded-For behind nginx."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # X-Forwarded-For can contain multiple IPs: client, proxy1, proxy2
            # The first one is the original client
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        return request.client.host if request.client else "unknown"

    async def _check_limit(self, key: str, limit: int, window: int) -> tuple[bool, int]:
        """Check if request is within rate limit.

        Returns (is_allowed, remaining).
        """
        from app.clients.redis_client import get_redis

        try:
            redis = await get_redis()
            now = int(time.time())
            window_key = f"{key}:{now // window}"

            current = await redis.incr(window_key)
            if current == 1:
                await redis.expire(window_key, window + 1)

            remaining = max(0, limit - current)
            return current <= limit, remaining
        except Exception as exc:
            logger.error("rate_limit_redis_error", error=str(exc))
            # Fail open if Redis is unavailable (don't block legitimate traffic)
            return True, limit
