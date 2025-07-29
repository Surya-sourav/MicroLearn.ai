from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class Space(Base):
    __tablename__ = "spaces"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    subject = Column(String, nullable=False)
    color = Column(String, default="#3B82F6")
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    vector_namespace = Column(String, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="spaces")
    flashcards = relationship("Flashcard", back_populates="space", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="space", cascade="all, delete-orphan")
    chat_sessions = relationship("ChatSession", back_populates="space", cascade="all, delete-orphan")