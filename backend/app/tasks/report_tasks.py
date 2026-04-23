from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.services.report_processing import process_report
from app.tasks.worker import celery_app


@celery_app.task(name="app.tasks.report_tasks.process_report_task")
def process_report_task(report_id: str) -> None:
    db: Session = SessionLocal()
    try:
        process_report(report_id=report_id, db=db)
    finally:
        db.close()


def enqueue_report_processing(report_id: str) -> None:
    try:
        process_report_task.delay(report_id)
    except Exception:
        db = SessionLocal()
        try:
            process_report(report_id=report_id, db=db)
        finally:
            db.close()
