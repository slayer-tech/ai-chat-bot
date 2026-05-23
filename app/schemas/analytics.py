"""Schemas for analytics."""

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DailyMetrics(BaseModel):
    incoming_messages: int = 0
    outgoing_messages: int = 0
    unique_users: int = 0
    new_dialogs: int = 0
    handoffs_count: int = 0
    meetings_booked: int = 0
    conversion_rate: float = 0.0
    avg_response_time_sec: float = 0.0
    avg_dialog_duration_min: float = 0.0
    popular_intents: dict[str, int] = {}
    tokens_spent_usd: float = 0.0
    spam_blocked_count: int = 0
    stalled_count: int = 0


class AnalyticsDailySchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    date: date
    metrics: DailyMetrics
    created_at: datetime


class DashboardStats(BaseModel):
    tenant_id: int
    total_messages: int = 0
    used_messages: int = 0
    left_messages: int = 0
    handoffs_count: int = 0
    spam_blocked_count: int = 0
    unique_users_7d: int = 0
    unique_users_30d: int = 0
    unique_users_90d: int = 0


class SuperAdminDashboard(BaseModel):
    total_tenants: int
    total_messages_all_time: int
    total_revenue_usd: float
    growth_percent: float
