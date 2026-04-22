"""reports tables

Revision ID: 20260422_0002
Revises: 20260422_0001
Create Date: 2026-04-22 11:58:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "20260422_0002"
down_revision: Union[str, None] = "20260422_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "reports",
        sa.Column("organization_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("audit_type", sa.String(length=50), nullable=False),
        sa.Column("uploaded_at", sa.Date(), nullable=False),
        sa.Column("file_size", sa.String(length=30), nullable=False),
        sa.Column("file_type", sa.String(length=20), nullable=False),
        sa.Column("compliance", sa.Integer(), nullable=False),
        sa.Column("risk", sa.String(length=20), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reports_organization_id", "reports", ["organization_id"], unique=False)
    op.create_index("ix_reports_audit_type", "reports", ["audit_type"], unique=False)
    op.create_index("ix_reports_risk", "reports", ["risk"], unique=False)
    op.create_index("ix_reports_status", "reports", ["status"], unique=False)

    op.create_table(
        "findings",
        sa.Column("report_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("recommendation", sa.Text(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["report_id"], ["reports.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_findings_report_id", "findings", ["report_id"], unique=False)

    op.create_table(
        "recommendations",
        sa.Column("report_id", sa.String(length=36), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("priority", sa.String(length=10), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("owner", sa.String(length=120), nullable=False),
        sa.Column("due", sa.String(length=30), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["report_id"], ["reports.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_recommendations_report_id", "recommendations", ["report_id"], unique=False)

    op.create_table(
        "report_metrics",
        sa.Column("report_id", sa.String(length=36), nullable=False),
        sa.Column("trend", sa.JSON(), nullable=False),
        sa.Column("categories", sa.JSON(), nullable=False),
        sa.Column("severity", sa.JSON(), nullable=False),
        sa.Column("heatmap", sa.JSON(), nullable=False),
        sa.Column("id", sa.String(length=36), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["report_id"], ["reports.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_report_metrics_report_id", "report_metrics", ["report_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_report_metrics_report_id", table_name="report_metrics")
    op.drop_table("report_metrics")
    op.drop_index("ix_recommendations_report_id", table_name="recommendations")
    op.drop_table("recommendations")
    op.drop_index("ix_findings_report_id", table_name="findings")
    op.drop_table("findings")
    op.drop_index("ix_reports_status", table_name="reports")
    op.drop_index("ix_reports_risk", table_name="reports")
    op.drop_index("ix_reports_audit_type", table_name="reports")
    op.drop_index("ix_reports_organization_id", table_name="reports")
    op.drop_table("reports")
