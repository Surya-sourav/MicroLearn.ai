from pydantic import BaseModel, computed_field
from datetime import datetime
from typing import List
import uuid
from app.models.chat import ChatRole

class ChatRequest(BaseModel):
    message: str
    space_id: uuid.UUID

class ChatMessage(BaseModel):
    id: uuid.UUID
    content: str
    role: ChatRole
    created_at: datetime
    
    @computed_field
    @property
    def is_user_message(self) -> bool:
        return self.role == ChatRole.USER
    
    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    message: str
    sources: List[str] = []
    
class StreamingChatResponse(BaseModel):
    content: str
    is_complete: bool = False
    sources: List[str] = []