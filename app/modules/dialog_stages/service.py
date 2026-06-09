"""CRUD service for dialog stages (state machine)."""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import DialogStage
from app.schemas.dialog_stage import DialogStageCreate, DialogStageUpdate


async def list_stages(db: AsyncSession, tenant_id: int) -> list[DialogStage]:
    """List all stages for a tenant ordered by order_index."""
    result = await db.execute(
        select(DialogStage)
        .where(DialogStage.tenant_id == tenant_id)
        .order_by(DialogStage.order_index, DialogStage.id)
    )
    return list(result.scalars().all())


async def get_stage(db: AsyncSession, tenant_id: int, stage_id: int) -> Optional[DialogStage]:
    """Get a single stage by ID."""
    return await db.scalar(
        select(DialogStage).where(
            DialogStage.id == stage_id,
            DialogStage.tenant_id == tenant_id,
        )
    )


async def get_stage_by_name(
    db: AsyncSession, tenant_id: int, name: str
) -> Optional[DialogStage]:
    """Get a stage by machine name."""
    return await db.scalar(
        select(DialogStage).where(
            DialogStage.tenant_id == tenant_id,
            DialogStage.name == name,
        )
    )


async def get_start_stage(db: AsyncSession, tenant_id: int) -> Optional[DialogStage]:
    """Get the start stage for a tenant."""
    return await db.scalar(
        select(DialogStage)
        .where(DialogStage.tenant_id == tenant_id, DialogStage.is_start.is_(True))
        .order_by(DialogStage.order_index, DialogStage.id)
        .limit(1)
    )


async def create_stage(
    db: AsyncSession, tenant_id: int, data: DialogStageCreate
) -> DialogStage:
    """Create a new dialog stage."""
    # Enforce single start stage per tenant
    if data.is_start:
        existing_start = await db.scalar(
            select(DialogStage).where(
                DialogStage.tenant_id == tenant_id, DialogStage.is_start.is_(True)
            )
        )
        if existing_start:
            existing_start.is_start = False

    stage = DialogStage(
        tenant_id=tenant_id,
        name=data.name,
        label=data.label,
        system_prompt=data.system_prompt,
        order_index=data.order_index,
        is_start=data.is_start,
        is_end=data.is_end,
    )
    db.add(stage)
    await db.commit()
    await db.refresh(stage)
    return stage


async def update_stage(
    db: AsyncSession, tenant_id: int, stage_id: int, data: DialogStageUpdate
) -> Optional[DialogStage]:
    """Update a dialog stage."""
    stage = await get_stage(db, tenant_id, stage_id)
    if not stage:
        return None

    update_data = data.model_dump(exclude_unset=True)

    # Enforce single start stage
    if update_data.get("is_start"):
        existing_start = await db.scalar(
            select(DialogStage).where(
                DialogStage.tenant_id == tenant_id,
                DialogStage.is_start.is_(True),
                DialogStage.id != stage_id,
            )
        )
        if existing_start:
            existing_start.is_start = False

    for key, value in update_data.items():
        setattr(stage, key, value)

    await db.commit()
    await db.refresh(stage)
    return stage


async def delete_stage(db: AsyncSession, tenant_id: int, stage_id: int) -> bool:
    """Delete a dialog stage."""
    stage = await get_stage(db, tenant_id, stage_id)
    if not stage:
        return False
    await db.delete(stage)
    await db.commit()
    return True
