import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Progress } from "../components/ui/progress"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight,
  Timer,
  Brain,
  Trophy
} from "lucide-react"

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct_answer: number
  explanation?: string
  difficulty: string
}

interface Quiz {
  id: string
  title: string
  description?: string
  question_count: number
  difficulty: string
  time_limit: number
  questions: QuizQuestion[]
  created_at: string
  space_ids: string[]
}

interface QuizAttempt {
  id: string
  quiz_id: string
  started_at: string
  completed_at?: string
  time_taken?: number
  score?: number
  total_questions: number
  correct_answers?: number
  answers: Record<string, number>
}

export default function QuizTakingPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [results, setResults] = useState<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (quizId) {
      loadQuiz()
    }
  }, [quizId])

  useEffect(() => {
    if (attempt && quiz) {
      setTimeLeft(quiz.time_limit * 60) // Convert minutes to seconds
      startTimer()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [attempt, quiz])

  const loadQuiz = async () => {
    try {
      setIsLoading(true)
      
      const { quizzesService } = await import("../services/quizzes")
      
      // Get quiz details
      const quizData = await quizzesService.getQuiz(quizId!)
      setQuiz(quizData)
      
      // Start quiz attempt
      const attemptData = await quizzesService.startQuizAttempt(quizId!)
      setAttempt(attemptData)
      
    } catch (error) {
      console.error("Error loading quiz:", error)
      alert("Failed to load quiz")
      navigate("/ai-quizzes")
    } finally {
      setIsLoading(false)
    }
  }

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up, auto-submit
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    if (!attempt || isSubmitting) return

    try {
      setIsSubmitting(true)
      
      const { quizzesService } = await import("../services/quizzes")
      const resultsData = await quizzesService.submitQuizAttempt(attempt.id, answers)
      setResults(resultsData)
      setShowResults(true)
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
    } catch (error) {
      console.error("Error submitting quiz:", error)
      alert("Failed to submit quiz")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProgressPercentage = () => {
    if (!quiz) return 0
    return ((currentQuestionIndex + 1) / quiz.questions.length) * 100
  }

  const getAnsweredCount = () => {
    return Object.keys(answers).length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading quiz..." />
      </div>
    )
  }

  if (!quiz || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Quiz not found</h2>
          <Button onClick={() => navigate("/ai-quizzes")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quizzes
          </Button>
        </div>
      </div>
    )
  }

  if (showResults && results) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-600" />
                Quiz Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-8">
                <div className="text-4xl font-bold mb-2">
                  {results.score.toFixed(1)}%
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  {results.correct_answers} out of {results.total_questions} correct
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Time taken: {Math.floor(results.time_taken / 60)}m {results.time_taken % 60}s
                </div>
              </div>

              <div className="space-y-6">
                {results.questions_with_answers.map((q: any, index: number) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Question {index + 1}</span>
                          {q.is_correct ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">{q.question}</p>
                      </div>
                      
                      <div className="space-y-2">
                        {q.options.map((option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded border ${
                              optIndex === q.correct_answer
                                ? "bg-green-100 border-green-300 dark:bg-green-900/20 dark:border-green-700"
                                : optIndex === q.user_answer && !q.is_correct
                                ? "bg-red-100 border-red-300 dark:bg-red-900/20 dark:border-red-700"
                                : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="font-medium mr-2">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span>{option}</span>
                              {optIndex === q.correct_answer && (
                                <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                              )}
                              {optIndex === q.user_answer && !q.is_correct && (
                                <XCircle className="w-4 h-4 ml-2 text-red-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {q.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                            Explanation:
                          </div>
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            {q.explanation}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-center mt-8 space-x-4">
                <Button onClick={() => navigate("/ai-quizzes")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Quizzes
                </Button>
                <Button onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{quiz.title}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm">
                <Brain className="w-4 h-4 mr-1" />
                {getAnsweredCount()}/{quiz.questions.length} answered
              </div>
              
              <div className="flex items-center text-sm">
                <Timer className="w-4 h-4 mr-1" />
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>
          
          <Progress value={getProgressPercentage()} className="mt-4" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            {/* Question */}
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-4">
                {currentQuestion.question}
              </h2>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === index
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  >
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                        answers[currentQuestion.id] === index
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}>
                        {answers[currentQuestion.id] === index && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="font-medium mr-2">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <span>{option}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex space-x-2">
                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" />
                        <span className="ml-2">Submitting...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Submit Quiz
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 