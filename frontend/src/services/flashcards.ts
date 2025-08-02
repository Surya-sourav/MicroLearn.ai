const API_BASE_URL = "http://localhost:8000/api/v1"

interface Flashcard {
  id: string
  question: string
  answer: string
  difficulty: "easy" | "medium" | "hard"
  space_id: string
  created_at: string
  last_reviewed?: string
  review_count: number
  correct_count: number
  next_review?: string
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const flashcardsService = {
  async getFlashcards(spaceId: string): Promise<Flashcard[]> {
    const res = await fetch(`${API_BASE_URL}/flashcards/spaces/${spaceId}/flashcards`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch flashcards")
    }
    return res.json()
  },

  async createFlashcard(
    spaceId: string,
    flashcardData: Omit<Flashcard, "id" | "created_at" | "review_count" | "correct_count">,
  ): Promise<Flashcard> {
    const res = await fetch(`${API_BASE_URL}/flashcards/spaces/${spaceId}/flashcards`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(flashcardData),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to create flashcard")
    }
    return res.json()
  },

  async generateFlashcards(spaceId: string, documentId: string, count = 10): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/flashcards/spaces/${spaceId}/flashcards/generate?document_id=${documentId}&count=${count}`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to generate flashcards")
    }
    return res.json()
  },

  async updateFlashcard(flashcardId: string, updates: Partial<Flashcard>): Promise<Flashcard> {
    const res = await fetch(`${API_BASE_URL}/flashcards/${flashcardId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to update flashcard")
    }
    return res.json()
  },

  async deleteFlashcard(flashcardId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/flashcards/${flashcardId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to delete flashcard")
    }
  },

  async reviewFlashcard(flashcardId: string, correct: boolean, difficultyRating?: number): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/flashcards/${flashcardId}/review`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        correct,
        difficulty_rating: difficultyRating,
      }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to review flashcard")
    }
    return res.json()
  },

  async getDueFlashcards(spaceId: string): Promise<Flashcard[]> {
    const res = await fetch(`${API_BASE_URL}/flashcards/spaces/${spaceId}/flashcards/due`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch due flashcards")
    }
    return res.json()
  },
}
