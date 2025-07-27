from sqlalchemy import Column, String, Text, Integer, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
import uuid
import enum
from app.core.database import Base

class DifficultyLevel(enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Flashcard(Base):
    __tablename__ = "flashcards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    difficulty = Column(SQLEnum(DifficultyLevel), default=DifficultyLevel.MEDIUM)
    tags = Column(JSON)
    space_id = Column(UUID(as_uuid=True), ForeignKey("spaces.id"), nullable=False)
    source_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_reviewed = Column(DateTime)
    review_count = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    
    # Spaced repetition fields
    ease_factor = Column(Float, default=2.5)
    interval = Column(Integer, default=1)
    next_review = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=1))
    
    # Relationships
    space = relationship("Space", back_populates="flashcards")
    source_document = relationship("Document", back_populates="generated_flashcards")