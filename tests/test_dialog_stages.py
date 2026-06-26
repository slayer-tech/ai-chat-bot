"""End-to-end tests for dialog state machine."""

from unittest.mock import AsyncMock, patch

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Dialog, DialogStage
from app.modules.channels.service import ensure_dialog
from app.modules.dialog_stages.service import create_stage, get_start_stage, list_stages
from app.modules.llm_router.service import generate_response
from app.schemas.dialog_stage import DialogStageCreate
from app.schemas.webhook import WazzupContact, WazzupMessage


@pytest.mark.asyncio
async def test_create_dialog_with_start_stage(db: AsyncSession, sample_tenant):
    """New dialog should get current_stage from is_start stage."""
    # Create start stage
    await create_stage(
        db,
        sample_tenant.id,
        DialogStageCreate(
            name="greeting",
            label="Приветствие",
            system_prompt="Поздоровайся",
            order_index=0,
            is_start=True,
            is_end=False,
        ),
    )

    msg = WazzupMessage(
        messageId="test-1",
        channelId="ch-1",
        chatType="whatsapp",
        chatId="+79998887766",
        type="text",
        isEcho=False,
        text="Привет",
        contact=WazzupContact(name="Иван", phone="+79998887766"),
    )

    dialog = await ensure_dialog(db, sample_tenant.id, msg)
    assert dialog.current_stage == "greeting"


@pytest.mark.asyncio
async def test_generate_response_uses_stage_prompt(db: AsyncSession, sample_tenant):
    """LLM prompt should include current stage system_prompt and funnel overview."""
    # Create stages
    await create_stage(
        db, sample_tenant.id,
        DialogStageCreate(name="greeting", label="Приветствие", system_prompt="Приветствуй", order_index=0, is_start=True)
    )
    await create_stage(
        db, sample_tenant.id,
        DialogStageCreate(name="booking", label="Запись", system_prompt="Запиши на приём", order_index=1, is_end=True)
    )

    # Create dialog at greeting stage
    dialog = Dialog(
        tenant_id=sample_tenant.id,
        channel="whatsapp",
        external_user_id="user-1",
        current_stage="greeting",
    )
    db.add(dialog)
    await db.commit()
    await db.refresh(dialog)

    # Mock LLM response with stage tag
    mock_llm_response = {
        "choices": [
            {
                "message": {
                    "content": "Здравствуйте! Чем могу помочь?\n\n[STAGE:greeting]"
                }
            }
        ]
    }

    with patch("app.modules.llm_router.service.openai_client.chat_completion", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = mock_llm_response
        result = await generate_response(
            db, sample_tenant.id, "user-1", "Привет", require_confidence=False
        )

    # Check response structure
    assert result["text"] == "Здравствуйте! Чем могу помочь?"
    assert result["stage"] == "greeting"
    assert result["script_complete"] is False
    assert result["is_off_topic"] is False

    # Verify prompt included stage content
    call_args = mock_chat.call_args
    messages = call_args.kwargs.get("messages", call_args[1].get("messages", []))
    system_msg = messages[0]["content"] if messages else ""

    assert "ВОРОНКА ПРОДАЖ" in system_msg
    assert "[greeting] Приветствие" in system_msg
    assert "[booking] Запись" in system_msg
    assert "ТЕКУЩИЙ" in system_msg
    assert "Приветствуй" in system_msg  # stage system_prompt
    assert call_args.kwargs.get("model", call_args[1].get("model")) == "gpt-5.4-mini"


@pytest.mark.asyncio
async def test_stage_transition_booking(db: AsyncSession, sample_tenant):
    """LLM can transition dialog to booking stage."""
    await create_stage(
        db, sample_tenant.id,
        DialogStageCreate(name="greeting", label="Приветствие", system_prompt="Привет", order_index=0, is_start=True)
    )
    await create_stage(
        db, sample_tenant.id,
        DialogStageCreate(name="booking", label="Запись", system_prompt="Запиши", order_index=1, is_end=True)
    )

    dialog = Dialog(
        tenant_id=sample_tenant.id,
        channel="whatsapp",
        external_user_id="user-2",
        current_stage="greeting",
    )
    db.add(dialog)
    await db.commit()

    mock_llm_response = {
        "choices": [
            {
                "message": {
                    "content": "Когда вам удобно прийти?\n\n[STAGE:booking]"
                }
            }
        ]
    }

    with patch("app.modules.llm_router.service.openai_client.chat_completion", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = mock_llm_response
        result = await generate_response(
            db, sample_tenant.id, "user-2", "Хочу записаться", require_confidence=False
        )

    assert result["stage"] == "booking"


@pytest.mark.asyncio
async def test_unknown_stage_fallback(db: AsyncSession, sample_tenant):
    """If LLM returns unknown stage, keep current stage."""
    await create_stage(
        db, sample_tenant.id,
        DialogStageCreate(name="greeting", label="Приветствие", system_prompt="Привет", order_index=0, is_start=True)
    )

    dialog = Dialog(
        tenant_id=sample_tenant.id,
        channel="whatsapp",
        external_user_id="user-3",
        current_stage="greeting",
    )
    db.add(dialog)
    await db.commit()

    mock_llm_response = {
        "choices": [
            {
                "message": {
                    "content": "Не понял\n\n[STAGE:nonexistent_stage]"
                }
            }
        ]
    }

    with patch("app.modules.llm_router.service.openai_client.chat_completion", new_callable=AsyncMock) as mock_chat:
        mock_chat.return_value = mock_llm_response
        result = await generate_response(
            db, sample_tenant.id, "user-3", "???", require_confidence=False
        )

    assert result["stage"] == "greeting"  # fallback to current
    assert result["text"] == "Не понял"


@pytest.mark.asyncio
async def test_dialog_stages_api_crud(db: AsyncSession, sample_tenant):
    """Test CRUD operations via service layer."""
    # Create
    stage = await create_stage(
        db, sample_tenant.id,
        DialogStageCreate(name="test", label="Тест", system_prompt="Тест", order_index=0, is_start=True)
    )
    assert stage.name == "test"

    # List
    stages = await list_stages(db, sample_tenant.id)
    assert len(stages) == 1

    # Get start stage
    start = await get_start_stage(db, sample_tenant.id)
    assert start is not None
    assert start.name == "test"
