"""merge upstream sync-v2.17.0 heads with condense-history

Revision ID: 68a38f1a2e27
Revises: 0c771fd3c588, condhist391
Create Date: 2026-09-15 11:05:50.203679

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '68a38f1a2e27'
down_revision: Union[str, Sequence[str], None] = ('0c771fd3c588', 'condhist391')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
