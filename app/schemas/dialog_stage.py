"""Pydantic schemas for dialog stages (state machine)."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DialogStageBase(BaseModel):
    name: str
    label: str
    system_prompt: Optional[str] = None
    order_index: int = 0
    is_start: bool = False
    is_end: bool = False


class DialogStageCreate(DialogStageBase):
    pass


class DialogStageUpdate(BaseModel):
    name: Optional[str] = None
    label: Optional[str] = None
    system_prompt: Optional[str] = None
    order_index: Optional[int] = None
    is_start: Optional[bool] = None
    is_end: Optional[bool] = None


class DialogStageResponse(DialogStageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    created_at: datetime
