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
- [x] Step 4: Upload pipeline
- [x] Step 5: Viewer and AI chat
- [x] Step 6: Settings and admin
- [x] Step 7: Hardening and deployment

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

- [x] Add upload model and status lifecycle (`UPLOADED`, `PROCESSING`, `PROCESSED`, `FAILED`)
- [x] Add upload endpoint (`POST /reports/upload`) with local storage fallback
- [x] Add async job queue scaffold (Redis + Celery placeholders)
- [x] Add processing status endpoint (`GET /reports/{id}/status`)
- [x] Add reprocess endpoint (`POST /reports/{id}/reprocess`)

## Next Sprint (Step 5)

- [x] Add report summary endpoint contract for dedicated tab
- [x] Add findings/risks/recommendations dedicated endpoints
- [x] Add charts endpoint with metric payload contract
- [x] Add original file preview endpoint for uploaded source
- [x] Add Groq-backed report chat endpoint scaffold (`POST /reports/{id}/chat`)

## Next Sprint (Step 6)

- [x] Add settings profile APIs (get/update)
- [x] Add security password change endpoint
- [x] Add team list/add/role update endpoints with role guard
- [x] Add notification preferences get/update APIs
- [x] Add templates CRUD APIs
- [x] Add API keys create/list/revoke APIs

## Next Sprint (Step 7)

- [x] Add readiness probe endpoint and DB check
- [x] Add request context + basic rate-limit middleware
- [x] Add Dockerfile and docker-compose for deployability
- [x] Add baseline tests (`pytest`) for health/security utilities
- [x] Update backend docs with run/migrate/seed/test flows and endpoint map
