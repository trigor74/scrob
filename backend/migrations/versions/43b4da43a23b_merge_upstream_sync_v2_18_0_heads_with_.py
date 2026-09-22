"""merge upstream sync-v2.18.0 heads with earlier merge point

Revision ID: 43b4da43a23b
Revises: 68a38f1a2e27, pushstate422
Create Date: 2026-09-22 17:09:47.098181

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '43b4da43a23b'
down_revision: Union[str, Sequence[str], None] = ('68a38f1a2e27', 'pushstate422')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
