"""add_script_stages_and_dialog_fields

Revision ID: 2026_05_28_2000
Revises: 2026_05_28_1500
Create Date: 2026-05-28 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_05_28_2000"
down_revision: Union[str, None] = "2026_05_28_1500"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # TenantSettings
    op.add_column("tenant_settings", sa.Column("script_stages", sa.JSON(), nullable=True))
    op.add_column("tenant_settings", sa.Column("inactive_days_threshold", sa.Integer(), nullable=True))
    # Dialog
    op.add_column("dialogs", sa.Column("current_stage", sa.String(100), nullable=True))
    op.add_column("dialogs", sa.Column("off_topic_count", sa.Integer(), server_default="0", nullable=False))


def downgrade() -> None:
    op.drop_column("tenant_settings", "script_stages")
    op.drop_column("tenant_settings", "inactive_days_threshold")
    op.drop_column("dialogs", "current_stage")
    op.drop_column("dialogs", "off_topic_count")
