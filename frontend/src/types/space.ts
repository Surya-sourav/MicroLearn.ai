export interface Space {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at?: string
  user_id: number
  document_count?: number
  flashcard_count?: number
  conversation_count?: number
  subject?: string
}

export interface CreateSpaceRequest {
  name: string
  description?: string
}

export interface UpdateSpaceRequest {
  name?: string
  description?: string
}
