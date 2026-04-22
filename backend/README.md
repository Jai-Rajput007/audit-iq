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
- `DELETE /api/v1/reports/{report_id}`

## Notes

- Database changes are managed with Alembic in `alembic/versions`.
- Default seeded credentials: `demo@auditsummar.ai / demo1234`.
