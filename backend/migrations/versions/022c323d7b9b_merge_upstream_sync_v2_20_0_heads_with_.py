"""merge upstream sync-v2.20.0 heads with earlier merge point

Revision ID: 022c323d7b9b
Revises: 43b4da43a23b, trktcm434
Create Date: 2026-09-28 14:04:38.213739

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '022c323d7b9b'
down_revision: Union[str, Sequence[str], None] = ('43b4da43a23b', 'trktcm434')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
