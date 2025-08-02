"use client"

import { useState, useEffect } from "react"
import { documentsService } from "../services/documents"

interface Document {
  id: string
  title: string
  content?: string
  file_type: string
  file_size?: number
  processing_status: "pending" | "processing" | "completed" | "failed"
  created_at: string
  spaceId?: string
}

export function useDocuments(spaceId?: string) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [spaceId])

  const loadDocuments = async () => {
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
    try {
      setLoading(true)
      setError(null)
      const document = await documentsService.uploadFromUrl(url, spaceId)
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

  const getDocument = async (documentId: string) => {
    try {
      return await documentsService.getDocument(documentId)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    documents,
    loading,
    error,
    uploadDocument,
    uploadFromUrl,
    deleteDocument,
    getDocument,
    refreshDocuments: loadDocuments,
  }
}
