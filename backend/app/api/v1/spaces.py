from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.space import Space
from app.schemas.space import Space as SpaceSchema, SpaceCreate, SpaceUpdate
from app.services.vector_service import VectorService

router = APIRouter()

@router.get("/", response_model=List[SpaceSchema])
async def get_spaces(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    spaces = db.query(Space).filter(Space.owner_id == current_user.id).all()
    return spaces

@router.post("/", response_model=SpaceSchema)
async def create_space(
    space: SpaceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Generate unique namespace for vector DB
    namespace = f"space_{uuid.uuid4().hex[:16]}"
    
    db_space = Space(
        **space.dict(),
        owner_id=current_user.id,
        vector_namespace=namespace
    )
    
    db.add(db_space)
    db.commit()
    db.refresh(db_space)
    
    return db_space

@router.get("/{space_id}", response_model=SpaceSchema)
async def get_space(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    return space

@router.put("/{space_id}", response_model=SpaceSchema)
async def update_space(
    space_id: uuid.UUID,
    space_update: SpaceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    update_data = space_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(space, field, value)
    
    db.commit()
    db.refresh(space)
    
    return space

@router.delete("/{space_id}")
async def delete_space(
    space_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Space not found"
        )
    
    # Clean up vector database
    vector_service = VectorService()
    await vector_service.delete_namespace(space.vector_namespace)
    
    db.delete(space)
    db.commit()
    
    return {"message": "Space deleted successfully"}