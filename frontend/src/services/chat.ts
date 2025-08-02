const API_BASE_URL = "http://localhost:8000/api/v1"

interface ChatMessage {
  message: string
}

interface ChatResponse {
  message: string
  sources?: any[]
}

interface ChatHistoryItem {
  id: string
  content: string
  role: "user" | "assistant"
  created_at: string
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const chatService = {
  async sendMessage(spaceId: string, data: ChatMessage): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE_URL}/chat/spaces/${spaceId}/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to send message")
    }
    return res.json()
  },

  async getChatHistory(spaceId: string): Promise<ChatHistoryItem[]> {
    const res = await fetch(`${API_BASE_URL}/chat/spaces/${spaceId}/chat/history`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch chat history")
    }
    return res.json()
  },

  async testVectorSearch(spaceId: string, query: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/chat/spaces/${spaceId}/test-vectors`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ query }),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to test vector search")
    }
    return res.json()
  },
}
