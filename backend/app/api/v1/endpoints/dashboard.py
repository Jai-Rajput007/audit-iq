from fastapi import APIRouter, Depends
from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.report import Report
from app.models.user import User
from app.schemas.dashboard import DashboardStatsResponse

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardStatsResponse)
def dashboard_summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> DashboardStatsResponse:
    org_filter = Report.organization_id == user.organization_id
    row = db.execute(
        select(
            func.count(Report.id),
            func.sum(case((func.lower(Report.status) == "processed", 1), else_=0)),
            func.sum(case((func.lower(Report.status) == "failed", 1), else_=0)),
            func.coalesce(func.avg(Report.compliance), 0),
            func.sum(case((Report.risk == "high", 1), else_=0)),
        ).where(org_filter)
    ).one()

    return DashboardStatsResponse(
        total_reports=int(row[0] or 0),
        processed_reports=int(row[1] or 0),
        failed_reports=int(row[2] or 0),
        avg_compliance=round(float(row[3] or 0), 2),
        high_risk_reports=int(row[4] or 0),
    )
