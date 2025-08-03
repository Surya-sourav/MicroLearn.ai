"use client"

import type React from "react"

import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { FolderOpen, FileText, Brain, MessageSquare, Calendar, MoreVertical, Edit, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Space {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
  document_count?: number
  flashcard_count?: number
  chat_count?: number
}

interface SpaceCardProps {
  space: Space
  viewMode: "grid" | "list"
  onDelete: (spaceId: string) => void
  onEdit?: (space: Space) => void
}

export function SpaceCard({ space, viewMode, onDelete, onEdit }: SpaceCardProps) {
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(space.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit?.(space)
  }

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Link to={`/spaces/${space.id}`} className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-lg">{space.name}</h3>
                {space.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">{space.description}</p>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{space.document_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Brain className="w-4 h-4" />
                  <span>{space.flashcard_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{space.chat_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(space.updated_at), { addSuffix: true })}</span>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2 ml-4">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={handleEdit}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-3">
            <FolderOpen className="w-6 h-6 text-white" />
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardTitle className="text-lg line-clamp-1">{space.name}</CardTitle>
        {space.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{space.description}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <FileText className="w-3 h-3" />
                <span>{space.document_count || 0}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Docs</div>
            </div>

            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <Brain className="w-3 h-3" />
                <span>{space.flashcard_count || 0}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Cards</div>
            </div>

            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                <MessageSquare className="w-3 h-3" />
                <span>{space.chat_count || 0}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">Chats</div>
            </div>
          </div>

          {/* Last updated */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Updated {formatDistanceToNow(new Date(space.updated_at), { addSuffix: true })}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Link to={`/spaces/${space.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Open Space
              </Button>
            </Link>

            <div className="flex gap-1">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={handleEdit} className="h-8 w-8 p-0">
                  <Edit className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
