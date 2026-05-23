"""Schemas for dialogs and messages."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DialogBase(BaseModel):
    channel: str
    external_user_id: str
    phone: Optional[str] = None
    name: Optional[str] = None


class DialogCreate(DialogBase):
    tenant_id: int


class DialogSchema(DialogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    status: str = "active"
    summary: Optional[str] = None
    crm_lead_id: Optional[str] = None
    is_flood_suspected: bool = False
    is_stalled: bool = False
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class MessageBase(BaseModel):
    role: str
    content_original: Optional[str] = None
    content_tokenized: Optional[str] = None
    intent: Optional[str] = None
    confidence: Optional[float] = None
    has_voice: bool = False
    voice_url: Optional[str] = None
    tokens_used: int = 0
    is_duplicate: bool = False


class MessageCreate(MessageBase):
    dialog_id: int
    tenant_id: int


class MessageSchema(MessageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    dialog_id: int
    tenant_id: int
    created_at: datetime
