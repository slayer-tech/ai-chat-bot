"""FastAPI application entrypoint."""

from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.security import get_password_hash
from app.core.rate_limit import RateLimitMiddleware
from app.db.base import Base
from app.db.models import Tenant, TenantAdmin
from app.db.session import AsyncSessionLocal, engine
from app.modules.admin_dashboard.router import super_dashboard, tenant_dashboard
from app.modules.channels.router import router as webhook_router
from app.modules.crm_adapter.router import router as crm_webhook_router
from app.modules.dialog_stages.router import router as dialog_stages_router
from app.modules.rag_knowledge_base.router import router as kb_router
from app.modules.tenants.router import admin_router, router as auth_router, super_router
from app.clients.redis_client import close_redis
from app.utils.logging_config import configure_logging

configure_logging()
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    # Startup
    logger.info("app_startup", app=settings.APP_NAME)
    # Seed superadmin from env if configured
    if settings.SUPERADMIN_EMAIL and settings.SUPERADMIN_PASSWORD:
        async with AsyncSessionLocal() as db:
            from sqlalchemy import select
            existing = await db.scalar(select(TenantAdmin).where(TenantAdmin.role == "superadmin"))
            if not existing:
                tenant = await db.scalar(select(Tenant).where(Tenant.email == settings.SUPERADMIN_EMAIL))
                if not tenant:
                    tenant = Tenant(
                        email=settings.SUPERADMIN_EMAIL,
                        password_hash=get_password_hash(settings.SUPERADMIN_PASSWORD),
                        company_name="Default",
                    )
                    db.add(tenant)
                    await db.flush()
                    await db.refresh(tenant)
                admin = TenantAdmin(
                    tenant_id=tenant.id,
                    email=settings.SUPERADMIN_EMAIL,
                    password_hash=get_password_hash(settings.SUPERADMIN_PASSWORD),
                    role="superadmin",
                )
                db.add(admin)
                await db.commit()
                logger.info("superadmin_created", email=admin.email, tenant_id=tenant.id)
    yield
    # Shutdown
    await close_redis()
    logger.info("app_shutdown")


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — SECURITY: never allow credentials with wildcard origins
if settings.FRONTEND_URL:
    origins = [settings.FRONTEND_URL]
else:
    origins = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=bool(settings.FRONTEND_URL),
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Tenant-ID", "X-Refresh-Token"],
)

# Rate limiting
app.add_middleware(RateLimitMiddleware)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Add security headers to every response."""
    response: Response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    return response


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handle custom app exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


# Include routers
app.include_router(auth_router)
app.include_router(super_router)
app.include_router(admin_router)
app.include_router(super_dashboard)
app.include_router(tenant_dashboard)
app.include_router(webhook_router)
app.include_router(crm_webhook_router)
app.include_router(kb_router)
app.include_router(dialog_stages_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
