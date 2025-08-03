const API_BASE_URL = "http://localhost:8000/api/v1"

interface ChatRequest {
  space_ids: string[]
  message: string
  use_vector_search?: boolean
}

interface ChatResponse {
  response: string
  space_summary: {
    spaces: Array<{
      id: string
      name: string
      subject: string
      documents: number
      flashcards: number
      total_content: number
    }>
    total_documents: number
    total_flashcards: number
    total_content: number
  }
}

interface SpaceSummaryRequest {
  space_ids: string[]
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const multiSpaceChatService = {
  async chatWithSpaces(chatData: ChatRequest): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/multi-space-chat/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(chatData),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to send message")
    }
    return res.json()
  },

  async getSpaceSummary(spaceIds: string[]): Promise<ChatResponse['space_summary']> {
    const res = await fetch(`${API_BASE_URL}/multi-space-chat/summary`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ space_ids: spaceIds }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to get space summary")
    }
    return res.json()
  },

  async getContextFromSpaces(spaceIds: string[]): Promise<{ context: string }> {
    const res = await fetch(`${API_BASE_URL}/multi-space-chat/context`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ space_ids: spaceIds }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to get context")
    }
    return res.json()
  },
} 