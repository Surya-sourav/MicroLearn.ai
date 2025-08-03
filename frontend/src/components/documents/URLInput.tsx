"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Link, AlertCircle } from "lucide-react"

interface URLInputProps {
  onSubmit: (url: string) => void
  loading?: boolean
}

export function URLInput({ onSubmit, loading = false }: URLInputProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    if (!validateUrl(url)) {
      setError("Please enter a valid URL")
      return
    }

    setError("")
    onSubmit(url)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="url">Document URL</Label>
        <div className="relative">
          <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="url"
            type="url"
            placeholder="https://example.com/document.pdf"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError("")
            }}
            className="pl-10"
          />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">Supported formats: PDF, DOC, DOCX, TXT, MD</div>

      <Button type="submit" disabled={loading || !url.trim()} className="w-full">
        {loading ? "Processing..." : "Upload from URL"}
      </Button>
    </form>
  )
}
