from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    bio: Optional[str] = None
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="Min 8 characters")


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    bio: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class UserAdminUpdate(UserUpdate):
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class UserResponse(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    enrollment_count: Optional[int] = 0

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    id: int
    full_name: str
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True
