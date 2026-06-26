"""add_dialog_last_error_fields

Revision ID: 2026_06_25_1800
Revises: 2026_06_09_1200
Create Date: 2026-06-25 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
from sqlalchemy import Column, DateTime, Text

# revision identifiers, used by Alembic.
revision: str = "2026_06_25_1800"
down_revision: Union[str, None] = "2026_06_09_1200"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("dialogs", Column("last_error_text", Text, nullable=True))
    op.add_column("dialogs", Column("last_error_at", DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("dialogs", "last_error_at")
    op.drop_column("dialogs", "last_error_text")
