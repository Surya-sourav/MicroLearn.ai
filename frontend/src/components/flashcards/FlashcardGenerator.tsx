"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useFlashcards } from "../../hooks/useFlashcards"
import { useDocuments } from "../../hooks/useDocument"
import LoadingSpinner from "../common/LoadingSpinner"
import { X, Brain, AlertCircle } from "lucide-react"

interface FlashcardGeneratorProps {
  spaceId: string
  onClose: () => void
  onGenerated: () => void
}

export function FlashcardGenerator({ spaceId, onClose, onGenerated }: FlashcardGeneratorProps) {
  const [selectedDocument, setSelectedDocument] = useState("")
  const [cardCount, setCardCount] = useState(10)
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const { documents } = useDocuments(spaceId)
  const { generateFlashcards, loading, error } = useFlashcards(spaceId)

  const handleGenerate = async () => {
    if (!selectedDocument) return

    try {
      await generateFlashcards(selectedDocument, cardCount)
      onGenerated()
    } catch (err) {
      console.error("Failed to generate flashcards:", err)
    }
  }

  const completedDocuments = documents.filter((doc) => doc.processing_status === "completed")

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Generate Flashcards
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="document">Select Document</Label>
            <select
              id="document"
              value={selectedDocument}
              onChange={(e) => setSelectedDocument(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="">Choose a document...</option>
              {completedDocuments.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                </option>
              ))}
            </select>
            {completedDocuments.length === 0 && (
              <p className="text-sm text-gray-500">
                No processed documents available. Upload and process a document first.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Number of Cards</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="50"
              value={cardCount}
              onChange={(e) => setCardCount(Number.parseInt(e.target.value) || 10)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={!selectedDocument || loading} className="flex-1">
              {loading ? (
                <>
                  <LoadingSpinner />
                  Generating...
                </>
              ) : (
                "Generate Cards"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
