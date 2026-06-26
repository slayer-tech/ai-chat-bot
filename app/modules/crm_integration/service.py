"""CRM integration service: sync dialogs with external CRM."""

from typing import Any, Optional

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.clients.crm_adapter import get_crm_adapter
from app.clients.openai_client import openai_client
from app.db.models import Dialog
from app.modules.conversation_memory.service import build_context

logger = structlog.get_logger()


async def _get_adapter(db: AsyncSession, tenant_id: int):
    """Get CRM adapter for tenant if configured."""
    from app.modules.tenants.service import get_tenant_settings

    tenant_settings = await get_tenant_settings(db, tenant_id)
    if not tenant_settings or not tenant_settings.crm_type:
        return None
    try:
        return get_crm_adapter(
            tenant_settings.crm_type,
            tenant_settings.crm_config or {},
        )
    except Exception as exc:
        logger.error("crm_adapter_init_failed", tenant_id=tenant_id, error=str(exc))
        return None


async def sync_lead_on_first_contact(
    db: AsyncSession,
    dialog: Dialog,
) -> None:
    """Ensure dialog has a CRM lead. Search by phone or create new."""
    if dialog.crm_lead_id:
        return

    adapter = await _get_adapter(db, dialog.tenant_id)
    if not adapter:
        return

    phone = dialog.phone
    if not phone:
        logger.info("crm_no_phone_skip", dialog_id=dialog.id)
        return

    # Search existing lead by phone
    existing_lead_id = await adapter.search_lead_by_phone(phone)
    if existing_lead_id:
        dialog.crm_lead_id = str(existing_lead_id)
        await db.commit()
        logger.info(
            "crm_lead_linked_existing",
            dialog_id=dialog.id,
            lead_id=existing_lead_id,
            phone=phone,
        )
        return

    # Create new lead
    try:
        result = await adapter.create_lead(
            name=dialog.name or f"Лид {phone}",
            phone=phone,
            source=dialog.channel,
            tags=["AI-бот", dialog.channel],
        )
        dialog.crm_lead_id = str(result["lead_id"])
        await db.commit()
        logger.info(
            "crm_lead_created",
            dialog_id=dialog.id,
            lead_id=dialog.crm_lead_id,
            phone=phone,
        )
    except Exception as exc:
        logger.error("crm_lead_create_failed", dialog_id=dialog.id, phone=phone, error=str(exc))


async def add_dialog_note_to_crm(
    db: AsyncSession,
    dialog: Dialog,
    text: str,
    prefix: str = "",
) -> None:
    """Add a note to the CRM lead."""
    if not dialog.crm_lead_id:
        return
    adapter = await _get_adapter(db, dialog.tenant_id)
    if not adapter:
        return
    try:
        note_text = f"{prefix}{text}" if prefix else text
        await adapter.add_note(dialog.crm_lead_id, note_text)
        logger.info("crm_note_added", dialog_id=dialog.id, lead_id=dialog.crm_lead_id)
    except Exception as exc:
        logger.error("crm_note_add_failed", dialog_id=dialog.id, error=str(exc))


async def handle_handoff(
    db: AsyncSession,
    dialog: Dialog,
    reason: str,
    summary: str = "",
) -> None:
    """Handle handoff: move stage, add note, create task, extract custom fields."""
    if not dialog.crm_lead_id:
        return

    adapter = await _get_adapter(db, dialog.tenant_id)
    if not adapter:
        return

    from app.modules.tenants.service import get_tenant_settings

    tenant_settings = await get_tenant_settings(db, dialog.tenant_id)
    crm_config = tenant_settings.crm_config or {} if tenant_settings else {}
    pipeline_id = crm_config.get("pipeline_id", "")
    stage_handoff = crm_config.get("stage_handoff", "")
    custom_field_map = crm_config.get("custom_fields", {})

    try:
        # Move to handoff stage
        if pipeline_id and stage_handoff:
            await adapter.move_to_stage(dialog.crm_lead_id, pipeline_id, stage_handoff)
            logger.info(
                "crm_moved_to_handoff_stage",
                dialog_id=dialog.id,
                lead_id=dialog.crm_lead_id,
            )

        # Add summary note
        note_text = f"Перевод на менеджера. Причина: {reason}"
        if summary:
            note_text += f"\nРезюме диалога: {summary}"
        await adapter.add_note(dialog.crm_lead_id, note_text)

        # Create task for manager
        await adapter.create_task(
            dialog.crm_lead_id,
            f"Перезвонить/ответить. Причина: {reason}",
        )

        # Extract and update custom fields via LLM
        if custom_field_map:
            await _extract_and_update_custom_fields(
                db, dialog, adapter, custom_field_map, summary
            )

        logger.info("crm_handoff_processed", dialog_id=dialog.id, lead_id=dialog.crm_lead_id, reason=reason)
    except Exception as exc:
        logger.error("crm_handoff_failed", dialog_id=dialog.id, error=str(exc))


