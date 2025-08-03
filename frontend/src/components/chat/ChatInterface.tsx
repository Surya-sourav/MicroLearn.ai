"use client"

import { useRef, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { MessageBubble } from "./MessageBubble"
import { ChatInput } from "./ChatInput"
import { useChat } from "../../hooks/useChat"
import LoadingSpinner from "../common/LoadingSpinner"
import { MessageSquare, Bot } from "lucide-react"

interface ChatInterfaceProps {
  spaceId?: string
  chatType?: "general" | "tutor" | "quiz"
}

export function ChatInterface({ spaceId, chatType = "general" }: ChatInterfaceProps) {
  const { messages, loading, sendMessage, clearChat } = useChat(spaceId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (content: string) => {
    await sendMessage(content, chatType)
  }

  const getChatTitle = () => {
    switch (chatType) {
      case "tutor":
        return "AI Tutor"
      case "quiz":
        return "Quiz Assistant"
      default:
        return "Chat"
    }
  }

  const getChatIcon = () => {
    switch (chatType) {
      case "tutor":
        return <Bot className="w-5 h-5" />
      case "quiz":
        return <MessageSquare className="w-5 h-5" />
      default:
        return <MessageSquare className="w-5 h-5" />
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getChatIcon()}
            {getChatTitle()}
          </div>
          <Button variant="outline" size="sm" onClick={clearChat}>
            Clear Chat
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start a conversation to begin learning!</p>
            </div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}

          {loading && (
            <div className="flex justify-center">
              <LoadingSpinner />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
        </div>
      </CardContent>
    </Card>
  )
}
