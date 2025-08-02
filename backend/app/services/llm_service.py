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
    
    async def generate_response(self, prompt: str) -> str:
        """Generate a simple response from a prompt"""
        messages = [
            {"role": "user", "content": prompt}
        ]
        return await self._complete_chat(messages)
    
    async def generate_response_with_context(self, system_prompt: str, user_prompt: str) -> str:
        """Generate response with system and user prompts"""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        return await self._complete_chat(messages)
    
    async def generate_flashcards(self, content: str, count: int = 10) -> List[dict]:
        """Generate micro notes flashcards from content using LLM"""
        prompt = f"""
        Create {count} micro notes (flashcards) from the following content. Each micro note should contain:
        - A key concept or important point in concise form (micro note)
        - A brief explanation or context for better understanding
        - Difficulty level: ONLY use "easy", "medium", or "hard" (no other values)
        - Relevant tags as an array of strings
        
        Content:
        {content[:2000]}  # Limit content length
        
        IMPORTANT: Return ONLY a valid JSON array. Each object must have exactly these keys: question, answer, difficulty, tags.
        The "question" field should contain the micro note/key concept.
        The "answer" field should contain the explanation or context.
        The difficulty field must be exactly one of: "easy", "medium", "hard" (lowercase).
        
        These are NOT questions - they are micro notes for revision and retention.
        
        Example format:
        [
            {{
                "question": "Neural Networks",
                "answer": "Computing systems inspired by biological neural networks, consisting of interconnected nodes that process information.",
                "difficulty": "medium",
                "tags": ["neural networks", "ai", "machine learning"]
            }}
        ]
        
        Do not include any text before or after the JSON array. Ensure all difficulty values are complete words.
        """
        
        messages = [
            {"role": "system", "content": "You are an expert educator creating high-quality flashcards. Always respond with valid JSON only."},
            {"role": "user", "content": prompt}
        ]
        
        try:
            response_text = await self._complete_chat(messages)
            
            # Clean the response text
            response_text = response_text.strip()
            
            # Try to extract JSON if there's extra text
            if response_text.startswith('```json'):
                response_text = response_text[7:]
            if response_text.endswith('```'):
                response_text = response_text[:-3]
            response_text = response_text.strip()
            
            flashcards_data = json.loads(response_text)
            
            # Validate the structure
            if not isinstance(flashcards_data, list):
                logger.warning("Response is not a list, creating empty result")
                return []
            
            # Validate each flashcard
            valid_flashcards = []
            for i, card in enumerate(flashcards_data):
                if isinstance(card, dict) and all(key in card for key in ['question', 'answer', 'difficulty', 'tags']):
                    # Validate difficulty value
                    difficulty = card.get('difficulty', '').lower().strip()
                    if difficulty in ['easy', 'medium', 'hard']:
                        # Ensure difficulty is properly set
                        card['difficulty'] = difficulty
                        valid_flashcards.append(card)
                    else:
                        logger.warning(f"Invalid difficulty '{difficulty}' in flashcard {i}, defaulting to 'medium'")
                        card['difficulty'] = 'medium'
                        valid_flashcards.append(card)
                else:
                    logger.warning(f"Invalid flashcard structure at index {i}: {card}")
            
            logger.info(f"Successfully generated {len(valid_flashcards)} valid flashcards")
            return valid_flashcards
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response for flashcards: {e}")
            logger.error(f"Response text: {response_text[:500]}...")
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