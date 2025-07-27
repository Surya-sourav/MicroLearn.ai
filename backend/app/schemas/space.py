from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import uuid

class SpaceBase(BaseModel):
    name: str
    description: Optional[str] = None
    subject: str
    color: str = "#3B82F6"

class SpaceCreate(SpaceBase):
    pass

class SpaceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    color: Optional[str] = None

class Space(SpaceBase):
    id: uuid.UUID
    owner_id: uuid.UUID
    vector_namespace: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
