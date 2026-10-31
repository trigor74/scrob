"""reconcile two alembic heads left after the sync-v2.37.0 merge

Revision ID: ddc6b7be8d31
Revises: 21e9217e5d56, savedflt
Create Date: 2026-10-31 20:09:36.194581

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ddc6b7be8d31'
down_revision: Union[str, Sequence[str], None] = ('21e9217e5d56', 'savedflt')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
