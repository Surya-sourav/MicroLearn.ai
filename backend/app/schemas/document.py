from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict, Any, List
import uuid
from app.models.document import ContentType, ProcessingStatus

class DocumentBase(BaseModel):
    title: str
    content_type: ContentType

class DocumentCreate(DocumentBase):
    pass  # Remove original_url since it doesn't exist in the model

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content_preview: Optional[str] = None

class Document(DocumentBase):
    id: uuid.UUID
    space_id: uuid.UUID
    file_path: Optional[str]
    content_preview: Optional[str]
    processing_status: ProcessingStatus
    error_message: Optional[str]
    
    # Vector storage information
    vector_ids: Optional[List[str]] = []
    chunk_count: Optional[int] = 0
    
    # Document structure and content
    doc_metadata: Optional[Dict[str, Any]] = None
    doc_structure: Optional[Dict[str, Any]] = None
    extracted_tables: Optional[Dict[str, Any]] = None
    extracted_images: Optional[Dict[str, Any]] = None
    
    # Content statistics
    word_count: Optional[int] = None
    page_count: Optional[int] = None
    table_count: Optional[int] = None
    image_count: Optional[int] = None
    
    # Timestamps - match exactly with SQLAlchemy model
    created_at: datetime          # This exists in the model
    updated_at: datetime          # This exists in the model
    processed_at: Optional[datetime] = None  # This exists in the model
    
    class Config:
        from_attributes = True

# Add these computed properties to match your SQLAlchemy model
class DocumentWithExtras(Document):
    has_tables: bool = False
    has_images: bool = False
    
    @classmethod
    def from_db_model(cls, db_document):
        """Convert SQLAlchemy model to Pydantic with computed properties"""
        data = {
            "id": db_document.id,
            "space_id": db_document.space_id,
            "title": db_document.title,
            "content_type": db_document.content_type,
            "file_path": db_document.file_path,
            "content_preview": db_document.content_preview,
            "processing_status": db_document.processing_status,
            "error_message": db_document.error_message,
            "vector_ids": db_document.vector_ids or [],
            "chunk_count": db_document.chunk_count or 0,
            "doc_metadata": db_document.doc_metadata,
            "doc_structure": db_document.doc_structure,
            "extracted_tables": db_document.extracted_tables,
            "extracted_images": db_document.extracted_images,
            "word_count": db_document.word_count,
            "page_count": db_document.page_count,
            "table_count": db_document.table_count,
            "image_count": db_document.image_count,
            "created_at": db_document.created_at,
            "updated_at": db_document.updated_at,
            "processed_at": db_document.processed_at,
            "has_tables": db_document.has_tables,
            "has_images": db_document.has_images,
        }
        return cls(**data)