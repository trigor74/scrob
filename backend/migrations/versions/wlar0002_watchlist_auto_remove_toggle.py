"""watchlist auto-remove: list choice -> toggle for the native watchlist

Після нативного watchlist апстріму (#512, natwl001) автоприбирання
переглянутого працює лише з ним, тож вибір довільного списку
(watchlist_auto_remove_id) замінюється перемикачем. Хто мав будь-який
список вибраним — лишається з увімкненим перемикачем.

Revision ID: wlar0002
Revises: 8c77d6fb3785
Create Date: 2026-11-08
"""

from alembic import op
import sqlalchemy as sa


revision = "wlar0002"
down_revision = "8c77d6fb3785"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "user_settings",
        sa.Column("watchlist_auto_remove", sa.Boolean(), nullable=False, server_default="false"),
    )
    op.execute(
        "UPDATE user_settings SET watchlist_auto_remove = true "
        "WHERE watchlist_auto_remove_id IS NOT NULL"
    )
    op.drop_column("user_settings", "watchlist_auto_remove_id")


def downgrade() -> None:
    op.add_column(
        "user_settings",
        sa.Column(
            "watchlist_auto_remove_id",
            sa.Integer(),
            sa.ForeignKey("lists.id", ondelete="SET NULL"),
            nullable=True,
            server_default=None,
        ),
    )
    # Увімкнений перемикач → вибраним стає нативний watchlist
    op.execute(
        "UPDATE user_settings us SET watchlist_auto_remove_id = l.id "
        "FROM lists l WHERE l.user_id = us.user_id AND l.is_watchlist "
        "AND us.watchlist_auto_remove"
    )
    op.drop_column("user_settings", "watchlist_auto_remove")
