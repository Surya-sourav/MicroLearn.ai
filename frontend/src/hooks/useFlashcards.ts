"use client"

import { useState, useEffect } from "react"
import { flashcardsService } from "../services/flashcards"

interface Flashcard {
  id: string
  question: string
  answer: string
  difficulty: "easy" | "medium" | "hard"
  spaceId: string
  created_at: string
  last_reviewed?: string
  review_count: number
  correct_count: number
}

interface FlashcardSet {
  id: string
  title: string
  description?: string
  flashcards: Flashcard[]
  spaceId: string
  created_at: string
}

export function useFlashcards(spaceId?: string) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (spaceId) {
      loadFlashcards()
      loadFlashcardSets()
    }
  }, [spaceId])

  const loadFlashcards = async () => {
    if (!spaceId) return

    try {
      setLoading(true)
      setError(null)
      const cards = await flashcardsService.getFlashcards(spaceId)
      setFlashcards(cards)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadFlashcardSets = async () => {
    if (!spaceId) return

    try {
      const sets = await flashcardsService.getFlashcardSets(spaceId)
      setFlashcardSets(sets)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const createFlashcard = async (
    flashcardData: Omit<Flashcard, "id" | "created_at" | "review_count" | "correct_count">,
  ) => {
    try {
      setLoading(true)
      setError(null)
      const newFlashcard = await flashcardsService.createFlashcard(flashcardData)
      setFlashcards((prev) => [newFlashcard, ...prev])
      return newFlashcard
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const generateFlashcards = async (documentId: string, count = 10) => {
    try {
      setLoading(true)
      setError(null)
      const generatedCards = await flashcardsService.generateFlashcards(documentId, count)
      setFlashcards((prev) => [...generatedCards, ...prev])
      return generatedCards
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updateFlashcard = async (flashcardId: string, updates: Partial<Flashcard>) => {
    try {
      const updatedFlashcard = await flashcardsService.updateFlashcard(flashcardId, updates)
      setFlashcards((prev) => prev.map((card) => (card.id === flashcardId ? updatedFlashcard : card)))
      return updatedFlashcard
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteFlashcard = async (flashcardId: string) => {
    try {
      await flashcardsService.deleteFlashcard(flashcardId)
      setFlashcards((prev) => prev.filter((card) => card.id !== flashcardId))
    } catch (err: any) {
      setError(err.message)
    }
  }

  const reviewFlashcard = async (flashcardId: string, correct: boolean) => {
    try {
      const updatedFlashcard = await flashcardsService.reviewFlashcard(flashcardId, correct)
      setFlashcards((prev) => prev.map((card) => (card.id === flashcardId ? updatedFlashcard : card)))
      return updatedFlashcard
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const createFlashcardSet = async (setData: Omit<FlashcardSet, "id" | "created_at" | "flashcards">) => {
    try {
      setLoading(true)
      setError(null)
      const newSet = await flashcardsService.createFlashcardSet(setData)
      setFlashcardSets((prev) => [newSet, ...prev])
      return newSet
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    flashcards,
    flashcardSets,
    loading,
    error,
    createFlashcard,
    generateFlashcards,
    updateFlashcard,
    deleteFlashcard,
    reviewFlashcard,
    createFlashcardSet,
    refreshFlashcards: loadFlashcards,
    refreshFlashcardSets: loadFlashcardSets,
  }
}
