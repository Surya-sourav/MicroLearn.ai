from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.space import Space
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage as ChatMessageSchema
from app.services.llm_service import LLMService
from app.services.vector_service import VectorService

router = APIRouter()

@router.post("/spaces/{space_id}/chat", response_model=ChatResponse)
async def chat_with_space(
    space_id: uuid.UUID,
    chat_request: ChatRequest,
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
    
    # Get or create chat session
    chat_session = db.query(ChatSession).filter(
        ChatSession.space_id == space_id
    ).first()
    
    if not chat_session:
        chat_session = ChatSession(space_id=space_id)
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)
    
    # Save user message
    user_message = ChatMessage(
        session_id=chat_session.id,
        content=chat_request.message,
        is_user_message=True
    )
    db.add(user_message)
    
    # Get relevant context from vector database
    vector_service = VectorService()
    context_docs = await vector_service.similarity_search(
        chat_request.message, 
        space.vector_namespace,
        top_k=5
    )
    
    # Generate response using LLM
    llm_service = LLMService()
    response = await llm_service.answer_question(
        chat_request.message,
        context_docs
    )
    
    # Save AI response
    ai_message = ChatMessage(
        session_id=chat_session.id,
        content=response.message,
        is_user_message=False
    )
    db.add(ai_message)
    db.commit()
    
    return response

@router.get("/spaces/{space_id}/chat/history", response_model=List[ChatMessageSchema])
async def get_chat_history(
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
    
    # Get chat session
    chat_session = db.query(ChatSession).filter(
        ChatSession.space_id == space_id
    ).first()
    
    if not chat_session:
        return []
    
    messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == chat_session.id
    ).order_by(ChatMessage.created_at).all()
    
    return messages
