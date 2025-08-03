from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
import uuid
from app.models.flashcard import DifficultyLevel

class FlashcardBase(BaseModel):
    question: str
    answer: str
    difficulty: DifficultyLevel = DifficultyLevel.MEDIUM
    tags: Optional[List[str]] = []

class FlashcardCreate(FlashcardBase):
    space_id: uuid.UUID

class FlashcardUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    difficulty: Optional[DifficultyLevel] = None
    tags: Optional[List[str]] = None

class FlashcardReview(BaseModel):
    correct: bool
    difficulty_rating: Optional[int] = 3  # 1-5 scale, default to 3 if not provided

class Flashcard(FlashcardBase):
    id: uuid.UUID
    space_id: uuid.UUID
    source_document_id: Optional[uuid.UUID]
    created_at: datetime
    last_reviewed: Optional[datetime]
    review_count: int
    correct_count: int
    ease_factor: float
    interval: int
    next_review: datetime
    
    class Config:
        from_attributes = True