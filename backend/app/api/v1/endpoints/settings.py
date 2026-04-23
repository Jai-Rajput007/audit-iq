import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_role
from app.core.security import get_password_hash, hash_token, verify_password
from app.db.session import get_db
from app.models.settings import ApiKey, NotificationPreference, ReportTemplate
from app.models.user import User
from app.schemas.settings import (
    ApiKeyCreateRequest,
    NotificationPreferenceRequest,
    PasswordChangeRequest,
    ProfileUpdateRequest,
    TeamMemberCreateRequest,
    TeamRoleUpdateRequest,
    TemplateCreateRequest,
    TemplateUpdateRequest,
)
from app.schemas.user import UserResponse

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("/profile", response_model=UserResponse)
def get_profile(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(user)


@router.put("/profile", response_model=UserResponse)
def update_profile(payload: ProfileUpdateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> UserResponse:
    user.full_name = payload.full_name
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


@router.post("/security/change-password")
def change_password(
    payload: PasswordChangeRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict[str, str]:
    if not verify_password(payload.current_password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")
    user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return {"status": "ok", "message": "Password updated"}


@router.get("/team")
def list_team(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    members = db.scalars(select(User).where(User.organization_id == user.organization_id)).all()
    return [{"id": m.id, "email": m.email, "full_name": m.full_name, "role": m.role, "is_active": m.is_active} for m in members]


@router.post("/team")
def add_team_member(
    payload: TeamMemberCreateRequest,
    _: User = Depends(require_role({"Admin", "Manager"})),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists")
    temp_password = secrets.token_urlsafe(12)
    member = User(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        password_hash=get_password_hash(temp_password),
        organization_id=user.organization_id,
        is_active=True,
    )
    db.add(member)
    db.commit()
    return {"status": "ok", "temp_password": temp_password}


@router.patch("/team/{member_id}/role")
def update_member_role(
    member_id: str,
    payload: TeamRoleUpdateRequest,
    _: User = Depends(require_role({"Admin", "Manager"})),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    member = db.scalar(select(User).where(User.id == member_id, User.organization_id == user.organization_id))
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")
    member.role = payload.role
    db.commit()
    return {"status": "ok", "message": "Role updated"}


@router.get("/notifications")
def get_notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    pref = db.scalar(select(NotificationPreference).where(NotificationPreference.user_id == user.id))
    if pref is None:
        pref = NotificationPreference(user_id=user.id, email_enabled=True, push_enabled=True, digest_enabled=False)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return {
        "email_enabled": pref.email_enabled,
        "push_enabled": pref.push_enabled,
        "digest_enabled": pref.digest_enabled,
    }


@router.put("/notifications")
def update_notifications(
    payload: NotificationPreferenceRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    pref = db.scalar(select(NotificationPreference).where(NotificationPreference.user_id == user.id))
    if pref is None:
        pref = NotificationPreference(user_id=user.id)
        db.add(pref)
    pref.email_enabled = payload.email_enabled
    pref.push_enabled = payload.push_enabled
    pref.digest_enabled = payload.digest_enabled
    db.commit()
    return {"status": "ok"}


@router.get("/templates")
def list_templates(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    templates = db.scalars(select(ReportTemplate).where(ReportTemplate.organization_id == user.organization_id)).all()
    return [{"id": t.id, "name": t.name, "content": t.content} for t in templates]


@router.post("/templates")
def create_template(
    payload: TemplateCreateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    template = ReportTemplate(organization_id=user.organization_id, name=payload.name, content=payload.content)
    db.add(template)
    db.commit()
    db.refresh(template)
    return {"id": template.id, "name": template.name, "content": template.content}


@router.put("/templates/{template_id}")
def update_template(
    template_id: str, payload: TemplateUpdateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> dict:
    template = db.scalar(
        select(ReportTemplate).where(ReportTemplate.id == template_id, ReportTemplate.organization_id == user.organization_id)
    )
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    template.name = payload.name
    template.content = payload.content
    db.commit()
    return {"status": "ok"}


@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_template(template_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> None:
    template = db.scalar(
        select(ReportTemplate).where(ReportTemplate.id == template_id, ReportTemplate.organization_id == user.organization_id)
    )
    if template is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    db.delete(template)
    db.commit()


@router.get("/api-keys")
def list_api_keys(user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> list[dict]:
    keys = db.scalars(select(ApiKey).where(ApiKey.organization_id == user.organization_id)).all()
    return [{"id": k.id, "name": k.name, "key_prefix": k.key_prefix, "is_revoked": k.is_revoked} for k in keys]


@router.post("/api-keys")
def create_api_key(payload: ApiKeyCreateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    raw_key = f"ask_{secrets.token_urlsafe(24)}"
    key_prefix = raw_key[:12]
    key = ApiKey(
        organization_id=user.organization_id,
        name=payload.name,
        key_prefix=key_prefix,
        key_hash=hash_token(raw_key),
        is_revoked=False,
    )
    db.add(key)
    db.commit()
    db.refresh(key)
    return {"id": key.id, "name": key.name, "api_key": raw_key}


@router.post("/api-keys/{key_id}/revoke")
def revoke_api_key(key_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> dict:
    key = db.scalar(select(ApiKey).where(ApiKey.id == key_id, ApiKey.organization_id == user.organization_id))
    if key is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API key not found")
    key.is_revoked = True
    db.commit()
    return {"status": "ok", "message": "API key revoked"}
