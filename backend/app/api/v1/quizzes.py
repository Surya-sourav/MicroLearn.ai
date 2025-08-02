from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.quiz import Quiz, QuizAttempt
from app.schemas.quiz import QuizCreate, QuizResponse, QuizAttemptCreate, QuizAttemptResponse, QuizResult
from app.services.quiz_service import QuizService

router = APIRouter()

@router.post("/generate", response_model=QuizResponse)
async def generate_quiz(
    quiz_data: QuizCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new quiz based on selected spaces"""
    try:
        quiz_service = QuizService()
        quiz = await quiz_service.generate_quiz(
            db=db,
            user_id=current_user.id,
            space_ids=quiz_data.space_ids,
            question_count=quiz_data.question_count,
            difficulty=quiz_data.difficulty,
            time_limit=quiz_data.time_limit
        )
        
        return QuizResponse(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            question_count=quiz.question_count,
            difficulty=quiz.difficulty,
            time_limit=quiz.time_limit,
            questions=quiz.questions,
            created_at=quiz.created_at,
            space_ids=quiz.space_ids
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate quiz: {str(e)}"
        )

@router.get("/", response_model=List[QuizResponse])
async def get_user_quizzes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all quizzes for the current user"""
    quiz_service = QuizService()
    quizzes = quiz_service.get_user_quizzes(db, current_user.id)
    
    return [
        QuizResponse(
            id=quiz.id,
            title=quiz.title,
            description=quiz.description,
            question_count=quiz.question_count,
            difficulty=quiz.difficulty,
            time_limit=quiz.time_limit,
            questions=quiz.questions,
            created_at=quiz.created_at,
            space_ids=quiz.space_ids
        )
        for quiz in quizzes
    ]

@router.get("/{quiz_id}", response_model=QuizResponse)
async def get_quiz(
    quiz_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific quiz by ID"""
    quiz = db.query(Quiz).filter(
        Quiz.id == quiz_id,
        Quiz.user_id == current_user.id
    ).first()
    
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    return QuizResponse(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        question_count=quiz.question_count,
        difficulty=quiz.difficulty,
        time_limit=quiz.time_limit,
        questions=quiz.questions,
        created_at=quiz.created_at,
        space_ids=quiz.space_ids
    )

@router.post("/{quiz_id}/start", response_model=QuizAttemptResponse)
async def start_quiz_attempt(
    quiz_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Start a new quiz attempt"""
    try:
        quiz_service = QuizService()
        attempt = quiz_service.start_quiz_attempt(db, quiz_id, current_user.id)
        
        return QuizAttemptResponse(
            id=attempt.id,
            quiz_id=attempt.quiz_id,
            started_at=attempt.started_at,
            completed_at=attempt.completed_at,
            time_taken=attempt.time_taken,
            score=attempt.score,
            total_questions=attempt.total_questions,
            correct_answers=attempt.correct_answers,
            answers=attempt.answers or {}
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/attempts/{attempt_id}/submit", response_model=QuizResult)
async def submit_quiz_attempt(
    attempt_id: uuid.UUID,
    answers: QuizAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit quiz answers and get results"""
    try:
        quiz_service = QuizService()
        result = quiz_service.submit_quiz_attempt(
            db, 
            attempt_id, 
            current_user.id, 
            answers.answers
        )
        
        return QuizResult(
            score=result["score"],
            total_questions=result["total_questions"],
            correct_answers=result["correct_answers"],
            time_taken=result["time_taken"],
            questions_with_answers=result["questions_with_answers"]
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/attempts/", response_model=List[QuizAttemptResponse])
async def get_quiz_attempts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all quiz attempts for the current user"""
    quiz_service = QuizService()
    attempts = quiz_service.get_quiz_attempts(db, current_user.id)
    
    return [
        QuizAttemptResponse(
            id=attempt.id,
            quiz_id=attempt.quiz_id,
            started_at=attempt.started_at,
            completed_at=attempt.completed_at,
            time_taken=attempt.time_taken,
            score=attempt.score,
            total_questions=attempt.total_questions,
            correct_answers=attempt.correct_answers,
            answers=attempt.answers or {}
        )
        for attempt in attempts
    ] 