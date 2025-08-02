"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { RotateCcw, Check, X, Trash2, Edit, Brain, Calendar } from "lucide-react"

interface Flashcard {
  id: string
  question: string
  answer: string
  difficulty: "easy" | "medium" | "hard"
  space_id: string
  created_at: string
  last_reviewed?: string
  review_count: number
  correct_count: number
}

interface FlashcardItemProps {
  flashcard: Flashcard
  onReview: (flashcardId: string, correct: boolean) => void
  onDelete: (flashcardId: string) => void
  onEdit?: (flashcard: Flashcard) => void
}

export function FlashcardItem({ flashcard, onReview, onDelete, onEdit }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false)


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const getAccuracy = () => {
    if (flashcard.review_count === 0) return 0
    return Math.round((flashcard.correct_count / flashcard.review_count) * 100)
  }

  const handleReview = (correct: boolean) => {
    onReview(flashcard.id, correct)

    setIsFlipped(false)
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <CardContent className="p-0">
        <div className="relative h-80" onClick={() => setIsFlipped(!isFlipped)}>
          {/* Front Side */}
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-500 ${
              isFlipped ? "rotate-y-180" : ""
            } backface-hidden bg-white dark:bg-gray-800 rounded-t-lg`}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(flashcard.difficulty)}`}
                >
                  {flashcard.difficulty}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Brain className="w-3 h-3" />
                  {getAccuracy()}%
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center text-center">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">Micro Note</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed px-2">
                  {flashcard.question}
                </p>
              </div>

              <div className="text-center text-sm text-gray-500 mt-4">Click to reveal context</div>
            </div>
          </div>

          {/* Back Side */}
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-500 ${
              isFlipped ? "" : "rotate-y-180"
            } backface-hidden rotate-y-180 bg-white dark:bg-gray-800 rounded-t-lg`}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(flashcard.difficulty)}`}
                >
                  {flashcard.difficulty}
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {flashcard.review_count} reviews
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center text-center">
                <h3 className="font-semibold text-lg mb-3 text-gray-900 dark:text-gray-100">Context</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed px-2">
                  {flashcard.answer}
                </p>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReview(false)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Incorrect
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReview(true)
                  }}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Correct
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t flex justify-between items-center bg-gray-50 dark:bg-gray-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsFlipped(!isFlipped)
            }}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Flip
          </Button>

          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(flashcard)
                }}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(flashcard.id)
              }}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
