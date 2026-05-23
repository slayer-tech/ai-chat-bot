"""Schemas for knowledge base."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, HttpUrl


class KnowledgeDocCreate(BaseModel):
    filename: str
    source_url: Optional[str] = None


class KnowledgeDocSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    filename: str
    source_url: Optional[str] = None
    status: str
    created_at: datetime


class KnowledgeChunkSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tenant_id: int
    doc_id: int
    content: str
    meta: Optional[dict] = None
    created_at: datetime
