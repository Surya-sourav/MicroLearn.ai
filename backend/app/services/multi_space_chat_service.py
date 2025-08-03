import uuid
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.space import Space
from app.models.document import Document
from app.models.flashcard import Flashcard
from app.services.llm_service import LLMService
from app.services.vector_service import VectorService

logger = logging.getLogger(__name__)

class MultiSpaceChatService:
    def __init__(self):
        self.llm_service = LLMService()
        self.vector_service = VectorService()
    
    async def get_context_from_spaces(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        space_ids: List[uuid.UUID]
    ) -> str:
        """Get combined context from multiple spaces"""
        
        # Verify spaces belong to user
        spaces = db.query(Space).filter(
            Space.id.in_(space_ids),
            Space.owner_id == user_id
        ).all()
        
        if len(spaces) != len(space_ids):
            raise ValueError("Some spaces not found or don't belong to user")
        
        # Collect content from all spaces
        all_content = []
        
        for space in spaces:
            # Get documents from this space
            documents = db.query(Document).filter(
                Document.space_id == space.id,
                Document.processing_status == "COMPLETED"
            ).all()
            
            for doc in documents:
                if doc.content_preview:
                    all_content.append({
                        "content": doc.content_preview,
                        "source": f"Document: {doc.title}",
                        "space": space.name,
                        "type": "document"
                    })
            
            # Get flashcards from this space
            flashcards = db.query(Flashcard).filter(
                Flashcard.space_id == space.id
            ).all()
            
            for flashcard in flashcards:
                all_content.append({
                    "content": f"Question: {flashcard.question}\nAnswer: {flashcard.answer}",
                    "source": f"Flashcard: {flashcard.question[:50]}...",
                    "space": space.name,
                    "type": "flashcard"
                })
        
        # Combine all content
        combined_context = "\n\n".join([
            f"[{item['source']} from {item['space']} ({item['type']})]\n{item['content']}"
            for item in all_content
        ])
        
        return combined_context
    
    async def get_relevant_context(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        space_ids: List[uuid.UUID], 
        user_message: str
    ) -> str:
        """Get relevant context from spaces based on user message using vector search"""
        
        if not self.vector_service.pinecone_available:
            # Fallback to full context if vector search not available
            return await self.get_context_from_spaces(db, user_id, space_ids)
        
        try:
            # Get relevant content using vector search
            relevant_content = []
            
            for space_id in space_ids:
                space = db.query(Space).filter(
                    Space.id == space_id,
                    Space.owner_id == user_id
                ).first()
                
                if not space:
                    continue
                
                # Search for relevant content in this space
                search_results = await self.vector_service.similarity_search(
                    query=user_message,
                    namespace=space.vector_namespace,
                    top_k=3
                )
                
                for result in search_results:
                    relevant_content.append({
                        "content": result.get("text", ""),
                        "source": f"Relevant content from {space.name}",
                        "space": space.name,
                        "relevance_score": result.get("score", 0)
                    })
            
            if relevant_content:
                # Sort by relevance score
                relevant_content.sort(key=lambda x: x["relevance_score"], reverse=True)
                
                # Combine relevant content
                combined_context = "\n\n".join([
                    f"[{item['source']} (relevance: {item['relevance_score']:.2f})]\n{item['content']}"
                    for item in relevant_content[:5]  # Limit to top 5 most relevant
                ])
                
                return combined_context
            else:
                # Fallback to full context if no relevant content found
                return await self.get_context_from_spaces(db, user_id, space_ids)
                
        except Exception as e:
            logger.error(f"Error in vector search: {e}")
            # Fallback to full context
            return await self.get_context_from_spaces(db, user_id, space_ids)
    
    async def generate_response(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        space_ids: List[uuid.UUID], 
        user_message: str,
        use_vector_search: bool = True
    ) -> str:
        """Generate AI response using context from selected spaces"""
        
        try:
            # Get context from spaces
            if use_vector_search:
                context = await self.get_relevant_context(db, user_id, space_ids, user_message)
            else:
                context = await self.get_context_from_spaces(db, user_id, space_ids)
            
            if not context:
                return f"I don't have enough context from the selected spaces ({', '.join(space_names)}) to provide a helpful response. Please add some documents or flashcards to these spaces first, or try asking a general question."
            
            # Get space names for context
            spaces = db.query(Space).filter(
                Space.id.in_(space_ids),
                Space.owner_id == user_id
            ).all()
            space_names = [space.name for space in spaces]
            
            # Create system prompt
            system_prompt = f"""
            You are an AI assistant helping a user with questions about their learning content.
            
            The user has selected the following spaces for context: {', '.join(space_names)}
            
            Use the provided context to answer the user's question accurately and helpfully.
            If the context doesn't contain enough information to answer the question, say so.
            Keep your responses concise but informative.
            """
            
            # Create user prompt with context
            user_prompt = f"""
            Context from selected spaces:
            {context[:6000]}  # Limit context length
            
            User question: {user_message}
            
            Please provide a helpful response based on the context above.
            """
            
            # Generate response using LLM
            response = await self.llm_service.generate_response_with_context(
                system_prompt=system_prompt,
                user_prompt=user_prompt
            )
            
            return response
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I encountered an error while processing your request. Please try again."
    
    def get_space_summary(self, db: Session, user_id: uuid.UUID, space_ids: List[uuid.UUID]) -> Dict[str, Any]:
        """Get summary of content in selected spaces"""
        
        spaces = db.query(Space).filter(
            Space.id.in_(space_ids),
            Space.owner_id == user_id
        ).all()
        
        summary = {
            "spaces": [],
            "total_documents": 0,
            "total_flashcards": 0,
            "total_content": 0
        }
        
        for space in spaces:
            # Count documents
            doc_count = db.query(Document).filter(
                Document.space_id == space.id,
                Document.processing_status == "COMPLETED"
            ).count()
            
            # Count flashcards
            flashcard_count = db.query(Flashcard).filter(
                Flashcard.space_id == space.id
            ).count()
            
            space_summary = {
                "id": str(space.id),
                "name": space.name,
                "subject": space.subject,
                "documents": doc_count,
                "flashcards": flashcard_count,
                "total_content": doc_count + flashcard_count
            }
            
            summary["spaces"].append(space_summary)
            summary["total_documents"] += doc_count
            summary["total_flashcards"] += flashcard_count
            summary["total_content"] += doc_count + flashcard_count
        
        return summary 