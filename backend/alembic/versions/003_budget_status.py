"""add status and responded_at columns to budgets

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f6
Create Date: 2026-06-16
"""
from alembic import op
import sqlalchemy as sa

revision = 'b7c8d9e0f1a2'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("budgets", sa.Column("status", sa.String(), nullable=False, server_default="pending"))
    op.add_column("budgets", sa.Column("responded_at", sa.DateTime(), nullable=True))


def downgrade():
    op.drop_column("budgets", "responded_at")
    op.drop_column("budgets", "status")
