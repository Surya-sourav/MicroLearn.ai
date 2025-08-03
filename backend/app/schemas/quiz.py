from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid

class QuizQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    correct_answer: int  # Index of correct option
    explanation: Optional[str] = None
    difficulty: str = "medium"

class QuizCreate(BaseModel):
    space_ids: List[uuid.UUID]
    question_count: int = 10
    difficulty: str = "mixed"  # easy, medium, hard, mixed
    time_limit: int = 15  # in minutes

class QuizResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    question_count: int
    difficulty: str
    time_limit: int
    questions: List[QuizQuestion]
    created_at: datetime
    space_ids: List[uuid.UUID]

class QuizAttemptCreate(BaseModel):
    quiz_id: uuid.UUID
    answers: Dict[str, int]  # question_id -> selected_option_index

class QuizAttemptResponse(BaseModel):
    id: uuid.UUID
    quiz_id: uuid.UUID
    started_at: datetime
    completed_at: Optional[datetime]
    time_taken: Optional[int]
    score: Optional[float]
    total_questions: int
    correct_answers: Optional[int]
    answers: Dict[str, int]

class QuizResult(BaseModel):
    score: float
    total_questions: int
    correct_answers: int
    time_taken: int
    questions_with_answers: List[Dict[str, Any]]  # Questions with correct answers and explanations 