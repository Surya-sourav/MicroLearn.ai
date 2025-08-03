from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, AsyncGenerator
import uuid
import json
import logging
from pydantic import BaseModel
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.space import Space
from app.models.chat import ChatSession, ChatMessage, ChatRole
from app.schemas.chat import ChatRequest, ChatResponse, ChatMessage as ChatMessageSchema, StreamingChatResponse
from app.services.llm_service import LLMService
from app.services.vector_service import VectorService

logger = logging.getLogger(__name__)
router = APIRouter()
class VectorTestRequest(BaseModel):
    query: str

@router.post("/spaces/{space_id}/test-vectors")
async def test_vector_search(
    space_id: uuid.UUID,
    request: VectorTestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test vector search directly"""
    from app.models.document import Document
    
    # Get space
    space = db.query(Space).filter(
        Space.id == space_id,
        Space.owner_id == current_user.id
    ).first()
    
    if not space:
        raise HTTPException(status_code=404, detail="Space not found")
    
    # Test vector search
    vector_service = VectorService()
    
    try:
        logger.info(f"🔍 Testing vector search:")
        logger.info(f"  - Namespace: {space.vector_namespace}")
        logger.info(f"  - Query: {request.query}")
        
        # Perform search
        results = await vector_service.similarity_search(
            query=request.query,
            namespace=space.vector_namespace,
            top_k=5
        )
        
        logger.info(f"  - Results found: {len(results)}")
        
        return {
            "namespace": space.vector_namespace,
            "query": request.query,
            "results_count": len(results),
            "results": [
                {
                    "score": r.get("score"),
                    "text_preview": r.get("text", "")[:200] + "..." if r.get("text") else "No text",
                    "metadata_keys": list(r.get("metadata", {}).keys()),
                    "document_id": r.get("metadata", {}).get("document_id"),
                    "title": r.get("metadata", {}).get("title")
                }
                for r in results[:3]  # Show top 3
            ]
        }
        
    except Exception as e:
        logger.error(f"Vector search error: {str(e)}")
        return {
            "namespace": space.vector_namespace,
            "query": request.query,
            "error": str(e),
            "results_count": 0,
            "results": []
        }

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
        role=ChatRole.USER
    )
    db.add(user_message)
    
    # Get conversation history for context
    conversation_history = []
    existing_messages = db.query(ChatMessage).filter(
        ChatMessage.session_id == chat_session.id
    ).order_by(ChatMessage.created_at.desc()).limit(10).all()
    
    # Convert to conversation format (reverse to chronological order)
    for msg in reversed(existing_messages):
        role = msg.role.value  # Use enum value (USER -> "user", ASSISTANT -> "assistant")
        conversation_history.append({
            "role": role,
            "content": msg.content
        })
    
    # Get relevant context from vector database
    vector_service = VectorService()
    context_docs = []
    
    if vector_service.pinecone_available and space.vector_namespace:
        try:
            context_docs = await vector_service.similarity_search(
                chat_request.message, 
                space.vector_namespace,
                top_k=5
            )
        except Exception as e:
            logger.error(f"Vector search error: {str(e)}")
            context_docs = []
    else:
        logger.info("Vector search not available, proceeding without context")
    
    # Generate response using LLM with conversation history
    llm_service = LLMService()
    response = await llm_service.answer_question(
        chat_request.message,
        context_docs,
        conversation_history
    )
    
    # Save AI response
    ai_message = ChatMessage(
        session_id=chat_session.id,
        content=response.message,
        role=ChatRole.ASSISTANT
    )
    db.add(ai_message)
    db.commit()
    
    return response

@router.post("/spaces/{space_id}/chat/stream")
async def chat_with_space_stream(
    space_id: uuid.UUID,
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Streaming chat endpoint for real-time responses"""
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
        role=ChatRole.USER
    )
    db.add(user_message)
    db.commit()
    
    async def generate_stream():
        try:
            # Get conversation history
            existing_messages = db.query(ChatMessage).filter(
                ChatMessage.session_id == chat_session.id
            ).order_by(ChatMessage.created_at.desc()).limit(10).all()
            
            conversation_history = []
            for msg in reversed(existing_messages):
                role = msg.role.value
                conversation_history.append({
                    "role": role,
                    "content": msg.content
                })
            
            # Get relevant context and generate response
            vector_service = VectorService()
            context_docs = await vector_service.similarity_search(
                chat_request.message, 
                space.vector_namespace,
                top_k=5
            )
            
            llm_service = LLMService()
            response = await llm_service.answer_question(
                chat_request.message,
                context_docs,
                conversation_history
            )
            
            # Stream response
            yield f"data: {json.dumps({'content': response.message, 'is_complete': False, 'sources': response.sources})}\n\n"
            yield f"data: {json.dumps({'content': '', 'is_complete': True, 'sources': response.sources})}\n\n"
            
            # Save AI response
            ai_message = ChatMessage(
                session_id=chat_session.id,
                content=response.message,
                role=ChatRole.ASSISTANT
            )
            db.add(ai_message)
            db.commit()
            
        except Exception as e:
            logger.error(f"Streaming chat error: {str(e)}")
            error_response = {
                'content': f"Error: {str(e)}",
                'is_complete': True,
                'sources': []
            }
            yield f"data: {json.dumps(error_response)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

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
