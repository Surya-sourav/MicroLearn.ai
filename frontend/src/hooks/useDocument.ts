"use client"

import { useState, useEffect } from "react"
import { documentsService } from "../services/documents"

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

export function useDocuments(spaceId?: string) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [spaceId])

  const loadDocuments = async () => {
    if (!spaceId) return
    try {
      setLoading(true)
      setError(null)
      const docs = await documentsService.getDocuments(spaceId)
      setDocuments(docs)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const uploadDocument = async (file: File, spaceId?: string) => {
    if (!spaceId) throw new Error("Space ID is required")
    try {
      setLoading(true)
      setError(null)
      const document = await documentsService.uploadDocument(file, spaceId)
      setDocuments((prev) => [document, ...prev])
      return document
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const uploadFromUrl = async (url: string, spaceId?: string) => {
    if (!spaceId) throw new Error("Space ID is required")
    try {
      setLoading(true)
      setError(null)
      // Extract title from URL or use a default
      const urlParts = url.split('/')
      const title = urlParts[urlParts.length - 1] || 'Web Content'
      const document = await documentsService.uploadFromUrl(url, title, spaceId)
      setDocuments((prev) => [document, ...prev])
      return document
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId: string) => {
    try {
      await documentsService.deleteDocument(documentId)
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))
    } catch (err: any) {
      setError(err.message)
    }
  }



  return {
    documents,
    loading,
    error,
    uploadDocument,
    uploadFromUrl,
    deleteDocument,
    refreshDocuments: loadDocuments,
  }
}
