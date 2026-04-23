from pydantic import BaseModel, Field


class ProfileUpdateRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class TeamMemberCreateRequest(BaseModel):
    email: str
    full_name: str
    role: str = "Viewer"


class TeamRoleUpdateRequest(BaseModel):
    role: str


class NotificationPreferenceRequest(BaseModel):
    email_enabled: bool
    push_enabled: bool
    digest_enabled: bool


class TemplateCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    content: str = Field(min_length=5)


class TemplateUpdateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    content: str = Field(min_length=5)


class ApiKeyCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
