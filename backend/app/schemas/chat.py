from pydantic import BaseModel
from datetime import datetime
from typing import List
import uuid

class ChatRequest(BaseModel):
    message: str
    space_id: uuid.UUID

class ChatMessage(BaseModel):
    id: uuid.UUID
    content: str
    is_user_message: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    message: str
    sources: List[str] = []