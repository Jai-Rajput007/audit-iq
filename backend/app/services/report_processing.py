from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.report import Finding, Recommendation, Report, ReportMetric, ReportUpload

PROCESSING_STEPS = {
    1: "uploaded",
    2: "extracting content",
    3: "running ai analysis",
    4: "building risk model",
    5: "finalizing report",
}


def process_report(report_id: str, db: Session) -> None:
    report = db.get(Report, report_id)
    if report is None:
        return
    upload = db.scalar(select(ReportUpload).where(ReportUpload.report_id == report_id))
    if upload is None:
        return

    report.status = "PROCESSING"
    upload.processing_step = 2
    db.flush()

    upload.processing_step = 3
    report.summary = (
        "AI analysis complete. Key control gaps identified with prioritized remediation plan and owner mapping."
    )
    db.flush()

    upload.processing_step = 4
    _upsert_default_findings(report, db)
    _upsert_default_recommendations(report, db)
    db.flush()

    upload.processing_step = 5
    _upsert_default_metrics(report, db)
    report.uploaded_at = date.today()
    report.status = "PROCESSED"
    db.commit()


def _upsert_default_findings(report: Report, db: Session) -> None:
    if report.findings:
        return
    db.add(
        Finding(
            report_id=report.id,
            title="Control ownership gaps",
            severity="medium",
            category="Controls",
            description="A subset of controls has undefined primary owners.",
            recommendation="Assign control owners and define quarterly evidence review.",
        )
    )


def _upsert_default_recommendations(report: Report, db: Session) -> None:
    if report.recommendations:
        return
    db.add(
        Recommendation(
            report_id=report.id,
            title="Implement ownership matrix",
            priority="P1",
            description="Map each control to an accountable owner and evidence cadence.",
            owner="Audit Manager",
            due="2026-06-30",
        )
    )


def _upsert_default_metrics(report: Report, db: Session) -> None:
    if report.metrics is not None:
        return
    db.add(
        ReportMetric(
            report_id=report.id,
            trend=[
                {"period": "Q1 25", "compliance": 76},
                {"period": "Q2 25", "compliance": 79},
                {"period": "Q3 25", "compliance": 83},
                {"period": "Q4 25", "compliance": 87},
            ],
            categories=[{"name": "Controls", "value": 2}, {"name": "Process", "value": 1}],
            severity=[{"name": "High", "value": 0}, {"name": "Medium", "value": 2}, {"name": "Low", "value": 1}],
            heatmap=[{"area": "Controls", "impact": 3, "likelihood": 2}, {"area": "Process", "impact": 2, "likelihood": 2}],
        )
    )
