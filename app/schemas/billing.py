"""Schemas for billing."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class BillingLogCreate(BaseModel):
    tenant_id: int
    action: str
    quantity: int = 1
    cost_usd: float = 0.0
    description: Optional[str] = None


class BillingLogSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    action: str
    quantity: int
    cost_usd: float
    description: Optional[str] = None
    created_at: datetime
