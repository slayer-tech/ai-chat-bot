"""Pydantic schemas for tenants and admins."""

import re
from datetime import datetime, time as dt_time
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, field_serializer, field_validator


class TariffPlanSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    max_messages: int
    price_monthly: int
    description: Optional[str] = None


class TenantBase(BaseModel):
    email: EmailStr
    company_name: str
    inn: Optional[str] = None
    timezone: str = "Europe/Moscow"


class TenantCreate(TenantBase):
    password: str
    tariff_id: Optional[int] = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 10:
            raise ValueError("Password must be at least 10 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=[\]\\;/`~]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class TenantUpdate(BaseModel):
    email: Optional[EmailStr] = None
    company_name: Optional[str] = None
    inn: Optional[str] = None
    tariff_id: Optional[int] = None
    is_active: Optional[bool] = None
    is_blocked: Optional[bool] = None
    timezone: Optional[str] = None


class TenantSchema(TenantBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tariff_id: Optional[int] = None
    used_messages: int
    is_active: bool
    is_blocked: bool
    created_at: datetime
    updated_at: datetime


class TenantAdminBase(BaseModel):
    email: EmailStr
    role: str = "tenant_admin"


class TenantAdminCreate(TenantAdminBase):
    password: str
    tenant_id: Optional[int] = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if len(v) < 10:
            raise ValueError("Password must be at least 10 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=[\]\\;/`~]", v):
            raise ValueError("Password must contain at least one special character")
        return v


class TenantAdminSchema(TenantAdminBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: Optional[int] = None
    created_at: datetime


class TenantSettingsSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    smart_delay_start: Optional[str] = None
    smart_delay_end: Optional[str] = None
    timezone: str = "Europe/Moscow"
    rate_limit_5min: int = 30
    rate_limit_10min: int = 50
    duplicate_threshold: int = 5
    followup_enabled: bool = True
    followup_scenarios: Optional[dict] = None
    followup_rate_limit: str = "1/4h"
    crm_type: Optional[str] = None
    crm_config: Optional[dict] = None
    channel_config: Optional[dict] = None
    system_prompt: Optional[str] = None
    anti_spam_enabled: bool = True
    handoff_enabled: bool = True
    wazzup_api_key: Optional[str] = None
    target_action: Optional[str] = None
    faq_items: Optional[list] = None
    debounce_seconds: int = 10
    voice_max_duration_seconds: int = 120
    dialog_message_limit: Optional[int] = None
    script_stages: Optional[list] = None
    data_retention_days: int = 90

    @field_serializer("smart_delay_start", "smart_delay_end")
    def serialize_time(self, value):
        if isinstance(value, dt_time):
            return value.strftime("%H:%M")
        return value

    @field_serializer("wazzup_api_key")
    def mask_wazzup_api_key(self, value):
        """Mask API key in API responses for security."""
        if not value:
            return None
        # Show only last 4 characters
        if len(value) <= 4:
            return "****"
        return "****" + value[-4:]


class TenantSettingsUpdate(BaseModel):
    smart_delay_start: Optional[str] = None
    smart_delay_end: Optional[str] = None
    timezone: Optional[str] = None
    rate_limit_5min: Optional[int] = None
    rate_limit_10min: Optional[int] = None
    duplicate_threshold: Optional[int] = None
    followup_enabled: Optional[bool] = None
    followup_scenarios: Optional[dict] = None
    followup_rate_limit: Optional[str] = None
    crm_type: Optional[str] = None
    crm_config: Optional[dict] = None
    channel_config: Optional[dict] = None
    system_prompt: Optional[str] = None
    anti_spam_enabled: Optional[bool] = None
    handoff_enabled: Optional[bool] = None
    wazzup_api_key: Optional[str] = None
    target_action: Optional[str] = None
    faq_items: Optional[list] = None
    debounce_seconds: Optional[int] = None
    voice_max_duration_seconds: Optional[int] = None
    dialog_message_limit: Optional[int] = None
    script_stages: Optional[list] = None
    data_retention_days: Optional[int] = None


class TenantListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    company_name: str
    email: EmailStr
    inn: Optional[str] = None
    tariff_name: Optional[str] = None
    max_messages: Optional[int] = None
    used_messages: int
    left_messages: int = 0
    is_active: bool
    is_blocked: bool
    created_at: datetime
    last_activity: Optional[datetime] = None
    crm_type: Optional[str] = None
    handoffs_count: int = 0


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    tenant_id: Optional[int] = None


class MessageCountReset(BaseModel):
    tenant_id: int
    reset_at: datetime
