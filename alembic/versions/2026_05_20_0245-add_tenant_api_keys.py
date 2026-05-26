"""add_tenant_api_keys

Revision ID: 2026_05_20_0245
Revises: 2026_05_20_0230
Create Date: 2026-05-20 02:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_05_20_0245"
down_revision: Union[str, None] = "2026_05_20_0230"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "tenant_settings",
        sa.Column("wazzup_api_key", sa.String(length=255), nullable=True),
    )
    op.add_column(
        "tenant_settings",
        sa.Column("target_action", sa.String(length=50), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("tenant_settings", "target_action")
    op.drop_column("tenant_settings", "wazzup_api_key")
