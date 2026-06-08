"""add dialog_stages table for per-stage system prompts

Revision ID: 2026_06_08_2000
Revises: 2026_05_28_2200
Create Date: 2026-06-08 20:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_06_08_2000"
down_revision: Union[str, None] = "2026_05_28_2200"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "dialog_stages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("tenant_id", sa.Integer(), sa.ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(64), nullable=False),
        sa.Column("label", sa.String(128), nullable=False),
        sa.Column("system_prompt", sa.Text(), nullable=True),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_start", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("is_end", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_dialog_stages_tenant_id", "dialog_stages", ["tenant_id"])


def downgrade() -> None:
    op.drop_index("ix_dialog_stages_tenant_id", table_name="dialog_stages")
    op.drop_table("dialog_stages")
