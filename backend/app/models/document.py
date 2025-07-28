from enum import Enum
from datetime import datetime
from typing import Optional, List, Dict, Any
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SQLEnum, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class ContentType(str, Enum):
    PDF = "pdf"
    DOCX = "docx"

class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    content_type = Column(SQLEnum(ContentType), nullable=False)
    content_preview = Column(String, nullable=True)
    processing_status = Column(SQLEnum(ProcessingStatus), default=ProcessingStatus.PENDING)
    error_message = Column(String, nullable=True)
    
    # Vector storage information
    vector_ids = Column(JSON, nullable=True, default=list)  # List of vector IDs in Pinecone
    chunk_count = Column(Integer, nullable=True, default=0)  # Number of chunks/vectors
    
    # Document structure and content
    doc_metadata = Column(JSON, nullable=True)  # Document metadata (sections, pages, etc.)
    doc_structure = Column(JSON, nullable=True)  # Document structure (tables, images, etc.)
    extracted_tables = Column(JSON, nullable=True)  # Extracted table data
    extracted_images = Column(JSON, nullable=True)  # Extracted image data and analysis
    
    # Content statistics
    word_count = Column(Integer, nullable=True)
    page_count = Column(Integer, nullable=True)
    table_count = Column(Integer, nullable=True)
    image_count = Column(Integer, nullable=True)
    
    # Relationships
    space_id = Column(UUID(as_uuid=True), ForeignKey("spaces.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Document(id={self.id}, title={self.title}, status={self.processing_status})>"

    @property
    def processing_complete(self) -> bool:
        return self.processing_status == ProcessingStatus.COMPLETED

    @property
    def has_tables(self) -> bool:
        return bool(self.extracted_tables and self.table_count > 0)

    @property
    def has_images(self) -> bool:
        return bool(self.extracted_images and self.image_count > 0)

    def to_dict(self) -> Dict[str, Any]:
        """Convert document to dictionary with all metadata"""
        return {
            "id": str(self.id),
            "title": self.title,
            "content_type": self.content_type.value,
            "processing_status": self.processing_status.value,
            "content_preview": self.content_preview,
            "error_message": self.error_message,
            "statistics": {
                "word_count": self.word_count,
                "page_count": self.page_count,
                "table_count": self.table_count,
                "image_count": self.image_count,
                "chunk_count": self.chunk_count
            },
            "metadata": self.doc_metadata,
            "structure": self.doc_structure,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "processed_at": self.processed_at.isoformat() if self.processed_at else None,
            "has_tables": self.has_tables,
            "has_images": self.has_images
        } 