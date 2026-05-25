"""change_embedding_dim_to_256

Revision ID: 2026_05_20_0230
Revises: 2026_05_20_0215
Create Date: 2026-05-20 02:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = "2026_05_20_0230"
down_revision: Union[str, None] = "2026_05_20_0215"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Clear existing embeddings (they have wrong dimension)
    op.execute("UPDATE knowledge_base_chunks SET embedding = NULL;")
    # Alter column type
    op.alter_column(
        "knowledge_base_chunks",
        "embedding",
        type_=Vector(256),
        existing_type=Vector(1536),
        postgresql_using="embedding::vector(256)",
    )


def downgrade() -> None:
    op.execute("UPDATE knowledge_base_chunks SET embedding = NULL;")
    op.alter_column(
        "knowledge_base_chunks",
        "embedding",
        type_=Vector(1536),
        existing_type=Vector(256),
        postgresql_using="embedding::vector(1536)",
    )
