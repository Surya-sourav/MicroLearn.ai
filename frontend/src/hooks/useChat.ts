"use client"

import { useState, useEffect } from "react"
import { chatService } from "../services/chat"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  spaceId?: string
}

export function useChat(spaceId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (spaceId) {
      loadChatHistory()
    }
  }, [spaceId])

  const loadChatHistory = async () => {
    if (!spaceId) return

    try {
      setLoading(true)
      const history = await chatService.getChatHistory(spaceId)
      setMessages(
        history.map((msg) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.created_at),
          spaceId,
        })),
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (content: string, _chatType: "general" | "tutor" | "quiz" = "general") => {
    if (!spaceId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
      timestamp: new Date(),
      spaceId,
    }

    setMessages((prev) => [...prev, userMessage])
    setLoading(true)
    setError(null)

    try {
      const response = await chatService.sendMessage(spaceId, { message: content })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        role: "assistant",
        timestamp: new Date(),
        spaceId,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (err: any) {
      setError(err.message)
      // Remove the user message if sending failed
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    setError(null)
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearChat,
    refreshHistory: loadChatHistory,
  }
}
