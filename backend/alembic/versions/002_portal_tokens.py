"""add project_portal_tokens table

Revision ID: a1b2c3d4e5f6
Revises: <poner aqui el id de la ultima revision>
Create Date: 2026-06-04
"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "project_portal_tokens",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("project_id", sa.String(), sa.ForeignKey("projects.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("token", sa.String(), unique=True, nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_portal_tokens_token", "project_portal_tokens", ["token"])


def downgrade():
    op.drop_index("ix_portal_tokens_token", "project_portal_tokens")
    op.drop_table("project_portal_tokens")