async def handle_script_complete(
    db: AsyncSession,
    dialog: Dialog,
    summary: str = "",
) -> None:
    """Handle script completion: move to success stage, add note."""
    if not dialog.crm_lead_id:
        return

    adapter = await _get_adapter(db, dialog.tenant_id)
    if not adapter:
        return

    from app.modules.tenants.service import get_tenant_settings

    tenant_settings = await get_tenant_settings(db, dialog.tenant_id)
    crm_config = tenant_settings.crm_config or {} if tenant_settings else {}
    pipeline_id = crm_config.get("pipeline_id", "")
    stage_success = crm_config.get("stage_success", "")
    custom_field_map = crm_config.get("custom_fields", {})

    try:
        if pipeline_id and stage_success:
            await adapter.move_to_stage(dialog.crm_lead_id, pipeline_id, stage_success)

        await adapter.add_note(
            dialog.crm_lead_id,
            f"Скрипт продаж завершён.\nРезюме: {summary}" if summary else "Скрипт продаж завершён.",
        )

        if custom_field_map:
            await _extract_and_update_custom_fields(
                db, dialog, adapter, custom_field_map, summary
            )

        logger.info("crm_script_complete_processed", dialog_id=dialog.id, lead_id=dialog.crm_lead_id)
    except Exception as exc:
        logger.error("crm_script_complete_failed", dialog_id=dialog.id, error=str(exc))


async def handle_flood(
    db: AsyncSession,
    dialog: Dialog,
) -> None:
    """Handle flood: add note and create task."""
    if not dialog.crm_lead_id:
        return

    adapter = await _get_adapter(db, dialog.tenant_id)
    if not adapter:
        return

    try:
        await adapter.add_note(dialog.crm_lead_id, "Клиент флудит/спамит. Проверьте вручную.")
        await adapter.create_task(dialog.crm_lead_id, "Клиент флудит — проверить вручную")
        logger.info("crm_flood_notified", dialog_id=dialog.id, lead_id=dialog.crm_lead_id)
    except Exception as exc:
        logger.error("crm_flood_notify_failed", dialog_id=dialog.id, error=str(exc))


async def _extract_and_update_custom_fields(
    db: AsyncSession,
    dialog: Dialog,
    adapter: Any,
    custom_field_map: dict[str, Any],
    summary: str = "",
) -> None:
    """Use LLM to extract custom field values from dialog and update CRM."""
    # Build context for extraction
    conv_context = await build_context(db, dialog.id)
    dialog_text = "\n".join(
        f"{'Клиент' if m['role'] == 'user' else 'Бот'}: {m['content']}"
        for m in conv_context
    )

    fields_prompt = "\n".join(
        f"- {name} (ID: {field_id})" for name, field_id in custom_field_map.items()
    )

    prompt = (
        f"Проанализируй диалог и извлеки значения для следующих полей:\n{fields_prompt}\n\n"
        f"Диалог:\n{dialog_text}\n\n"
        f"Если какое-то поле не удалось определить — верни пустую строку для него.\n"
        f"Ответь ТОЛЬКО в формате JSON: {{\"field_name\": \"value\", ...}}"
    )

    try:
        resp = await openai_client.chat_completion(
            messages=[
                {"role": "system", "content": "Ты аналитик. Извлекай конкретные факты из диалога. Отвечай только JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=500,
        )
        raw = resp["choices"][0]["message"]["content"].strip()
        # Clean markdown code blocks if any
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1].rsplit("\n", 1)[0]
        if raw.startswith("json"):
            raw = raw.split("\n", 1)[1]
        import json

        extracted = json.loads(raw)
        # Map field names to CRM field IDs
        crm_fields = {}
        for name, field_id in custom_field_map.items():
            value = extracted.get(name, "").strip()
            if value:
                crm_fields[str(field_id)] = value

        if crm_fields:
            await adapter.update_lead_custom_fields(dialog.crm_lead_id, crm_fields)
            logger.info(
                "crm_custom_fields_updated",
                dialog_id=dialog.id,
                lead_id=dialog.crm_lead_id,
                fields=list(crm_fields.keys()),
            )
    except Exception as exc:
        logger.error("crm_custom_fields_extraction_failed", dialog_id=dialog.id, error=str(exc))
