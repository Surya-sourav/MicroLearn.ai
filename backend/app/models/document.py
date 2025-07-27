from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum
from app.core.database import Base

class ContentType(enum.Enum):
    PDF = "pdf"
    DOCX = "docx"
    URL = "url"
    YOUTUBE = "youtube"

class ProcessingStatus(enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    content_type = Column(SQLEnum(ContentType), nullable=False)
    original_url = Column(String)
    file_path = Column(String)
    content_preview = Column(Text)
    processing_status = Column(SQLEnum(ProcessingStatus), default=ProcessingStatus.PENDING)
    space_id = Column(UUID(as_uuid=True), ForeignKey("spaces.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime)
    
    # Relationships
    space = relationship("Space", back_populates="documents")
    generated_flashcards = relationship("Flashcard", back_populates="source_document")
    