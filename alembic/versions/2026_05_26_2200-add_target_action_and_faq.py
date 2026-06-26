"""add_target_action_and_faq

Revision ID: 2026_05_26_2200
Revises: 2026_05_20_0245
Create Date: 2026-05-26 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2026_05_26_2200"
down_revision: Union[str, None] = "2026_05_20_0245"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # These columns are already added by revision 2026_05_20_0245.
    # Kept as a no-op marker to preserve the migration chain.
    pass


def downgrade() -> None:
    pass
