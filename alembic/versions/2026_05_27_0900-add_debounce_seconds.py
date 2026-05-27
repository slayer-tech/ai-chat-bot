"""add_debounce_seconds

Revision ID: 2026_05_27_0900
Revises: 2026_05_26_2200
Create Date: 2026-05-27 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_05_27_0900"
down_revision: Union[str, None] = "2026_05_26_2200"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tenant_settings",
        sa.Column("debounce_seconds", sa.Integer(), nullable=False, server_default="10"),
    )


def downgrade() -> None:
    op.drop_column("tenant_settings", "debounce_seconds")
