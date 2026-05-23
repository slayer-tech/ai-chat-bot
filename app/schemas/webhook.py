"""Schemas for incoming webhooks."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class WazzupContact(BaseModel):
    name: Optional[str] = None
    avatarUri: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None


class WazzupMessage(BaseModel):
    messageId: str
    channelId: str
    chatType: str
    chatId: str
    avitoProfileId: Optional[str] = None
    dateTime: Optional[str] = None
    type: str  # text | image | audio | video | document | vcard | geo | etc.
    isEcho: bool = False
    contact: Optional[WazzupContact] = None
    text: Optional[str] = None
    contentUri: Optional[str] = None
    status: Optional[str] = None
    authorName: Optional[str] = None
    authorId: Optional[str] = None
    isEdited: bool = False
    isDeleted: bool = False


class WazzupInboundPayload(BaseModel):
    messages: list[WazzupMessage]


class CRMStatusUpdate(BaseModel):
    crm_type: str
    lead_id: str
    status: str
    pipeline_id: Optional[str] = None
    updated_at: Optional[datetime] = None


class UnifiedMessage(BaseModel):
    channel: str
    tenant_id: int
    external_user_id: str
    phone: Optional[str] = None
    name: Optional[str] = None
    text: Optional[str] = None
    voice_url: Optional[str] = None
    timestamp: datetime
    raw_payload: Optional[dict] = None
