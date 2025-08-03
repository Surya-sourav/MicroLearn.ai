const API_BASE_URL = "http://localhost:8000/api/v1"

interface Document {
  id: string
  title: string
  content_preview?: string
  content_type: string
  processing_status: "pending" | "processing" | "completed" | "failed"
  created_at: string
  space_id: string
  error_message?: string
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token")
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

const getJsonHeaders = () => {
  const token = localStorage.getItem("access_token")
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export const documentsService = {
  async getDocuments(spaceId: string): Promise<Document[]> {
    const res = await fetch(`${API_BASE_URL}/documents/spaces/${spaceId}/documents`, {
      method: "GET",
      headers: getJsonHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch documents")
    }
    return res.json()
  },

  async uploadDocument(file: File, spaceId: string): Promise<Document> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${API_BASE_URL}/documents/spaces/${spaceId}/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to upload document")
    }
    return res.json()
  },

  async uploadFromUrl(url: string, title: string, spaceId: string): Promise<Document> {
    const formData = new FormData()
    formData.append("url", url)
    formData.append("title", title)

    const res = await fetch(`${API_BASE_URL}/documents/spaces/${spaceId}/url`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to upload from URL")
    }
    return res.json()
  },

  async deleteDocument(documentId: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: getJsonHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to delete document")
    }
  },

  async getSpaceSummary(spaceId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/documents/spaces/${spaceId}/summary`, {
      method: "GET",
      headers: getJsonHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to fetch space summary")
    }
    return res.json()
  },

  async clearSpaceDocuments(spaceId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/documents/spaces/${spaceId}/clear`, {
      method: "DELETE",
      headers: getJsonHeaders(),
    })
    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.detail || "Failed to clear space documents")
    }
    return res.json()
  },
}
