"""add_dialog_channel_id

Revision ID: 2026_05_27_1930
Revises: 2026_05_27_0900
Create Date: 2026-05-27 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_05_27_1930"
down_revision: Union[str, None] = "2026_05_27_0900"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "dialogs",
        sa.Column("channel_id", sa.String(255), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("dialogs", "channel_id")
