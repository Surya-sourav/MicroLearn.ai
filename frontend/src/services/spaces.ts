const API_BASE_URL = "http://localhost:8000/api/v1"

interface Space {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  document_count?: number
  flashcard_count?: number
  chat_count?: number
  vector_namespace?: string
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const spacesService = {
  async getSpaces(): Promise<Space[]> {
    const res = await fetch(`${API_BASE_URL}/spaces/`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch spaces")
    }
    return res.json()
  },

  async getSpace(spaceId: string): Promise<Space> {
    const res = await fetch(`${API_BASE_URL}/spaces/${spaceId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch space")
    }
    return res.json()
  },

  async createSpace(spaceData: { name: string; description?: string }): Promise<Space> {
    const res = await fetch(`${API_BASE_URL}/spaces/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(spaceData),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to create space")
    }
    return res.json()
  },

  async updateSpace(spaceId: string, updates: { name?: string; description?: string }): Promise<Space> {
    const res = await fetch(`${API_BASE_URL}/spaces/${spaceId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to update space")
    }
    return res.json()
  },

  async deleteSpace(spaceId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/spaces/${spaceId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to delete space")
    }
  },
}
