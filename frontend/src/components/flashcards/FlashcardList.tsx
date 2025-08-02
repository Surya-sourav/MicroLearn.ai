"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { FlashcardItem } from "./FlashcardItem"
import { FlashcardGenerator } from "./FlashcardGenerator"
import { useFlashcards } from "../../hooks/useFlashcards"
import LoadingSpinner from "../common/LoadingSpinner"
import { Search, Plus, Brain } from "lucide-react"

interface FlashcardListProps {
  spaceId: string
}

export function FlashcardList({ spaceId }: FlashcardListProps) {
  const { flashcards, loading, deleteFlashcard } = useFlashcards(spaceId)
  const [searchTerm, setSearchTerm] = useState("")
  const [showGenerator, setShowGenerator] = useState(false)
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "easy" | "medium" | "hard">("all")

  const filteredFlashcards = flashcards.filter((card) => {
    const matchesSearch =
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDifficulty = filterDifficulty === "all" || card.difficulty === filterDifficulty
    return matchesSearch && matchesDifficulty
  })

  const handleDelete = async (flashcardId: string) => {
    await deleteFlashcard(flashcardId)
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Flashcards</h2>
          <p className="text-gray-600 dark:text-gray-400">Review and manage your study cards</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowGenerator(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Generate Cards
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search flashcards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={filterDifficulty}
          onChange={(e) => setFilterDifficulty(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{flashcards.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Cards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{flashcards.filter((c) => c.review_count > 0).length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Reviewed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {flashcards.length > 0
                ? Math.round(
                    (flashcards.reduce((acc, c) => acc + c.correct_count, 0) /
                      flashcards.reduce((acc, c) => acc + c.review_count, 0) || 0) * 100,
                  )
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{flashcards.filter((c) => c.difficulty === "hard").length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hard Cards</div>
          </CardContent>
        </Card>
      </div>

      {/* Generator Modal */}
      {showGenerator && (
        <FlashcardGenerator
          spaceId={spaceId}
          onClose={() => setShowGenerator(false)}
          onGenerated={() => setShowGenerator(false)}
        />
      )}

      {/* Flashcards Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : filteredFlashcards.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No flashcards found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? "No flashcards match your search." : "Generate your first flashcards to start studying."}
            </p>
            {!searchTerm && <Button onClick={() => setShowGenerator(true)}>Generate Flashcards</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlashcards.map((flashcard) => (
            <FlashcardItem key={flashcard.id} flashcard={flashcard} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
