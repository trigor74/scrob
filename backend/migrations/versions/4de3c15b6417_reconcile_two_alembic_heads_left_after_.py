"""reconcile two alembic heads left after the sync-v2.27.0 merge

Revision ID: 4de3c15b6417
Revises: 6041fc6fc03e, simkldrop
Create Date: 2026-10-16 11:54:07.024723

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4de3c15b6417'
down_revision: Union[str, Sequence[str], None] = ('6041fc6fc03e', 'simkldrop')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
