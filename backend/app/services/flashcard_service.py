from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.flashcard import Flashcard, DifficultyLevel
from app.models.space import Space
from app.models.document import Document
from app.services.llm_service import LLMService
from app.services.vector_service import VectorService

class FlashcardService:
    def __init__(self):
        self.llm_service = LLMService()
        self.vector_service = VectorService()
    
    async def generate_flashcards_for_space(self, space_id: uuid.UUID, count: int = 10) -> List[Flashcard]:
        """Generate flashcards for a space based on its documents"""
        db = SessionLocal()
        try:
            # Get space and its documents
            space = db.query(Space).filter(Space.id == space_id).first()
            if not space:
                return []
            
            # Get context from vector database if available
            context_content = ""
            if self.vector_service.pinecone_available and space.vector_namespace:
                context_docs = await self.vector_service.similarity_search(
                    f"Generate flashcards for {space.subject}",
                    space.vector_namespace,
                    top_k=10
                )
                
                if context_docs:
                    # Combine context
                    context_content = "\n\n".join([doc.get("text", "") for doc in context_docs])
            
            # If no vector context, try to get from documents
            if not context_content:
                documents = db.query(Document).filter(Document.space_id == space_id).all()
                if documents:
                    context_content = "\n\n".join([doc.content_preview or "" for doc in documents if doc.content_preview])
            
            if not context_content:
                return []
            
            # Generate flashcards using LLM
            flashcards_data = await self.llm_service.generate_flashcards(context_content, count)
            
            # Create flashcard records
            created_flashcards = []
            for flashcard_data in flashcards_data:
                # Validate and normalize difficulty
                difficulty_str = flashcard_data.get('difficulty', 'medium')
                if isinstance(difficulty_str, str):
                    difficulty_str = difficulty_str.lower().strip()
                    if difficulty_str == 'easy':
                        difficulty = DifficultyLevel.EASY
                    elif difficulty_str == 'medium':
                        difficulty = DifficultyLevel.MEDIUM
                    elif difficulty_str == 'hard':
                        difficulty = DifficultyLevel.HARD
                    else:
                        difficulty = DifficultyLevel.MEDIUM  # Default to medium if invalid
                else:
                    difficulty = DifficultyLevel.MEDIUM
                
                flashcard = Flashcard(
                    question=flashcard_data.get('question', ''),
                    answer=flashcard_data.get('answer', ''),
                    difficulty=difficulty,
                    tags=flashcard_data.get('tags', []),
                    space_id=space_id
                )
                db.add(flashcard)
                created_flashcards.append(flashcard)
            
            db.commit()
            return created_flashcards
            
        finally:
            db.close()
    
    async def generate_flashcards_for_document(self, document_id: uuid.UUID, count: int = 10) -> List[Flashcard]:
        """Generate flashcards for a specific document"""
        db = SessionLocal()
        try:
            # Get document
            document = db.query(Document).filter(Document.id == document_id).first()
            if not document:
                return []
            
            # Get document content
            if not document.content_preview:
                return []
            
            # Generate flashcards using LLM
            flashcards_data = await self.llm_service.generate_flashcards(document.content_preview, count)
            
            # Create flashcard records
            created_flashcards = []
            for flashcard_data in flashcards_data:
                # Validate and normalize difficulty
                difficulty_str = flashcard_data.get('difficulty', 'medium')
                if isinstance(difficulty_str, str):
                    difficulty_str = difficulty_str.lower().strip()
                    if difficulty_str == 'easy':
                        difficulty = DifficultyLevel.EASY
                    elif difficulty_str == 'medium':
                        difficulty = DifficultyLevel.MEDIUM
                    elif difficulty_str == 'hard':
                        difficulty = DifficultyLevel.HARD
                    else:
                        difficulty = DifficultyLevel.MEDIUM  # Default to medium if invalid
                else:
                    difficulty = DifficultyLevel.MEDIUM
                
                flashcard = Flashcard(
                    question=flashcard_data.get('question', ''),
                    answer=flashcard_data.get('answer', ''),
                    difficulty=difficulty,
                    tags=flashcard_data.get('tags', []),
                    space_id=document.space_id,
                    source_document_id=document_id
                )
                db.add(flashcard)
                created_flashcards.append(flashcard)
            
            db.commit()
            return created_flashcards
            
        finally:
            db.close()
    
    def update_spaced_repetition(self, flashcard: Flashcard, correct: bool, difficulty_rating: int) -> Flashcard:
        """Update flashcard using spaced repetition algorithm"""
        flashcard.review_count += 1
        flashcard.last_reviewed = datetime.utcnow()
        
        if correct:
            flashcard.correct_count += 1
            
            # SM-2 Algorithm implementation
            if flashcard.review_count == 1:
                flashcard.interval = 1
            elif flashcard.review_count == 2:
                flashcard.interval = 6
            else:
                flashcard.interval = int(flashcard.interval * flashcard.ease_factor)
            
            # Update ease factor based on difficulty rating (1-5 scale)
            flashcard.ease_factor = max(1.3, flashcard.ease_factor + (0.1 - (5 - difficulty_rating) * (0.08 + (5 - difficulty_rating) * 0.02)))
            
        else:
            # Reset interval if incorrect
            flashcard.interval = 1
            flashcard.ease_factor = max(1.3, flashcard.ease_factor - 0.2)
        
        # Set next review date
        flashcard.next_review = datetime.utcnow() + timedelta(days=flashcard.interval)
        
        return flashcard
