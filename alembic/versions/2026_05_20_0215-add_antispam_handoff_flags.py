"""add_antispam_handoff_flags

Revision ID: 2026_05_20_0215
Revises: 2024_01_01_0000
Create Date: 2026-05-20 02:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "2026_05_20_0215"
down_revision: Union[str, None] = "2024_01_01_0000"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tenant_settings",
        sa.Column("anti_spam_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )
    op.add_column(
        "tenant_settings",
        sa.Column("handoff_enabled", sa.Boolean(), nullable=False, server_default=sa.text("true")),
    )


def downgrade() -> None:
    op.drop_column("tenant_settings", "handoff_enabled")
    op.drop_column("tenant_settings", "anti_spam_enabled")
