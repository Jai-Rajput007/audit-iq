# AuditSummar Backend (Step 1)

## Quick Start

1. Create and activate a Python virtual environment.
2. Install dependencies:
   `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and update values.
4. Run migrations:
   `alembic upgrade head`
5. Seed demo account:
   `python scripts/seed_demo.py`
6. Seed initial report dataset:
   `python scripts/seed_reports.py`
7. Run API:
   `uvicorn app.main:app --reload --port 8000`
8. Optional worker (queue mode):
   `celery -A app.tasks.worker.celery_app worker --loglevel=info -Q report-processing`
9. Run tests:
   `pytest`

## Available Endpoints (v1)

- `GET /api/v1/health`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `GET /api/v1/users/me`
- `GET /api/v1/users/admin/check`
- `GET /api/v1/dashboard/summary`
- `GET /api/v1/reports`
- `GET /api/v1/reports/{report_id}`
- `GET /api/v1/reports/{report_id}/summary`
- `GET /api/v1/reports/{report_id}/findings`
- `GET /api/v1/reports/{report_id}/risks`
- `GET /api/v1/reports/{report_id}/recommendations`
- `GET /api/v1/reports/{report_id}/charts`
- `GET /api/v1/reports/{report_id}/original`
- `POST /api/v1/reports/{report_id}/chat`
- `DELETE /api/v1/reports/{report_id}`
- `POST /api/v1/reports/upload`
- `GET /api/v1/reports/{report_id}/status`
- `POST /api/v1/reports/{report_id}/reprocess`
- `GET /api/v1/settings/profile`
- `PUT /api/v1/settings/profile`
- `POST /api/v1/settings/security/change-password`
- `GET /api/v1/settings/team`
- `POST /api/v1/settings/team`
- `PATCH /api/v1/settings/team/{member_id}/role`
- `GET /api/v1/settings/notifications`
- `PUT /api/v1/settings/notifications`
- `GET /api/v1/settings/templates`
- `POST /api/v1/settings/templates`
- `PUT /api/v1/settings/templates/{template_id}`
- `DELETE /api/v1/settings/templates/{template_id}`
- `GET /api/v1/settings/api-keys`
- `POST /api/v1/settings/api-keys`
- `POST /api/v1/settings/api-keys/{key_id}/revoke`

## Notes

- Database changes are managed with Alembic in `alembic/versions`.
- Default seeded credentials: `demo@auditsummar.ai / demo1234`.
- If Redis/Celery is unavailable, upload processing falls back to local synchronous execution.
- `GET /api/v1/ready` performs a DB readiness probe.
- Middleware adds `X-Request-Id` and simple per-IP rate limiting.
