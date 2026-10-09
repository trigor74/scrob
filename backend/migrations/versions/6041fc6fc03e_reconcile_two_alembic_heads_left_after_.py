"""reconcile two alembic heads left after the sync-v2.25.0 merge

Revision ID: 6041fc6fc03e
Revises: 5df904293ad4, wetrakrsrc
Create Date: 2026-10-09 13:21:20.304371

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6041fc6fc03e'
down_revision: Union[str, Sequence[str], None] = ('5df904293ad4', 'wetrakrsrc')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
