from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.multi_space_chat_service import MultiSpaceChatService

router = APIRouter()

class ChatRequest(BaseModel):
    space_ids: List[uuid.UUID]
    message: str
    use_vector_search: bool = True

class ChatResponse(BaseModel):
    response: str
    space_summary: dict

class SpaceSummaryRequest(BaseModel):
    space_ids: List[uuid.UUID]

@router.post("/chat", response_model=ChatResponse)
async def chat_with_spaces(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Chat with AI using context from multiple selected spaces"""
    try:
        if not chat_request.space_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one space must be selected"
            )
        
        chat_service = MultiSpaceChatService()
        
        # Generate AI response
        response = await chat_service.generate_response(
            db=db,
            user_id=current_user.id,
            space_ids=chat_request.space_ids,
            user_message=chat_request.message,
            use_vector_search=chat_request.use_vector_search
        )
        
        # Get space summary
        space_summary = chat_service.get_space_summary(
            db=db,
            user_id=current_user.id,
            space_ids=chat_request.space_ids
        )
        
        return ChatResponse(
            response=response,
            space_summary=space_summary
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate response: {str(e)}"
        )

@router.post("/summary", response_model=dict)
async def get_space_summary(
    summary_request: SpaceSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get summary of content in selected spaces"""
    try:
        if not summary_request.space_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one space must be selected"
            )
        
        chat_service = MultiSpaceChatService()
        summary = chat_service.get_space_summary(
            db=db,
            user_id=current_user.id,
            space_ids=summary_request.space_ids
        )
        
        return summary
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get space summary: {str(e)}"
        )

@router.post("/context")
async def get_context_from_spaces(
    summary_request: SpaceSummaryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get raw context from selected spaces (for debugging)"""
    try:
        if not summary_request.space_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one space must be selected"
            )
        
        chat_service = MultiSpaceChatService()
        context = await chat_service.get_context_from_spaces(
            db=db,
            user_id=current_user.id,
            space_ids=summary_request.space_ids
        )
        
        return {"context": context}
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get context: {str(e)}"
        ) 