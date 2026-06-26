"""change_embedding_dim_to_1536

Revision ID: 2026_06_09_1200
Revises: 2026_06_08_2000
Create Date: 2026-06-09 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
from pgvector.sqlalchemy import Vector

# revision identifiers, used by Alembic.
revision: str = "2026_06_09_1200"
down_revision: Union[str, None] = "2026_06_08_2000"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Clear existing embeddings (Yandex 256-dim are incompatible with OpenAI 1536-dim)
    op.execute("UPDATE knowledge_base_chunks SET embedding = NULL;")
    op.alter_column(
        "knowledge_base_chunks",
        "embedding",
        type_=Vector(1536),
        existing_type=Vector(256),
        postgresql_using="embedding::vector(1536)",
    )


def downgrade() -> None:
    op.execute("UPDATE knowledge_base_chunks SET embedding = NULL;")
    op.alter_column(
        "knowledge_base_chunks",
        "embedding",
        type_=Vector(256),
        existing_type=Vector(1536),
        postgresql_using="embedding::vector(256)",
    )
