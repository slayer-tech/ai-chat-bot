"""add_sales_script_text

Revision ID: 2026_05_28_1500
Revises: 2026_05_27_2000
Create Date: 2026-05-28 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_05_28_1500"
down_revision: Union[str, None] = "2026_05_27_2000"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tenant_settings",
        sa.Column("sales_script_text", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("tenant_settings", "sales_script_text")
