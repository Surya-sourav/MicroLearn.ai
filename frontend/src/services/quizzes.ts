const API_BASE_URL = "http://localhost:8000/api/v1"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  difficulty: string
}

interface Quiz {
  id: string
  title: string
  description?: string
  question_count: number
  difficulty: string
  time_limit: number
  questions: QuizQuestion[]
  created_at: string
  space_ids: string[]
}

interface QuizCreate {
  space_ids: string[]
  question_count: number
  difficulty: string
  time_limit: number
}

interface QuizAttempt {
  id: string
  quiz_id: string
  started_at: string
  completed_at?: string
  time_taken?: number
  score?: number
  total_questions: number
  correct_answers?: number
  answers: Record<string, number>
}

interface QuizResult {
  score: number
  total_questions: number
  correct_answers: number
  time_taken: number
  questions_with_answers: any[]
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const quizzesService = {
  async generateQuiz(quizData: QuizCreate): Promise<Quiz> {
    const res = await fetch(`${API_BASE_URL}/quizzes/generate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(quizData),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to generate quiz")
    }
    return res.json()
  },

  async getQuizzes(): Promise<Quiz[]> {
    const res = await fetch(`${API_BASE_URL}/quizzes`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch quizzes")
    }
    return res.json()
  },

  async getQuiz(quizId: string): Promise<Quiz> {
    const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch quiz")
    }
    return res.json()
  },

  async startQuizAttempt(quizId: string): Promise<QuizAttempt> {
    const res = await fetch(`${API_BASE_URL}/quizzes/${quizId}/start`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to start quiz")
    }
    return res.json()
  },

  async submitQuizAttempt(attemptId: string, answers: Record<string, number>): Promise<QuizResult> {
    const res = await fetch(`${API_BASE_URL}/quizzes/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        quiz_id: attemptId,
        answers: answers
      }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to submit quiz")
    }
    return res.json()
  },

  async getQuizAttempts(): Promise<QuizAttempt[]> {
    const res = await fetch(`${API_BASE_URL}/quizzes/attempts`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch quiz attempts")
    }
    return res.json()
  },
} 