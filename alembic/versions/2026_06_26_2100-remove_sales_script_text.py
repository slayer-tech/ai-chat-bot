"""remove_sales_script_text

Revision ID: 2026_06_26_2100
Revises: 2026_06_25_1800
Create Date: 2026-06-26 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_06_26_2100"
down_revision: Union[str, None] = "2026_06_25_1800"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("tenant_settings", "sales_script_text")


def downgrade() -> None:
    op.add_column(
        "tenant_settings",
        sa.Column("sales_script_text", sa.Text(), nullable=True),
    )
