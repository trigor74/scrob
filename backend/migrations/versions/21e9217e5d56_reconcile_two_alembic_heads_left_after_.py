"""reconcile two alembic heads left after the sync-v2.28.0 merge

Revision ID: 21e9217e5d56
Revises: 4de3c15b6417, wesrc477
Create Date: 2026-10-19 13:12:33.357572

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '21e9217e5d56'
down_revision: Union[str, Sequence[str], None] = ('4de3c15b6417', 'wesrc477')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
