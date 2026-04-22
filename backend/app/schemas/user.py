from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    role: str
    organization_id: str
    is_active: bool

    class Config:
        from_attributes = True
