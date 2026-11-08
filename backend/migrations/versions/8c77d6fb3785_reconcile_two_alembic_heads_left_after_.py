"""reconcile two alembic heads left after the sync-v2.38.0 merge

Revision ID: 8c77d6fb3785
Revises: ddc6b7be8d31, uilang
Create Date: 2026-11-08 09:13:16.561481

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8c77d6fb3785'
down_revision: Union[str, Sequence[str], None] = ('ddc6b7be8d31', 'uilang')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
