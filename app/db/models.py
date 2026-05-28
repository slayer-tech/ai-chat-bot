"""SQLAlchemy ORM models for the SaaS AI Chat Bot."""

from datetime import datetime, timezone
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TariffPlan(Base):
    __tablename__ = "tariff_plans"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    max_messages: Mapped[int] = mapped_column(Integer, nullable=False)
    price_monthly: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    inn: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    tariff_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("tariff_plans.id"), nullable=True
    )
    used_messages: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="Europe/Moscow", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    tariff: Mapped[Optional["TariffPlan"]] = relationship("TariffPlan", lazy="selectin")


class TenantSettings(Base):
    __tablename__ = "tenant_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    smart_delay_start: Mapped[Optional[str]] = mapped_column(Time, nullable=True)
    smart_delay_end: Mapped[Optional[str]] = mapped_column(Time, nullable=True)
    timezone: Mapped[str] = mapped_column(String(50), default="Europe/Moscow", nullable=False)
    rate_limit_5min: Mapped[int] = mapped_column(Integer, default=30, nullable=False)
    rate_limit_10min: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    duplicate_threshold: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    followup_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    followup_scenarios: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    followup_rate_limit: Mapped[str] = mapped_column(
        String(20), default="1/4h", nullable=False
    )
    crm_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    crm_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    channel_config: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    system_prompt: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    anti_spam_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    handoff_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    wazzup_api_key: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    target_action: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    faq_items: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    debounce_seconds: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    voice_max_duration_seconds: Mapped[int] = mapped_column(Integer, default=120, nullable=False)
    dialog_message_limit: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class TenantAdmin(Base):
    __tablename__ = "tenant_admins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=True
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(20), default="tenant_admin", nullable=False
    )  # superadmin | tenant_admin
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (UniqueConstraint("tenant_id", "email", name="uq_tenant_admin_email"),)


class Dialog(Base):
    __tablename__ = "dialogs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    channel: Mapped[str] = mapped_column(String(50), nullable=False)
    channel_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    external_user_id: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), default="active", nullable=False
    )  # active | handoff | closed | flood
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    crm_lead_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    is_flood_suspected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_stalled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    message_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_message_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "tenant_id", "channel", "external_user_id", name="uq_dialog_tenant_channel_ext"
        ),
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    dialog_id: Mapped[int] = mapped_column(
        ForeignKey("dialogs.id", ondelete="CASCADE"), nullable=False, index=True
    )
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # user | assistant | system
    content_original: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    content_tokenized: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    intent: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(default=None, nullable=True)
    has_voice: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    voice_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class TokenVault(Base):
    __tablename__ = "token_vault"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    real_value_encrypted: Mapped[str] = mapped_column(Text, nullable=False)
    pii_type: Mapped[str] = mapped_column(String(50), nullable=False)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    dialog_id: Mapped[int] = mapped_column(
        ForeignKey("dialogs.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class TokenAccessLog(Base):
    __tablename__ = "token_access_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    token_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    actor: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class KnowledgeBaseDoc(Base):
    __tablename__ = "knowledge_base_docs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    filename: Mapped[str] = mapped_column(String(500), nullable=False)
    source_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class KnowledgeBaseChunk(Base):
    __tablename__ = "knowledge_base_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    doc_id: Mapped[int] = mapped_column(
        ForeignKey("knowledge_base_docs.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[Optional[list[float]]] = mapped_column(
        Vector(256), nullable=True
    )
    meta: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class FollowupTrigger(Base):
    __tablename__ = "followup_triggers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    dialog_id: Mapped[int] = mapped_column(
        ForeignKey("dialogs.id", ondelete="CASCADE"), nullable=False
    )
    trigger_type: Mapped[str] = mapped_column(String(50), nullable=False)
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20), default="pending", nullable=False
    )  # pending | sent | cancelled
    sent_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class AnalyticsDaily(Base):
    __tablename__ = "analytics_daily"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    date: Mapped[Date] = mapped_column(Date, nullable=False)
    metrics: Mapped[dict] = mapped_column(JSON, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("tenant_id", "date", name="uq_analytics_daily_tenant_date"),
    )


class BillingLog(Base):
    __tablename__ = "billing_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    cost_usd: Mapped[float] = mapped_column(default=0.0, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, index=True)
    actor_admin_id: Mapped[int] = mapped_column(Integer, nullable=False)
    tenant_id: Mapped[int] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    action: Mapped[str] = mapped_column(String(255), nullable=False)
    field_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    old_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
