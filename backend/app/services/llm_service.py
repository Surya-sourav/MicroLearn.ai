from openai import OpenAI
from typing import List
from app.core.config import settings
from app.models.flashcard import Flashcard
from app.schemas.chat import ChatResponse

class LLMService:
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def generate_flashcards(self, content: str, count: int = 10) -> List[dict]:
        """Generate flashcards from content using GPT"""
        prompt = f"""
        Create {count} flashcards from the following content. Each flashcard should have:
        - A clear, specific question
        - A comprehensive answer
        - Appropriate difficulty level (easy, medium, hard)
        - Relevant tags
        
        Content:
        {content}
        
        Return the flashcards in JSON format as an array of objects with keys: question, answer, difficulty, tags.
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert educator creating high-quality flashcards for students."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        try:
            import json
            flashcards_data = json.loads(response.choices[0].message.content)
            return flashcards_data
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return []
    
    async def answer_question(self, question: str, context_docs: List[str]) -> ChatResponse:
        """Answer user questions using RAG"""
        context = "\n\n".join(context_docs[:3])  # Use top 3 documents
        
        prompt = f"""
        Answer the following question based on the provided context. If the context doesn't contain enough information, say so.
        
        Context:
        {context}
        
        Question: {question}
        
        Answer:
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful educational assistant. Answer based on the provided context."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )
        
        answer = response.choices[0].message.content
        sources = [f"Document {i+1}" for i in range(min(len(context_docs), 3))]
        
        return ChatResponse(message=answer, sources=sources)
    
    async def improve_flashcard(self, flashcard: Flashcard) -> dict:
        """Improve flashcard quality using LLM"""
        prompt = f"""
        Improve the following flashcard by making the question clearer and the answer more comprehensive:
        
        Current Question: {flashcard.question}
        Current Answer: {flashcard.answer}
        
        Return the improved version in JSON format with keys: question, answer.
        """
        
        response = self.client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert educator improving flashcard quality."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5
        )
        
        try:
            import json
            improved_data = json.loads(response.choices[0].message.content)
            return improved_data
        except json.JSONDecodeError:
            return {"question": flashcard.question, "answer": flashcard.answer}