"""merge upstream sync-v2.22.0 heads with earlier merge point

Revision ID: bed8781ce179
Revises: 24f5d7f2ef9a, cmttvdb446
Create Date: 2026-09-30 21:44:32.247842

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bed8781ce179'
down_revision: Union[str, Sequence[str], None] = ('24f5d7f2ef9a', 'cmttvdb446')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
