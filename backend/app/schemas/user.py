from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
import uuid

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
