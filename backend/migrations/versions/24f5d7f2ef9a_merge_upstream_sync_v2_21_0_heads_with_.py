"""merge upstream sync-v2.21.0 heads with earlier merge point

Revision ID: 24f5d7f2ef9a
Revises: 022c323d7b9b, mdblglob445
Create Date: 2026-09-29 11:03:34.372266

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '24f5d7f2ef9a'
down_revision: Union[str, Sequence[str], None] = ('022c323d7b9b', 'mdblglob445')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
