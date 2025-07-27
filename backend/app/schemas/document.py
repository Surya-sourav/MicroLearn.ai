from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid
from app.models.document import ContentType, ProcessingStatus

class DocumentBase(BaseModel):
    title: str
    content_type: ContentType

class DocumentCreate(DocumentBase):
    original_url: Optional[str] = None

class Document(DocumentBase):
    id: uuid.UUID
    space_id: uuid.UUID
    original_url: Optional[str]
    file_path: Optional[str]
    content_preview: Optional[str]
    processing_status: ProcessingStatus
    uploaded_at: datetime
    processed_at: Optional[datetime]
    
    class Config:
        from_attributes = True