"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { RotateCcw, Trash2, Edit, Brain, Calendar, BookOpen, Lightbulb } from "lucide-react"

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
  onDelete: (flashcardId: string) => void
  onEdit?: (flashcard: Flashcard) => void
}

export function FlashcardItem({ flashcard, onDelete, onEdit }: FlashcardItemProps) {
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

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
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
                  {getAccuracy()}% accuracy
                </div>
              </div>
              
              <div className="flex-1 flex flex-col justify-center text-center">
                <div className="flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Key Concept</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed px-2 break-words">
                  {flashcard.question}
                </p>
              </div>

              <div className="text-center text-sm text-gray-500 mt-4">
                Click to see detailed explanation
              </div>
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
                <div className="flex items-center justify-center mb-3">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Detailed Explanation</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed px-2 break-words">
                  {flashcard.answer}
                </p>
              </div>

              <div className="text-center text-sm text-gray-500 mt-4">
                Click to return to key concept
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
            className="text-blue-600 hover:text-blue-700"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            {isFlipped ? "Show Concept" : "Show Details"}
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
                className="text-gray-600 hover:text-gray-700"
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
