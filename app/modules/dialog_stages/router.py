"""Admin router for dialog stages (state machine)."""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_current_tenant_id, require_role
from app.db.session import get_db
from app.modules.dialog_stages.service import (
    create_stage,
    delete_stage,
    get_stage,
    list_stages,
    update_stage,
)
from app.schemas.dialog_stage import DialogStageCreate, DialogStageResponse, DialogStageUpdate

router = APIRouter(prefix="/api/v1/admin/dialog-stages", tags=["dialog_stages"])


DEFAULT_STAGES = [
    {
        "name": "greeting",
        "label": "Приветствие",
        "system_prompt": (
            "Поздоровайся с клиентом, представь клинику и стоматолога. "
            "Узнай, как к нему обращаться, и что его беспокоит. "
            "Будь тёплым, но кратким. Цель — перейти к диагностике проблемы."
        ),
        "order_index": 0,
        "is_start": True,
        "is_end": False,
    },
    {
        "name": "diagnosis",
        "label": "Диагностика",
        "system_prompt": (
            "Уточни проблему зуба: какой зуб, как давно болит, есть ли чувствительность, "
            "было ли лечение раньше. Задавай 1-2 уточняющих вопроса. "
            "Не ставь диагноз — ты не врач. Цель — понять проблему и плавно перейти к обсуждению решения."
        ),
        "order_index": 1,
        "is_start": False,
        "is_end": False,
    },
    {
        "name": "pricing",
        "label": "Цена и услуги",
        "system_prompt": (
            "Если клиент спрашивает цену — назови ТОЛЬКО если она точно указана в базе знаний (RAG). "
            "Если цены нет в источниках — предложи бесплатную консультацию, где врач назовёт точную стоимость. "
            "Не придумывай цифры. Не переноси цену одной услуги на другую. "
            "Если клиент сомневается — покажи ценность: опыт врача, качество материалов, гарантии."
        ),
        "order_index": 2,
        "is_start": False,
        "is_end": False,
    },
    {
        "name": "booking",
        "label": "Запись",
        "system_prompt": (
            "Предложи запись на удобное время. Уточни ФИО и телефон для подтверждения. "
            "Назови адрес клиники и как добраться. Если клиент согласен — подтверди дату и время. "
            "Цель — зафиксировать запись."
        ),
        "order_index": 3,
        "is_start": False,
        "is_end": False,
    },
    {
        "name": "closing",
        "label": "Завершение",
        "system_prompt": (
            "Попрощайся, напомни дату и время приёма, адрес. "
            "Пожелай хорошего дня. Если клиент поблагодарил — ответь тепло и кратко. "
            "Не пытайся продать что-то ещё на этой стадии."
        ),
        "order_index": 4,
        "is_start": False,
        "is_end": True,
    },
]


@router.get("", response_model=list[DialogStageResponse])
async def get_stages(
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> list[DialogStageResponse]:
    """List all dialog stages for the tenant."""
    stages = await list_stages(db, tenant_id)
    return [DialogStageResponse.model_validate(s) for s in stages]


@router.post("", response_model=DialogStageResponse)
async def create_new_stage(
    data: DialogStageCreate,
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> DialogStageResponse:
    """Create a new dialog stage."""
    stage = await create_stage(db, tenant_id, data)
    return DialogStageResponse.model_validate(stage)


@router.get("/{stage_id}", response_model=DialogStageResponse)
async def get_stage_by_id(
    stage_id: int,
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> DialogStageResponse:
    """Get a single dialog stage."""
    stage = await get_stage(db, tenant_id, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return DialogStageResponse.model_validate(stage)


@router.patch("/{stage_id}", response_model=DialogStageResponse)
async def patch_stage(
    stage_id: int,
    data: DialogStageUpdate,
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> DialogStageResponse:
    """Update a dialog stage."""
    stage = await update_stage(db, tenant_id, stage_id, data)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return DialogStageResponse.model_validate(stage)


@router.post("/seed")
async def seed_default_stages(
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> dict[str, Any]:
    """Create default dialog stages for the tenant if none exist."""
    existing = await list_stages(db, tenant_id)
    if existing:
        return {"status": "already_seeded", "stages": len(existing)}

    created = []
    for stage_data in DEFAULT_STAGES:
        stage = await create_stage(db, tenant_id, DialogStageCreate(**stage_data))
        created.append(stage)

    return {"status": "ok", "created": len(created)}


@router.delete("/{stage_id}")
async def remove_stage(
    stage_id: int,
    db: AsyncSession = Depends(get_db),
    tenant_id: int = Depends(get_current_tenant_id),
    user: dict[str, Any] = Depends(require_role("tenant_admin", "superadmin")),
) -> dict[str, str]:
    """Delete a dialog stage."""
    deleted = await delete_stage(db, tenant_id, stage_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Stage not found")
    return {"status": "deleted"}
