import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useSpaces } from "../hooks/useSpaces"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { 
  MessageCircle, 
  Send, 
  Folder, 
  Search, 
  CheckCircle, 
  Circle,
  Bot,

  Sparkles
} from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

export default function ConversePage() {
  const { spaces, loading } = useSpaces()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const { multiSpaceChatService } = await import("../services/multiSpaceChat")
      
      const response = await multiSpaceChatService.chatWithSpaces({
        space_ids: selectedSpaces,
        message: inputMessage,
        use_vector_search: true
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: "assistant",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Failed to send message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        role: "assistant",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }



  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading spaces..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Converse with AI</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Chat and collaborate with AI using context from your spaces
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-200px)]">
          {/* Space Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Folder className="w-5 h-5 mr-2" />
                  Context Spaces
                </CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Select spaces to provide context for the conversation
                </p>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search spaces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Spaces List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredSpaces.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {searchTerm ? "No spaces match your search." : "No spaces available."}
                    </div>
                  ) : (
                    filteredSpaces.map((space) => (
                      <div
                        key={space.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          selectedSpaces.includes(space.id)
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => toggleSpaceSelection(space.id)}
                      >
                        <div className="flex items-center">
                          {selectedSpaces.includes(space.id) ? (
                            <CheckCircle className="w-4 h-4 text-blue-600 mr-2" />
                          ) : (
                            <Circle className="w-4 h-4 text-gray-400 mr-2" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{space.name}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {space.document_count || 0} docs • {space.flashcard_count || 0} cards
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Selected Spaces Summary */}
                {selectedSpaces.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm font-medium mb-2">Selected Context:</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {selectedSpaces.length} space{selectedSpaces.length !== 1 ? 's' : ''} selected
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  AI Conversation
                  {selectedSpaces.length > 0 && (
                    <span className="ml-2 text-sm text-blue-600 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {selectedSpaces.length} context space{selectedSpaces.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Select spaces to provide context and start chatting with AI
                      </p>
                      {selectedSpaces.length === 0 && (
                        <div className="flex items-center justify-center text-sm text-gray-500">
                          <Sparkles className="w-4 h-4 mr-1" />
                          Select spaces for better responses
                        </div>
                      )}
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <div className="flex items-start">
                            {message.role === "assistant" && (
                              <Bot className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <div className="text-sm">{message.content}</div>
                              <div className={`text-xs mt-1 ${
                                message.role === "user" ? "text-blue-100" : "text-gray-500"
                              }`}>
                                {formatTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg">
                        <div className="flex items-center">
                          <Bot className="w-4 h-4 mr-2" />
                          <LoadingSpinner size="sm" text="AI is thinking..." />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 