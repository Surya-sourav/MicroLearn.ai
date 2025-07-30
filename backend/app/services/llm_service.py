from groq import Groq
import json
import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.models.flashcard import Flashcard
from app.schemas.chat import ChatResponse

logger = logging.getLogger(__name__)

class LLMService:
    def __init__(self):
        # Initialize Groq client
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is required")
        
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
    
    async def _complete_chat(self, messages: List[Dict]) -> str:
        """Complete chat using Groq API"""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=2000,
                top_p=1,
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            raise Exception(f"Failed to get response from Groq: {str(e)}")
    
    async def generate_flashcards(self, content: str, count: int = 10) -> List[dict]:
        """Generate flashcards from content using LLM with fallback"""
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
        
        messages = [
            {"role": "system", "content": "You are an expert educator creating high-quality flashcards for students."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response_text = await self._complete_chat(messages)
            flashcards_data = json.loads(response_text)
            return flashcards_data
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON response for flashcards")
            return []
        except Exception as e:
            logger.error(f"Error generating flashcards: {str(e)}")
            return []
    
    async def answer_question(self, question: str, context_docs: List[Dict[str, Any]], conversation_history: List[Dict] = None) -> ChatResponse:
        """Answer user questions using RAG with enhanced context"""
        # Extract text content from context docs
        context_texts = []
        sources = []
        
        for i, doc in enumerate(context_docs[:5]):  # Use top 5 documents
            if isinstance(doc, dict):
                text = doc.get('text', '')
                metadata = doc.get('metadata', {})
                
                source_name = (
                    metadata.get('title') or 
                    metadata.get('source') or 
                    f"Document {i+1}"
                )
                
                if text.strip():  # Only add if there's actual text
                    context_texts.append(f"Source: {source_name}\nContent: {text}")
                    sources.append(source_name)
            else:
                context_texts.append(str(doc))
                sources.append(f"Document {i+1}")
        
        context = "\n\n---\n\n".join(context_texts)
        
        # Build conversation with history
        messages = [
            {"role": "system", "content": """You are a helpful educational assistant. Answer questions based on the provided context from the user's documents.

Guidelines:
- Provide clear, accurate answers based on the context
- If the context doesn't contain enough information, clearly state this
- Cite specific sources when possible
- Be concise but comprehensive
- If asked about something not in the context, acknowledge the limitation"""}
        ]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history[-6:])  # Keep last 6 messages for context
        
        # Add current question with context
        user_prompt = f"""Based on the following context from the documents, please answer this question:

Question: {question}

Context:
{context}

Answer:"""
        
        messages.append({"role": "user", "content": user_prompt})
        
        try:
            answer = await self._complete_chat(messages)
            return ChatResponse(message=answer, sources=sources)
        except Exception as e:
            logger.error(f"Error answering question: {str(e)}")
            return ChatResponse(
                message="I'm sorry, I'm having trouble processing your question right now. Please try again.",
                sources=[]
            )
    
    async def improve_flashcard(self, flashcard: Flashcard) -> dict:
        """Improve flashcard quality using LLM"""
        prompt = f"""
        Improve the following flashcard by making the question clearer and the answer more comprehensive:
        
        Current Question: {flashcard.question}
        Current Answer: {flashcard.answer}
        
        Return the improved version in JSON format with keys: question, answer.
        """
        
        messages = [
            {"role": "system", "content": "You are an expert educator improving flashcard quality."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response_text = await self._complete_chat(messages)
            improved_data = json.loads(response_text)
            return improved_data
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON response for flashcard improvement")
            return {"question": flashcard.question, "answer": flashcard.answer}
        except Exception as e:
            logger.error(f"Error improving flashcard: {str(e)}")
            return {"question": flashcard.question, "answer": flashcard.answer}