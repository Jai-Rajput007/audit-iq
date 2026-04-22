from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.deps import get_current_user
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.db.session import get_db
from app.models.user import Organization, RefreshToken, User
from app.schemas.auth import LoginRequest, RefreshRequest, SignupRequest, TokenResponse
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def _slugify_org_name(name: str) -> str:
    return "-".join(name.strip().lower().split())


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> TokenResponse:
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    org_slug = _slugify_org_name(payload.organization_name)
    org = db.scalar(select(Organization).where(Organization.slug == org_slug))
    if org is None:
        org = Organization(name=payload.organization_name, slug=org_slug)
        db.add(org)
        db.flush()

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        password_hash=get_password_hash(payload.password),
        role=payload.role,
        organization_id=org.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)
    refresh_token, jti = create_refresh_token(user.id)
    payload_decoded = decode_token(refresh_token)
    refresh_session = RefreshToken(
        user_id=user.id,
        jti=jti,
        token_hash=hash_token(refresh_token),
        expires_at=datetime.fromtimestamp(payload_decoded["exp"], tz=timezone.utc),
    )
    db.add(refresh_session)
    db.commit()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is inactive")

    access_token = create_access_token(user.id)
    refresh_token, jti = create_refresh_token(user.id)
    payload_decoded = decode_token(refresh_token)
    refresh_session = RefreshToken(
        user_id=user.id,
        jti=jti,
        token_hash=hash_token(refresh_token),
        expires_at=datetime.fromtimestamp(payload_decoded["exp"], tz=timezone.utc),
    )
    db.add(refresh_session)
    db.commit()
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    try:
        decoded = decode_token(payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token") from exc

    token_type = decoded.get("type")
    user_id = decoded.get("sub")
    jti = decoded.get("jti")
    if token_type != "refresh" or not user_id or not jti:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    session = db.scalar(select(RefreshToken).where(RefreshToken.jti == jti))
    if session is None or session.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")
    if session.expires_at <= datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
    if session.token_hash != hash_token(payload.refresh_token):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token mismatch")

    session.revoked_at = datetime.now(timezone.utc)
    new_refresh_token, new_jti = create_refresh_token(user_id)
    new_payload = decode_token(new_refresh_token)
    db.add(
        RefreshToken(
            user_id=user_id,
            jti=new_jti,
            token_hash=hash_token(new_refresh_token),
            expires_at=datetime.fromtimestamp(new_payload["exp"], tz=timezone.utc),
        )
    )
    db.commit()
    return TokenResponse(access_token=create_access_token(user_id), refresh_token=new_refresh_token)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse.model_validate(user)
