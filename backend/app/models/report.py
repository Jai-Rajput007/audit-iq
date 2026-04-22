from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampedModel


class Report(Base, TimestampedModel):
    __tablename__ = "reports"

    organization_id: Mapped[str] = mapped_column(String(36), ForeignKey("organizations.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    audit_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    uploaded_at: Mapped[date] = mapped_column(Date, nullable=False)
    file_size: Mapped[str] = mapped_column(String(30), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False)
    compliance: Mapped[int] = mapped_column(Integer, nullable=False)
    risk: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)

    findings: Mapped[list["Finding"]] = relationship("Finding", back_populates="report", cascade="all, delete-orphan")
    recommendations: Mapped[list["Recommendation"]] = relationship(
        "Recommendation", back_populates="report", cascade="all, delete-orphan"
    )
    metrics: Mapped["ReportMetric | None"] = relationship(
        "ReportMetric", back_populates="report", cascade="all, delete-orphan", uselist=False
    )


class Finding(Base, TimestampedModel):
    __tablename__ = "findings"

    report_id: Mapped[str] = mapped_column(String(36), ForeignKey("reports.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    recommendation: Mapped[str] = mapped_column(Text, nullable=False)

    report: Mapped["Report"] = relationship("Report", back_populates="findings")


class Recommendation(Base, TimestampedModel):
    __tablename__ = "recommendations"

    report_id: Mapped[str] = mapped_column(String(36), ForeignKey("reports.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    priority: Mapped[str] = mapped_column(String(10), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    owner: Mapped[str] = mapped_column(String(120), nullable=False)
    due: Mapped[str] = mapped_column(String(30), nullable=False)

    report: Mapped["Report"] = relationship("Report", back_populates="recommendations")


class ReportMetric(Base, TimestampedModel):
    __tablename__ = "report_metrics"

    report_id: Mapped[str] = mapped_column(String(36), ForeignKey("reports.id"), nullable=False, unique=True, index=True)
    trend: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    categories: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    severity: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)
    heatmap: Mapped[list[dict]] = mapped_column(JSON, nullable=False, default=list)

    report: Mapped["Report"] = relationship("Report", back_populates="metrics")
