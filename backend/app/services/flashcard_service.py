from sqlalchemy.orm import Session
from typing import List
import uuid
from datetime import datetime, timedelta
from app.core.database import SessionLocal
from app.models.flashcard import Flashcard
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
            
            # Get context from vector database
            context_docs = await self.vector_service.similarity_search(
                f"Generate flashcards for {space.subject}",
                space.vector_namespace,
                top_k=10
            )
            
            if not context_docs:
                return []
            
            # Combine context
            combined_content = "\n\n".join(context_docs)
            
            # Generate flashcards using LLM
            flashcards_data = await self.llm_service.generate_flashcards(combined_content, count)
            
            # Create flashcard records
            created_flashcards = []
            for flashcard_data in flashcards_data:
                flashcard = Flashcard(
                    question=flashcard_data.get('question', ''),
                    answer=flashcard_data.get('answer', ''),
                    difficulty=flashcard_data.get('difficulty', 'medium'),
                    tags=flashcard_data.get('tags', []),
                    space_id=space_id
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
