# AuditSummar Backend Progress

## Implementation Workflow

1. Backend foundation (FastAPI + config + DB wiring)  
2. Auth and RBAC (signup/login/refresh/me + role guards)  
3. Reports and dashboard APIs (replace frontend mock data)  
4. Upload and async processing pipeline (5-step AI flow)  
5. Report viewer APIs (7 tabs + AI chat)  
6. Settings and admin APIs (profile/security/team/templates/api keys)  
7. Production hardening (tests, observability, security, deploy)

## Status Tracker

- [x] Workflow defined
- [x] Step 1: Backend foundation
- [x] Step 2: Auth and RBAC
- [x] Step 3: Reports and dashboard
- [ ] Step 4: Upload pipeline
- [ ] Step 5: Viewer and AI chat
- [ ] Step 6: Settings and admin
- [ ] Step 7: Hardening and deployment

## Current Sprint (Step 1)

- [x] Create Python backend app structure
- [x] Add FastAPI app entrypoint and API router
- [x] Add environment-based settings
- [x] Add PostgreSQL SQLAlchemy setup
- [x] Add health endpoints
- [x] Add starter auth/user/org models and schemas
- [x] Add JWT + password utility module
- [x] Add run instructions

## Current Sprint (Step 2)

- [x] Add refresh-token endpoint and token rotation table
- [x] Add `/auth/me` endpoint
- [x] Add role-based guard utility (`Admin/Manager/Auditor/Viewer`)
- [x] Add seeded demo user (`demo@auditsummar.ai`)
- [x] Add first Alembic migration and remove dev-time table auto-create

## Next Sprint (Step 3)

- [x] Create report domain models (`reports`, `findings`, `recommendations`, `report_metrics`)
- [x] Add dashboard summary endpoint
- [x] Add reports list endpoint with search/filter/pagination/sort
- [x] Add report detail endpoint for viewer base data
- [x] Add report delete endpoint
- [x] Add seed script for initial 8 mock reports in database

## Next Sprint (Step 4)

- [ ] Add upload model and status lifecycle (`UPLOADED`, `PROCESSING`, `PROCESSED`, `FAILED`)
- [ ] Add upload endpoint (`POST /reports/upload`) with local storage fallback
- [ ] Add async job queue scaffold (Redis + Celery placeholders)
- [ ] Add processing status endpoint (`GET /reports/{id}/status`)
- [ ] Add reprocess endpoint (`POST /reports/{id}/reprocess`)
