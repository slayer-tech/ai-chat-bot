"""add_voice_and_dialog_limits

Revision ID: 2026_05_27_2000
Revises: 2026_05_27_1930
Create Date: 2026-05-27 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_05_27_2000"
down_revision: Union[str, None] = "2026_05_27_1930"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # TenantSettings: voice max duration & dialog message limit
    op.add_column(
        "tenant_settings",
        sa.Column("voice_max_duration_seconds", sa.Integer(), nullable=False, server_default="120"),
    )
    op.add_column(
        "tenant_settings",
        sa.Column("dialog_message_limit", sa.Integer(), nullable=True),
    )
    # Dialog: incoming message counter
    op.add_column(
        "dialogs",
        sa.Column("message_count", sa.Integer(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("dialogs", "message_count")
    op.drop_column("tenant_settings", "dialog_message_limit")
    op.drop_column("tenant_settings", "voice_max_duration_seconds")
