"""merge upstream sync-v2.24.0 heads with earlier merge point

Revision ID: 5df904293ad4
Revises: bed8781ce179, simklv2auth455
Create Date: 2026-10-05 12:01:08.921573

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5df904293ad4'
down_revision: Union[str, Sequence[str], None] = ('bed8781ce179', 'simklv2auth455')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
