"use client"

import { useState, useEffect } from "react"
import { spacesService } from "../services/spaces"

interface Space {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  document_count?: number
  flashcard_count?: number
  chat_count?: number
}

export function useSpaces() {
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSpaces()
  }, [])

  const loadSpaces = async () => {
    try {
      setLoading(true)
      setError(null)
      const spacesData = await spacesService.getSpaces()
      setSpaces(spacesData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createSpace = async (spaceData: { name: string; description?: string }) => {
    try {
      setLoading(true)
      setError(null)
      const newSpace = await spacesService.createSpace(spaceData)
      setSpaces((prev) => [newSpace, ...prev])
      return newSpace
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateSpace = async (spaceId: string, updates: { name?: string; description?: string }) => {
    try {
      setLoading(true)
      setError(null)
      const updatedSpace = await spacesService.updateSpace(spaceId, updates)
      setSpaces((prev) => prev.map((space) => (space.id === spaceId ? updatedSpace : space)))
      return updatedSpace
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteSpace = async (spaceId: string) => {
    try {
      setError(null)
      await spacesService.deleteSpace(spaceId)
      setSpaces((prev) => prev.filter((space) => space.id !== spaceId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getSpace = async (spaceId: string) => {
    try {
      return await spacesService.getSpace(spaceId)
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  return {
    spaces,
    loading,
    error,
    createSpace,
    updateSpace,
    deleteSpace,
    getSpace,
    refreshSpaces: loadSpaces,
  }
}
