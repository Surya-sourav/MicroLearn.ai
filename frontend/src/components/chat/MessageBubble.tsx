"use client"

import { formatDistanceToNow } from "date-fns"
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "../ui/button"
import { useState } from "react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  spaceId?: string
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false)

  const isUser = message.role === "user"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={`flex-1 max-w-[80%] ${isUser ? "text-right" : "text-left"}`}>
        <div
          className={`inline-block p-3 rounded-lg ${
            isUser
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        <div
          className={`flex items-center gap-2 mt-1 text-xs text-gray-500 ${isUser ? "justify-end" : "justify-start"}`}
        >
          <span>{formatDistanceToNow(message.timestamp, { addSuffix: true })}</span>

          {!isUser && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCopy}>
                <Copy className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {copied && <div className="text-xs text-green-500 mt-1">Copied!</div>}
      </div>
    </div>
  )
}
