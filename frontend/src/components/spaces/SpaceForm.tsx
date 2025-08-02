"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useSpaces } from "../../hooks/useSpaces"
import LoadingSpinner from "../common/LoadingSpinner"
import { X, FolderPlus, AlertCircle } from "lucide-react"

interface Space {
  id: string
  name: string
  description?: string
  subject: string
  color?: string
  created_at: string
  updated_at: string
}

interface SpaceFormProps {
  space?: Space
  onClose: () => void
  onSuccess: () => void
}

export function SpaceForm({ space, onClose, onSuccess }: SpaceFormProps) {
  const [formData, setFormData] = useState({
    name: space?.name || "",
    description: space?.description || "",
    subject: space?.subject || "General",
    color: space?.color || "#3B82F6",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { createSpace, updateSpace, loading, error } = useSpaces()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Space name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Space name must be at least 2 characters"
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Space name must be less than 100 characters"
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      if (space) {
        await updateSpace(space.id, formData)
      } else {
        await createSpace(formData)
      }
      onSuccess()
    } catch (err) {
      console.error("Failed to save space:", err)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5" />
              {space ? "Edit Space" : "Create New Space"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Space Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter space name..."
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="e.g., Physics, Math, History..."
                className={errors.subject ? "border-red-500" : ""}
              />
              {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what this space is for..."
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.description ? "border-red-500" : ""
                }`}
              />
              {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              <p className="text-xs text-gray-500">{formData.description.length}/500 characters</p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || !formData.name.trim() || !formData.subject.trim()}>
                {loading ? (
                  <>
                    <LoadingSpinner />
                    {space ? "Updating..." : "Creating..."}
                  </>
                ) : space ? (
                  "Update Space"
                ) : (
                  "Create Space"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
