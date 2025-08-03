import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useSpaces } from "../hooks/useSpaces"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { 
  Folder, 
  Search, 
  CheckCircle, 
  Circle,
  Settings,

  Target,
  Zap
} from "lucide-react"

interface QuizSettings {
  questionCount: number
  difficulty: "easy" | "medium" | "hard" | "mixed"
  timeLimit: number // in minutes
}

export default function AIQuizzesPage() {
  const navigate = useNavigate()
  const { spaces, loading } = useSpaces()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([])
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    questionCount: 10,
    difficulty: "mixed",
    timeLimit: 15
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const toggleSpaceSelection = (spaceId: string) => {
    setSelectedSpaces(prev => 
      prev.includes(spaceId) 
        ? prev.filter(id => id !== spaceId)
        : [...prev, spaceId]
    )
  }

  const handleGenerateQuiz = async () => {
    if (selectedSpaces.length === 0) {
      alert("Please select at least one space for the quiz")
      return
    }

    setIsGenerating(true)
    try {
      const { quizzesService } = await import("../services/quizzes")
      
      const quiz = await quizzesService.generateQuiz({
        space_ids: selectedSpaces,
        question_count: quizSettings.questionCount,
        difficulty: quizSettings.difficulty,
        time_limit: quizSettings.timeLimit
      })
      
      // Navigate to quiz taking page
      navigate(`/quiz/${quiz.id}`)
    } catch (error) {
      console.error("Failed to generate quiz:", error)
      alert("Failed to generate quiz. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const getSelectedSpacesData = () => {
    return spaces.filter(space => selectedSpaces.includes(space.id))
  }

  const getTotalContent = () => {
    const selectedSpacesData = getSelectedSpacesData()
    return {
      documents: selectedSpacesData.reduce((acc, space) => acc + (space.document_count || 0), 0),
      flashcards: selectedSpacesData.reduce((acc, space) => acc + (space.flashcard_count || 0), 0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading spaces..." />
      </div>
    )
  }

  const totalContent = getTotalContent()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">AI Quizzes</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Test your knowledge with smart quizzes generated from your spaces
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Space Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Folder className="w-5 h-5 mr-2" />
                  Select Spaces for Quiz
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose the spaces you want to include in your quiz
                </p>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search spaces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Spaces List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredSpaces.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? "No spaces match your search." : "No spaces available."}
                    </div>
                  ) : (
                    filteredSpaces.map((space) => (
                      <div
                        key={space.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedSpaces.includes(space.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => toggleSpaceSelection(space.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {selectedSpaces.includes(space.id) ? (
                              <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-400 mr-3" />
                            )}
                            <div>
                              <div className="font-medium">{space.name}</div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {space.subject} • {space.document_count || 0} docs • {space.flashcard_count || 0} cards
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quiz Settings */}
          <div className="space-y-6">
            {/* Quiz Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Quiz Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Number of Questions</label>
                    <Input
                      type="number"
                      min="5"
                      max="50"
                      value={quizSettings.questionCount}
                      onChange={(e) => setQuizSettings({
                        ...quizSettings,
                        questionCount: parseInt(e.target.value) || 10
                      })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Difficulty</label>
                    <select
                      value={quizSettings.difficulty}
                      onChange={(e) => setQuizSettings({
                        ...quizSettings,
                        difficulty: e.target.value as "easy" | "medium" | "hard" | "mixed"
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    >
                      <option value="mixed">Mixed Difficulty</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Time Limit (minutes)</label>
                    <Input
                      type="number"
                      min="5"
                      max="60"
                      value={quizSettings.timeLimit}
                      onChange={(e) => setQuizSettings({
                        ...quizSettings,
                        timeLimit: parseInt(e.target.value) || 15
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Spaces Summary */}
            {selectedSpaces.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    Quiz Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Selected Spaces:</span>
                      <span className="font-medium">{selectedSpaces.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Documents:</span>
                      <span className="font-medium">{totalContent.documents}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Flashcards:</span>
                      <span className="font-medium">{totalContent.flashcards}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Questions:</span>
                      <span className="font-medium">{quizSettings.questionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Time Limit:</span>
                      <span className="font-medium">{quizSettings.timeLimit} min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Quiz Button */}
            <Button
              onClick={handleGenerateQuiz}
              disabled={selectedSpaces.length === 0 || isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Generating Quiz...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Generate Quiz
                </>
              )}
            </Button>

            {selectedSpaces.length === 0 && (
              <p className="text-sm text-gray-500 text-center">
                Select at least one space to generate a quiz
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 