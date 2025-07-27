from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timedelta
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.space import Space
from app.models.flashcard import Flashcard
from app.schemas.flashcard import Flashcard as FlashcardSchema, FlashcardCreate, FlashcardUpdate, FlashcardReview
from app.services.flashcard_service import FlashcardService

router = APIRouter()

@router.get("/spaces/{space_id}/flashcards", response_model=List[FlashcardSchema])
async def get_flashcards(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify space ownership
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    flashcards = db.query(Flashcard).filter(Flashcard.space_id == space_id).all()
    return flashcards

@router.post("/spaces/{space_id}/flashcards", response_model=FlashcardSchema)
async def create_flashcard(
    space_id: uuid.UUID,
    flashcard: FlashcardCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify space ownership
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    db_flashcard = Flashcard(**flashcard.dict())
    db.add(db_flashcard)
    db.commit()
    db.refresh(db_flashcard)
    
    return db_flashcard

@router.post("/spaces/{space_id}/flashcards/generate")
async def generate_flashcards(
    space_id: uuid.UUID,
    count: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify space ownership
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    flashcard_service = FlashcardService()
    flashcards = await flashcard_service.generate_flashcards_for_space(space_id, count)
    
    return {"message": f"Generated {len(flashcards)} flashcards", "flashcards": flashcards}

@router.put("/{flashcard_id}", response_model=FlashcardSchema)
async def update_flashcard(
    flashcard_id: uuid.UUID,
    flashcard_update: FlashcardUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    flashcard = db.query(Flashcard).join(Space).filter(
        Flashcard.id == flashcard_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    update_data = flashcard_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(flashcard, field, value)
    
    db.commit()
    db.refresh(flashcard)
    
    return flashcard

@router.post("/{flashcard_id}/review")
async def review_flashcard(
    flashcard_id: uuid.UUID,
    review: FlashcardReview,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    flashcard = db.query(Flashcard).join(Space).filter(
        Flashcard.id == flashcard_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    flashcard_service = FlashcardService()
    updated_flashcard = flashcard_service.update_spaced_repetition(flashcard, review.correct, review.difficulty_rating)
    
    db.commit()
    db.refresh(updated_flashcard)
    
    return {"message": "Review recorded successfully", "next_review": updated_flashcard.next_review}

@router.get("/spaces/{space_id}/flashcards/due", response_model=List[FlashcardSchema])
async def get_due_flashcards(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verify space ownership
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    now = datetime.utcnow()
    due_flashcards = db.query(Flashcard).filter(
        Flashcard.space_id == space_id,
        Flashcard.next_review <= now
    ).all()
    
    return due_flashcards

@router.delete("/{flashcard_id}")
async def delete_flashcard(
    flashcard_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    flashcard = db.query(Flashcard).join(Space).filter(
        Flashcard.id == flashcard_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Flashcard not found"
        )
    
    db.delete(flashcard)
    db.commit()
    
    return {"message": "Flashcard deleted successfully"}