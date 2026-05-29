"""remove_inactive_days_threshold

Revision ID: 2026_05_28_2100
Revises: 2026_05_28_2000
Create Date: 2026-05-28 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_05_28_2100"
down_revision: Union[str, None] = "2026_05_28_2000"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("tenant_settings", "inactive_days_threshold")


def downgrade() -> None:
    op.add_column(
        "tenant_settings",
        sa.Column("inactive_days_threshold", sa.Integer(), nullable=True),
    )
