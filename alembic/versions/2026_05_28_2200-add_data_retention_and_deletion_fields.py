"""add data retention and deletion fields

Revision ID: 2026_05_28_2200
Revises: 2026_05_28_2100
Create Date: 2026-05-28 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_05_28_2200"
down_revision: Union[str, None] = "2026_05_28_2100"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tenant_settings",
        sa.Column("data_retention_days", sa.Integer(), nullable=False, server_default="90"),
    )
    op.add_column(
        "dialogs",
        sa.Column("data_deletion_requested_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "dialogs",
        sa.Column("data_deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("dialogs", "data_deleted_at")
    op.drop_column("dialogs", "data_deletion_requested_at")
    op.drop_column("tenant_settings", "data_retention_days")
