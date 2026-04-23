from datetime import date
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.core.config import get_settings
from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.report import Report, ReportUpload
from app.models.user import User
from app.schemas.report import (
    ReportChartsResponse,
    ReportChatRequest,
    ReportChatResponse,
    ReportDetailResponse,
    ReportListItemResponse,
    ReportSummaryResponse,
    ReportsListResponse,
)
from app.schemas.upload import ReportStatusResponse, UploadResponse
from app.services.chat import ask_report_chat
from app.tasks.report_tasks import enqueue_report_processing

router = APIRouter(prefix="/reports", tags=["reports"])
settings = get_settings()


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


@router.get("/{report_id}/summary", response_model=ReportSummaryResponse)
def report_summary(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ReportSummaryResponse:
    report = db.scalar(select(Report).where(Report.id == report_id, Report.organization_id == user.organization_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return ReportSummaryResponse(report_id=report.id, summary=report.summary)


@router.get("/{report_id}/findings")
def report_findings(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    report = db.scalar(select(Report).where(Report.id == report_id, Report.organization_id == user.organization_id).options(selectinload(Report.findings)))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return [
        {
            "id": f.id,
            "title": f.title,
            "severity": f.severity,
            "category": f.category,
            "description": f.description,
            "recommendation": f.recommendation,
        }
        for f in report.findings
    ]


@router.get("/{report_id}/risks")
def report_risks(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    findings = report_findings(report_id=report_id, user=user, db=db)
    return [f for f in findings if f["severity"] in {"high", "medium", "low"}]


@router.get("/{report_id}/recommendations")
def report_recommendations(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    report = db.scalar(
        select(Report).where(Report.id == report_id, Report.organization_id == user.organization_id).options(selectinload(Report.recommendations))
    )
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return [
        {
            "id": r.id,
            "title": r.title,
            "priority": r.priority,
            "description": r.description,
            "owner": r.owner,
            "due": r.due,
        }
        for r in report.recommendations
    ]


@router.get("/{report_id}/charts", response_model=ReportChartsResponse)
def report_charts(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ReportChartsResponse:
    report = db.scalar(select(Report).where(Report.id == report_id, Report.organization_id == user.organization_id).options(selectinload(Report.metrics)))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    metrics = report.metrics
    return ReportChartsResponse(
        report_id=report.id,
        trend=metrics.trend if metrics else [],
        categories=metrics.categories if metrics else [],
        severity=metrics.severity if metrics else [],
        heatmap=metrics.heatmap if metrics else [],
    )


@router.get("/{report_id}/original")
def report_original(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> FileResponse:
    report = db.scalar(select(Report).where(Report.id == report_id, Report.organization_id == user.organization_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    upload = db.scalar(select(ReportUpload).where(ReportUpload.report_id == report.id))
    if upload is None or not Path(upload.storage_path).exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Original file not found")
    return FileResponse(path=upload.storage_path, filename=upload.original_filename, media_type=upload.content_type)


@router.post("/{report_id}/chat", response_model=ReportChatResponse)
def report_chat(
    report_id: str, payload: ReportChatRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> ReportChatResponse:
    report = db.scalar(
        select(Report)
        .where(Report.id == report_id, Report.organization_id == user.organization_id)
        .options(selectinload(Report.findings), selectinload(Report.recommendations))
    )
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    context = (
        f"Title: {report.title}\nSummary: {report.summary}\n"
        f"Findings: {[f.title for f in report.findings]}\n"
        f"Recommendations: {[r.title for r in report.recommendations]}"
    )
    answer = ask_report_chat(question=payload.message, report_context=context)
    return ReportChatResponse(report_id=report.id, answer=answer)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    report = db.scalar(select(Report).where(Report.id == report_id, Report.organization_id == user.organization_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    db.delete(report)
    db.commit()


@router.post("/upload", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_report(
    file: UploadFile = File(...),
    audit_type: str = Form(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UploadResponse:
    upload_root = Path(settings.upload_dir)
    upload_root.mkdir(parents=True, exist_ok=True)

    extension = Path(file.filename or "report").suffix
    stored_name = f"{uuid4()}{extension}"
    storage_path = upload_root / stored_name
    content = await file.read()
    storage_path.write_bytes(content)

    report = Report(
        organization_id=user.organization_id,
        title=Path(file.filename or "Uploaded Report").stem,
        audit_type=audit_type,
        uploaded_at=date.today(),
        file_size=f"{round(len(content) / (1024 * 1024), 2)} MB",
        file_type=(extension.replace(".", "") or "PDF").upper(),
        compliance=0,
        risk="medium",
        status="UPLOADED",
        summary="Upload received. Processing pipeline is queued.",
    )
    db.add(report)
    db.flush()

    upload = ReportUpload(
        report_id=report.id,
        original_filename=file.filename or "report",
        storage_path=str(storage_path),
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
        processing_step=1,
    )
    db.add(upload)
    db.commit()

    enqueue_report_processing(report.id)
    return UploadResponse(report_id=report.id, status=report.status, processing_step=upload.processing_step)


@router.get("/{report_id}/status", response_model=ReportStatusResponse)
def report_status(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ReportStatusResponse:
    report = db.scalar(select(Report).where(Report.id == report_id, Report.organization_id == user.organization_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    upload = db.scalar(select(ReportUpload).where(ReportUpload.report_id == report.id))
    step = upload.processing_step if upload else 1
    label = {
        1: "uploaded",
        2: "extracting content",
        3: "running ai analysis",
        4: "building risk model",
        5: "finalizing report",
    }.get(step, "processing")
    return ReportStatusResponse(report_id=report.id, status=report.status, processing_step=step, processing_label=label)


@router.post("/{report_id}/reprocess", response_model=ReportStatusResponse)
def reprocess_report(report_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> ReportStatusResponse:
    report = db.scalar(select(Report).where(Report.id == report_id, Report.organization_id == user.organization_id))
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    upload = db.scalar(select(ReportUpload).where(ReportUpload.report_id == report.id))
    if upload is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Report has no uploaded source")

    report.status = "UPLOADED"
    upload.processing_step = 1
    db.commit()
    enqueue_report_processing(report.id)
    return ReportStatusResponse(report_id=report.id, status=report.status, processing_step=upload.processing_step, processing_label="uploaded")
