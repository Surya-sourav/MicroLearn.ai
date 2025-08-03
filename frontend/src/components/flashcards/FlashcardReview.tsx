"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Progress } from "../ui/progress"
import { useFlashcards } from "../../hooks/useFlashcards"
import { Check, X, RotateCcw, SkipForward, Trophy, Brain } from "lucide-react"

interface FlashcardReviewProps {
  spaceId: string
  flashcardIds?: string[]
  onComplete?: (results: ReviewResults) => void
}

interface ReviewResults {
  totalCards: number
  correctAnswers: number
  incorrectAnswers: number
  accuracy: number
  timeSpent: number
}

export function FlashcardReview({ spaceId, flashcardIds, onComplete }: FlashcardReviewProps) {
  const { flashcards, reviewFlashcard } = useFlashcards(spaceId)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [reviewResults, setReviewResults] = useState<ReviewResults>({
    totalCards: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    timeSpent: 0,
  })
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [isComplete, setIsComplete] = useState(false)

  const reviewCards = flashcardIds ? flashcards.filter((card) => flashcardIds.includes(card.id)) : flashcards

  useEffect(() => {
    if (reviewCards.length > 0 && !startTime) {
      setStartTime(new Date())
      setReviewResults((prev) => ({ ...prev, totalCards: reviewCards.length }))
    }
  }, [reviewCards.length, startTime])

  const currentCard = reviewCards[currentIndex]
  const progress = reviewCards.length > 0 ? ((currentIndex + 1) / reviewCards.length) * 100 : 0

  const handleAnswer = async (correct: boolean) => {
    if (!currentCard) return

    await reviewFlashcard(currentCard.id, correct)

    setReviewResults((prev) => ({
      ...prev,
      correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
      incorrectAnswers: correct ? prev.incorrectAnswers : prev.incorrectAnswers + 1,
    }))

    // Move to next card or complete review
    if (currentIndex < reviewCards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsFlipped(false)
    } else {
      completeReview()
    }
  }

  const completeReview = () => {
    const endTime = new Date()
    const timeSpent = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0

    const finalResults = {
      ...reviewResults,
      timeSpent,
      accuracy: reviewResults.totalCards > 0 ? (reviewResults.correctAnswers / reviewResults.totalCards) * 100 : 0,
    }

    setReviewResults(finalResults)
    setIsComplete(true)
    onComplete?.(finalResults)
  }

  const resetReview = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setIsComplete(false)
    setStartTime(new Date())
    setReviewResults({
      totalCards: reviewCards.length,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      timeSpent: 0,
    })
  }

  if (reviewCards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No flashcards to review</h3>
          <p className="text-gray-600 dark:text-gray-400">Create some flashcards first to start reviewing.</p>
        </CardContent>
      </Card>
    )
  }

  if (isComplete) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Review Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reviewResults.correctAnswers}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{reviewResults.incorrectAnswers}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold mb-2">{Math.round(reviewResults.accuracy)}%</div>
            <div className="text-gray-600">Accuracy</div>
          </div>

          <div className="text-center text-sm text-gray-500">
            Time spent: {Math.round(reviewResults.timeSpent)} seconds
          </div>

          <Button onClick={resetReview} className="w-full">
            <RotateCcw className="w-4 h-4 mr-2" />
            Review Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>
            {currentIndex + 1} of {reviewCards.length}
          </span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      {/* Flashcard */}
      <Card className="min-h-[400px]">
        <CardContent className="p-0">
          <div className="relative h-96 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            {/* Front Side */}
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-500 ${
                isFlipped ? "rotate-y-180" : ""
              } backface-hidden`}
            >
              <div className="p-8 h-full flex flex-col justify-center text-center">
                <h3 className="text-lg font-semibold mb-4">Question</h3>
                <p className="text-xl">{currentCard?.question}</p>
                <div className="mt-8 text-sm text-gray-500">Click to reveal answer</div>
              </div>
            </div>

            {/* Back Side */}
            <div
              className={`absolute inset-0 w-full h-full transition-transform duration-500 ${
                isFlipped ? "" : "rotate-y-180"
              } backface-hidden rotate-y-180`}
            >
              <div className="p-8 h-full flex flex-col justify-center text-center">
                <h3 className="text-lg font-semibold mb-4">Answer</h3>
                <p className="text-xl mb-8">{currentCard?.answer}</p>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAnswer(false)
                    }}
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Incorrect
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleAnswer(true)
                    }}
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Correct
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Flip Card
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (currentIndex < reviewCards.length - 1) {
                setCurrentIndex((prev) => prev + 1)
                setIsFlipped(false)
              }
            }}
            disabled={currentIndex >= reviewCards.length - 1}
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip
          </Button>
        </div>
      </div>
    </div>
  )
}
