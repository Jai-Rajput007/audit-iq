from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.report import Report
from app.models.user import User
from app.schemas.report import ReportDetailResponse, ReportListItemResponse, ReportsListResponse

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=ReportsListResponse)
def list_reports(
    q: str | None = Query(default=None),
    audit_type: str | None = Query(default=None),
    risk: str | None = Query(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    sort_by: str = Query(default="uploaded_at"),
    sort_order: str = Query(default="desc"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportsListResponse:
    filters = [Report.organization_id == user.organization_id]
    if q:
        like = f"%{q}%"
        filters.append(or_(Report.title.ilike(like), Report.summary.ilike(like)))
    if audit_type:
        filters.append(Report.audit_type == audit_type)
    if risk:
        filters.append(Report.risk == risk)
    if status_filter:
        filters.append(Report.status == status_filter)

    sort_column_map = {"uploaded_at": Report.uploaded_at, "compliance": Report.compliance, "title": Report.title}
    sort_column = sort_column_map.get(sort_by, Report.uploaded_at)
    order_clause = asc(sort_column) if sort_order.lower() == "asc" else desc(sort_column)

    total = db.scalar(select(func.count()).select_from(Report).where(*filters)) or 0
    rows = db.scalars(
        select(Report).where(*filters).order_by(order_clause).offset((page - 1) * page_size).limit(page_size)
    ).all()

    items = [ReportListItemResponse.model_validate(row) for row in rows]
    return ReportsListResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{report_id}", response_model=ReportDetailResponse)
def get_report(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ReportDetailResponse:
    report = db.scalar(
        select(Report)
        .where(Report.id == report_id, Report.organization_id == user.organization_id)
        .options(selectinload(Report.findings), selectinload(Report.recommendations), selectinload(Report.metrics))
    )
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    trend = report.metrics.trend if report.metrics else []
    categories = report.metrics.categories if report.metrics else []
    severity = report.metrics.severity if report.metrics else []
    heatmap = report.metrics.heatmap if report.metrics else []
    return ReportDetailResponse(
        id=report.id,
        title=report.title,
        audit_type=report.audit_type,
        uploaded_at=report.uploaded_at,
        file_size=report.file_size,
        file_type=report.file_type,
        compliance=report.compliance,
        risk=report.risk,
        status=report.status,
        summary=report.summary,
        findings=report.findings,
        recommendations=report.recommendations,
        trend=trend,
        categories=categories,
        severity=severity,
        heatmap=heatmap,
    )


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    report = db.scalar(select(Report).where(Report.id == report_id, Report.organization_id == user.organization_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    db.delete(report)
    db.commit()
