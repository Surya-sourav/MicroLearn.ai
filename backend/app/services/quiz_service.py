import uuid
import json
import logging
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.quiz import Quiz, QuizAttempt
from app.models.space import Space
from app.models.document import Document
from app.models.flashcard import Flashcard
from app.services.llm_service import LLMService
from app.services.vector_service import VectorService
from datetime import datetime

logger = logging.getLogger(__name__)

class QuizService:
    def __init__(self):
        self.llm_service = LLMService()
        self.vector_service = VectorService()
    
    async def generate_quiz(
        self, 
        db: Session, 
        user_id: uuid.UUID, 
        space_ids: List[uuid.UUID], 
        question_count: int = 10,
        difficulty: str = "mixed",
        time_limit: int = 15
    ) -> Quiz:
        """Generate a quiz based on selected spaces"""
        
        # Verify spaces belong to user
        spaces = db.query(Space).filter(
            Space.id.in_(space_ids),
            Space.owner_id == user_id
        ).all()
        
        if len(spaces) != len(space_ids):
            raise ValueError("Some spaces not found or don't belong to user")
        
        # Collect content from all spaces
        all_content = []
        space_names = []
        
        for space in spaces:
            space_names.append(space.name)
            
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
                        "space": space.name
                    })
            
            # Get flashcards from this space
            flashcards = db.query(Flashcard).filter(
                Flashcard.space_id == space.id
            ).all()
            
            for flashcard in flashcards:
                all_content.append({
                    "content": f"Question: {flashcard.question}\nAnswer: {flashcard.answer}",
                    "source": f"Flashcard: {flashcard.question[:50]}...",
                    "space": space.name
                })
        
        # Generate quiz based on available content
        if all_content:
            logger.info(f"Generating LLM-based quiz for spaces: {space_names} with {len(all_content)} content items")
            # Combine all content for LLM processing
            combined_content = "\n\n".join([
                f"Content from {item['space']} - {item['source']}:\n{item['content']}"
                for item in all_content
            ])
            quiz_data = await self._generate_quiz_questions(
                combined_content, 
                question_count, 
                difficulty,
                space_names
            )
        else:
            logger.info(f"No content found, generating basic quiz for spaces: {space_names}")
            quiz_data = await self._generate_basic_quiz_questions(
                question_count, 
                difficulty,
                space_names
            )
        
        # Create quiz record
        # Convert UUIDs to strings for JSON serialization
        space_ids_str = [str(space_id) for space_id in space_ids]
        
        quiz = Quiz(
            title=quiz_data["title"],
            description=quiz_data["description"],
            user_id=user_id,
            space_ids=space_ids_str,  # Use string UUIDs
            question_count=question_count,
            difficulty=difficulty,
            time_limit=time_limit,
            questions=quiz_data["questions"]
        )
        
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        
        logger.info(f"Generated quiz {quiz.id} with {len(quiz_data['questions'])} questions")
        return quiz
    
    async def _generate_quiz_questions(
        self, 
        content: str, 
        question_count: int, 
        difficulty: str,
        space_names: List[str]
    ) -> Dict[str, Any]:
        """Generate quiz questions using LLM"""
        
        # Create title and description
        spaces_text = ", ".join(space_names)
        title = f"Quiz on {spaces_text}"
        description = f"Test your knowledge on {spaces_text} with {question_count} questions"
        
        # Prepare prompt for quiz generation
        prompt = f"""
        Create a quiz with {question_count} multiple-choice questions based on the following content.
        
        Content from spaces: {spaces_text}
        
        Requirements:
        - Generate exactly {question_count} questions
        - Each question should have 4 options (A, B, C, D)
        - Include one correct answer and three plausible distractors
        - Difficulty level: {difficulty}
        - Questions should test understanding, not just memorization
        - Provide brief explanations for correct answers
        
        Content to base questions on:
        {content[:8000]}  # Limit content length
        
        Return the response as a valid JSON object with this exact structure:
        {{
            "title": "Quiz Title",
            "description": "Quiz Description",
            "questions": [
                {{
                    "id": "q1",
                    "question": "Question text here?",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correct_answer": 0,
                    "explanation": "Brief explanation of why this is correct",
                    "difficulty": "medium"
                }}
            ]
        }}
        
        IMPORTANT: Return ONLY the JSON object, no additional text.
        """
        
        try:
            response = await self.llm_service.generate_response(prompt)
            
            # Check if response is empty or None
            if not response or not response.strip():
                logger.error("LLM returned empty response")
                raise ValueError("Empty response from LLM")
            
            # Parse JSON response
            quiz_data = json.loads(response.strip())
            
            # Validate structure
            if not isinstance(quiz_data, dict) or "questions" not in quiz_data:
                logger.error(f"Invalid quiz structure: {quiz_data}")
                raise ValueError("Invalid quiz structure")
            
            # Ensure correct number of questions
            questions = quiz_data["questions"]
            if len(questions) != question_count:
                logger.warning(f"Generated {len(questions)} questions, expected {question_count}")
                # Truncate or pad to match expected count
                if len(questions) > question_count:
                    questions = questions[:question_count]
                else:
                    # Pad with additional questions if needed
                    while len(questions) < question_count:
                        questions.append({
                            "id": f"q{len(questions) + 1}",
                            "question": "Additional question placeholder",
                            "options": ["Option A", "Option B", "Option C", "Option D"],
                            "correct_answer": 0,
                            "explanation": "Explanation placeholder",
                            "difficulty": "medium"
                        })
            
            return {
                "title": quiz_data.get("title", title),
                "description": quiz_data.get("description", description),
                "questions": questions
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}, Response: {response if 'response' in locals() else 'No response'}")
            # Fallback to basic questions
            return await self._generate_basic_quiz_questions(question_count, difficulty, space_names)
        except Exception as e:
            logger.error(f"Failed to generate quiz questions: {e}")
            # Fallback to basic questions
            return await self._generate_basic_quiz_questions(question_count, difficulty, space_names)
    
    async def _generate_basic_quiz_questions(
        self, 
        question_count: int, 
        difficulty: str,
        space_names: List[str]
    ) -> Dict[str, Any]:
        """Generate basic quiz questions when no content is available"""
        
        # Create title and description
        spaces_text = ", ".join(space_names)
        title = f"General Knowledge Quiz on {spaces_text}"
        description = f"Test your general knowledge with {question_count} questions"
        
        # Create a larger pool of varied questions based on the space subject
        if any("ai" in space.lower() or "artificial" in space.lower() for space in space_names):
            # AI-related questions pool
            questions_pool = [
                {
                    "question": "What does AI stand for?",
                    "options": ["Artificial Intelligence", "Automated Information", "Advanced Integration", "Automated Intelligence"],
                    "correct_answer": 0,
                    "explanation": "AI stands for Artificial Intelligence, which refers to the simulation of human intelligence in machines.",
                    "difficulty": "easy"
                },
                {
                    "question": "Which of the following is a type of machine learning?",
                    "options": ["Supervised Learning", "Manual Learning", "Random Learning", "Basic Learning"],
                    "correct_answer": 0,
                    "explanation": "Supervised learning is a type of machine learning where the algorithm learns from labeled training data.",
                    "difficulty": "easy"
                },
                {
                    "question": "What is a neural network?",
                    "options": ["A computer network", "A biological brain", "A computing system inspired by biological neural networks", "A social network"],
                    "correct_answer": 2,
                    "explanation": "A neural network is a computing system inspired by biological neural networks that process information.",
                    "difficulty": "medium"
                },
                {
                    "question": "What is deep learning?",
                    "options": ["Learning in deep water", "A subset of machine learning using neural networks with multiple layers", "Learning at night", "Advanced reading techniques"],
                    "correct_answer": 1,
                    "explanation": "Deep learning is a subset of machine learning that uses neural networks with multiple layers to learn complex patterns.",
                    "difficulty": "medium"
                },
                {
                    "question": "What is natural language processing (NLP)?",
                    "options": ["Natural language programming", "A field of AI that helps computers understand human language", "Natural language patterns", "Natural learning process"],
                    "correct_answer": 1,
                    "explanation": "NLP is a field of AI that helps computers understand, interpret, and generate human language.",
                    "difficulty": "medium"
                },
                {
                    "question": "What is computer vision?",
                    "options": ["Computer screens", "A field of AI that enables computers to interpret visual information", "Computer graphics", "Computer displays"],
                    "correct_answer": 1,
                    "explanation": "Computer vision is a field of AI that enables computers to interpret and understand visual information from images or videos.",
                    "difficulty": "medium"
                },
                {
                    "question": "What is reinforcement learning?",
                    "options": ["Learning through rewards and punishments", "Learning by reading", "Learning through repetition", "Learning through observation"],
                    "correct_answer": 0,
                    "explanation": "Reinforcement learning is a type of machine learning where an agent learns by taking actions and receiving rewards or punishments.",
                    "difficulty": "hard"
                },
                {
                    "question": "What is transfer learning?",
                    "options": ["Transferring files", "Applying knowledge learned from one task to another related task", "Learning to transfer", "Transfer of data"],
                    "correct_answer": 1,
                    "explanation": "Transfer learning is applying knowledge learned from one task to another related task, improving learning efficiency.",
                    "difficulty": "hard"
                },
                {
                    "question": "What is an algorithm?",
                    "options": ["A computer program", "A step-by-step procedure for solving a problem", "A mathematical formula", "A programming language"],
                    "correct_answer": 1,
                    "explanation": "An algorithm is a step-by-step procedure or set of rules for solving a problem or accomplishing a task.",
                    "difficulty": "easy"
                },
                {
                    "question": "What is big data?",
                    "options": ["Large computers", "Extremely large datasets that can be analyzed computationally", "Big databases", "Large files"],
                    "correct_answer": 1,
                    "explanation": "Big data refers to extremely large datasets that can be analyzed computationally to reveal patterns and trends.",
                    "difficulty": "medium"
                }
            ]
        else:
            # General knowledge questions pool
            questions_pool = [
                {
                    "question": "What is the capital of France?",
                    "options": ["London", "Berlin", "Paris", "Madrid"],
                    "correct_answer": 2,
                    "explanation": "Paris is the capital and largest city of France.",
                    "difficulty": "easy"
                },
                {
                    "question": "Which planet is known as the Red Planet?",
                    "options": ["Earth", "Mars", "Jupiter", "Venus"],
                    "correct_answer": 1,
                    "explanation": "Mars is known as the Red Planet due to its reddish appearance.",
                    "difficulty": "easy"
                },
                {
                    "question": "What is the largest ocean on Earth?",
                    "options": ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
                    "correct_answer": 3,
                    "explanation": "The Pacific Ocean is the largest and deepest ocean on Earth.",
                    "difficulty": "easy"
                },
                {
                    "question": "Who wrote 'Romeo and Juliet'?",
                    "options": ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
                    "correct_answer": 1,
                    "explanation": "William Shakespeare wrote the famous tragedy 'Romeo and Juliet'.",
                    "difficulty": "medium"
                },
                {
                    "question": "What is the chemical symbol for gold?",
                    "options": ["Ag", "Au", "Fe", "Cu"],
                    "correct_answer": 1,
                    "explanation": "Au is the chemical symbol for gold, from the Latin word 'aurum'.",
                    "difficulty": "medium"
                },
                {
                    "question": "Which country is home to the kangaroo?",
                    "options": ["New Zealand", "Australia", "South Africa", "India"],
                    "correct_answer": 1,
                    "explanation": "Australia is home to the kangaroo, which is a marsupial native to the continent.",
                    "difficulty": "easy"
                },
                {
                    "question": "What is the largest mammal in the world?",
                    "options": ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
                    "correct_answer": 1,
                    "explanation": "The blue whale is the largest mammal in the world, reaching lengths of up to 100 feet.",
                    "difficulty": "medium"
                },
                {
                    "question": "What year did World War II end?",
                    "options": ["1943", "1944", "1945", "1946"],
                    "correct_answer": 2,
                    "explanation": "World War II ended in 1945 with the surrender of Germany in May and Japan in September.",
                    "difficulty": "medium"
                },
                {
                    "question": "What is the speed of light?",
                    "options": ["299,792 km/s", "199,792 km/s", "399,792 km/s", "499,792 km/s"],
                    "correct_answer": 0,
                    "explanation": "The speed of light in a vacuum is approximately 299,792 kilometers per second.",
                    "difficulty": "hard"
                },
                {
                    "question": "What is the largest organ in the human body?",
                    "options": ["Heart", "Brain", "Liver", "Skin"],
                    "correct_answer": 3,
                    "explanation": "The skin is the largest organ in the human body, covering the entire surface.",
                    "difficulty": "medium"
                }
            ]
        
        # Filter questions by difficulty if specified
        if difficulty != "mixed":
            filtered_questions = [q for q in questions_pool if q["difficulty"] == difficulty]
            if len(filtered_questions) < question_count:
                # If not enough questions for the difficulty, use all questions
                filtered_questions = questions_pool
        else:
            filtered_questions = questions_pool
        
        # Randomly select questions to avoid repetition
        import random
        random.shuffle(filtered_questions)
        selected_questions = filtered_questions[:question_count]
        
        # If we don't have enough questions, cycle through them
        if len(selected_questions) < question_count:
            while len(selected_questions) < question_count:
                remaining = question_count - len(selected_questions)
                additional = filtered_questions[:remaining]
                selected_questions.extend(additional)
        
        # Create the final questions list
        basic_questions = []
        for i, question in enumerate(selected_questions[:question_count]):
            basic_questions.append({
                "id": f"q{i + 1}",
                "question": question["question"],
                "options": question["options"],
                "correct_answer": question["correct_answer"],
                "explanation": question["explanation"],
                "difficulty": question["difficulty"]
            })
        
        return {
            "title": title,
            "description": description,
            "questions": basic_questions
        }
    
    def start_quiz_attempt(self, db: Session, quiz_id: uuid.UUID, user_id: uuid.UUID) -> QuizAttempt:
        """Start a new quiz attempt"""
        
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")
        
        if quiz.user_id != user_id:
            raise ValueError("Quiz doesn't belong to user")
        
        attempt = QuizAttempt(
            quiz_id=quiz_id,
            user_id=user_id,
            total_questions=len(quiz.questions)
        )
        
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        
        return attempt
    
    def submit_quiz_attempt(
        self, 
        db: Session, 
        attempt_id: uuid.UUID, 
        user_id: uuid.UUID, 
        answers: Dict[str, int]
    ) -> Dict[str, Any]:
        """Submit quiz answers and calculate results"""
        
        attempt = db.query(QuizAttempt).filter(
            QuizAttempt.id == attempt_id,
            QuizAttempt.user_id == user_id
        ).first()
        
        if not attempt:
            raise ValueError("Quiz attempt not found")
        
        if attempt.completed_at:
            raise ValueError("Quiz attempt already completed")
        
        # Get quiz questions
        quiz = db.query(Quiz).filter(Quiz.id == attempt.quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")
        
        # Calculate results
        correct_answers = 0
        questions_with_answers = []
        
        for question in quiz.questions:
            question_id = question["id"]
            user_answer = answers.get(question_id, -1)
            correct_answer = question["correct_answer"]
            
            is_correct = user_answer == correct_answer
            if is_correct:
                correct_answers += 1
            
            questions_with_answers.append({
                "question": question["question"],
                "options": question["options"],
                "user_answer": user_answer,
                "correct_answer": correct_answer,
                "is_correct": is_correct,
                "explanation": question.get("explanation", "")
            })
        
        # Calculate score and time
        score = (correct_answers / len(quiz.questions)) * 100
        time_taken = int((datetime.utcnow() - attempt.started_at).total_seconds())
        
        # Update attempt
        attempt.completed_at = datetime.utcnow()
        attempt.time_taken = time_taken
        attempt.score = score
        attempt.correct_answers = correct_answers
        attempt.answers = answers
        
        db.commit()
        db.refresh(attempt)
        
        return {
            "score": score,
            "total_questions": len(quiz.questions),
            "correct_answers": correct_answers,
            "time_taken": time_taken,
            "questions_with_answers": questions_with_answers
        }
    
    def get_user_quizzes(self, db: Session, user_id: uuid.UUID) -> List[Quiz]:
        """Get all quizzes for a user"""
        return db.query(Quiz).filter(
            Quiz.user_id == user_id,
            Quiz.is_active == True
        ).order_by(Quiz.created_at.desc()).all()
    
    def get_quiz_attempts(self, db: Session, user_id: uuid.UUID) -> List[QuizAttempt]:
        """Get all quiz attempts for a user"""
        return db.query(QuizAttempt).filter(
            QuizAttempt.user_id == user_id
        ).order_by(QuizAttempt.started_at.desc()).all() 