from datetime import date

from sqlalchemy import delete, select

from app.db.session import SessionLocal
from app.models.report import Finding, Recommendation, Report, ReportMetric
from app.models.user import User


def _seed_payload() -> list[dict]:
    return [
        {
            "title": "Q2 2024 Financial Audit - NorthBay Holdings",
            "audit_type": "Financial",
            "uploaded_at": date(2024, 6, 14),
            "file_size": "2.4 MB",
            "file_type": "PDF",
            "compliance": 92,
            "risk": "low",
            "status": "PROCESSED",
            "summary": "Strong controls overall with medium issues in revenue timing and AP segregation of duties.",
            "findings": [
                {
                    "title": "Revenue recognition timing variance",
                    "severity": "medium",
                    "category": "Revenue",
                    "description": "Subscription revenue recognized 1-3 days early in sampled transactions.",
                    "recommendation": "Implement automated revenue cut-off controls in ERP.",
                }
            ],
            "recommendations": [
                {
                    "title": "Automate revenue cut-off controls",
                    "priority": "P1",
                    "description": "Deploy workflow enforcing period close cutoffs.",
                    "owner": "Controller",
                    "due": "2024-08-30",
                }
            ],
        },
        {
            "title": "GDPR Compliance Review 2024",
            "audit_type": "Compliance",
            "uploaded_at": date(2024, 6, 2),
            "file_size": "3.1 MB",
            "file_type": "PDF",
            "compliance": 78,
            "risk": "high",
            "status": "PROCESSED",
            "summary": "High-severity gaps in DSAR SLA and missing vendor DPAs.",
            "findings": [
                {
                    "title": "DSAR response exceeds 30 days",
                    "severity": "high",
                    "category": "Rights",
                    "description": "Average DSAR response is above legal SLA.",
                    "recommendation": "Implement DSAR ticketing with SLA controls.",
                }
            ],
            "recommendations": [
                {
                    "title": "Deploy DSAR automation platform",
                    "priority": "P1",
                    "description": "Adopt privacy workflow platform.",
                    "owner": "DPO",
                    "due": "2024-07-30",
                }
            ],
        },
        {
            "title": "SOC 2 Type II - Cloud Infrastructure",
            "audit_type": "IT Security",
            "uploaded_at": date(2024, 5, 28),
            "file_size": "5.7 MB",
            "file_type": "PDF",
            "compliance": 94,
            "risk": "low",
            "status": "PROCESSED",
            "summary": "Clean opinion with minor service-account hardening observation.",
            "findings": [],
            "recommendations": [],
        },
        {
            "title": "Operational Efficiency Review - West Plant",
            "audit_type": "Operational",
            "uploaded_at": date(2024, 5, 19),
            "file_size": "1.8 MB",
            "file_type": "DOCX",
            "compliance": 84,
            "risk": "medium",
            "status": "PROCESSED",
            "summary": "Maintenance backlog and outdated SOPs drive process risk.",
            "findings": [],
            "recommendations": [],
        },
        {
            "title": "ESG Disclosure Audit FY24",
            "audit_type": "ESG",
            "uploaded_at": date(2024, 5, 10),
            "file_size": "4.2 MB",
            "file_type": "PDF",
            "compliance": 88,
            "risk": "medium",
            "status": "PROCESSED",
            "summary": "Scope 3 data quality remains the primary ESG gap.",
            "findings": [],
            "recommendations": [],
        },
        {
            "title": "Internal Audit - Procurement Cycle",
            "audit_type": "Internal Audit",
            "uploaded_at": date(2024, 4, 29),
            "file_size": "2.1 MB",
            "file_type": "PDF",
            "compliance": 81,
            "risk": "medium",
            "status": "PROCESSED",
            "summary": "After-the-fact purchase orders and vendor master data issues found.",
            "findings": [],
            "recommendations": [],
        },
        {
            "title": "Vendor Risk Assessment - Top 25 Suppliers",
            "audit_type": "Vendor",
            "uploaded_at": date(2024, 4, 15),
            "file_size": "1.5 MB",
            "file_type": "XLSX",
            "compliance": 73,
            "risk": "high",
            "status": "PROCESSED",
            "summary": "Concentration and cyber risk exposure across critical vendors.",
            "findings": [],
            "recommendations": [],
        },
        {
            "title": "ISO 9001 Quality Management System Audit",
            "audit_type": "Quality",
            "uploaded_at": date(2024, 3, 30),
            "file_size": "2.9 MB",
            "file_type": "PDF",
            "compliance": 90,
            "risk": "low",
            "status": "PROCESSED",
            "summary": "No major nonconformities with minor document version control issues.",
            "findings": [],
            "recommendations": [],
        },
    ]


def run() -> None:
    db = SessionLocal()
    try:
        demo_user = db.scalar(select(User).where(User.email == "demo@auditsummar.ai"))
        if demo_user is None:
            raise RuntimeError("Demo user not found. Run scripts/seed_demo.py first.")

        db.execute(delete(ReportMetric))
        db.execute(delete(Finding))
        db.execute(delete(Recommendation))
        db.execute(delete(Report))
        db.flush()

        common_trend = [
            {"period": "Q1 23", "compliance": 72},
            {"period": "Q2 23", "compliance": 78},
            {"period": "Q3 23", "compliance": 81},
            {"period": "Q4 23", "compliance": 85},
            {"period": "Q1 24", "compliance": 88},
            {"period": "Q2 24", "compliance": 91},
        ]

        for item in _seed_payload():
            report = Report(
                organization_id=demo_user.organization_id,
                title=item["title"],
                audit_type=item["audit_type"],
                uploaded_at=item["uploaded_at"],
                file_size=item["file_size"],
                file_type=item["file_type"],
                compliance=item["compliance"],
                risk=item["risk"],
                status=item["status"],
                summary=item["summary"],
            )
            db.add(report)
            db.flush()

            for finding in item["findings"]:
                db.add(Finding(report_id=report.id, **finding))
            for recommendation in item["recommendations"]:
                db.add(Recommendation(report_id=report.id, **recommendation))

            db.add(
                ReportMetric(
                    report_id=report.id,
                    trend=common_trend,
                    categories=[{"name": "Controls", "value": 2}, {"name": "Process", "value": 1}],
                    severity=[{"name": "High", "value": 1}, {"name": "Medium", "value": 2}, {"name": "Low", "value": 1}],
                    heatmap=[
                        {"area": "Process", "impact": 2, "likelihood": 2},
                        {"area": "Controls", "impact": 3, "likelihood": 2},
                    ],
                )
            )

        db.commit()
        print("Seeded 8 reports for demo organization.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
