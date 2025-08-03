"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { useDocuments } from "../../hooks/useDocument"
import { URLInput } from "./URLInput"
import { Upload, X, FileText, Link, AlertCircle } from "lucide-react"

interface DocumentUploadProps {
  spaceId?: string
  onClose: () => void
  onUploadComplete: () => void
}

export function DocumentUpload({ spaceId, onClose, onUploadComplete }: DocumentUploadProps) {
  const [uploadType, setUploadType] = useState<"file" | "url">("file")
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { uploadDocument, uploadFromUrl, loading, error } = useDocuments(spaceId)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return

    try {
      await uploadDocument(selectedFile, spaceId)
      onUploadComplete()
    } catch (err) {
      console.error("Upload failed:", err)
    }
  }

  const handleUrlUpload = async (url: string) => {
    try {
      await uploadFromUrl(url, spaceId!)
      onUploadComplete()
    } catch (err) {
      console.error("URL upload failed:", err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Upload Document</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Upload Type Selector */}
          <div className="flex gap-2">
            <Button
              variant={uploadType === "file" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadType("file")}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              File Upload
            </Button>
            <Button
              variant={uploadType === "url" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadType("url")}
              className="flex-1"
            >
              <Link className="w-4 h-4 mr-2" />
              From URL
            </Button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}

          {uploadType === "file" ? (
            <div className="space-y-4">
              {/* File Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-600"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your file here, or click to browse
                </p>
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.md"
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>Choose File</span>
                  </Button>
                </Label>
              </div>

              {selectedFile && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <span className="text-xs text-gray-500">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                </div>
              )}

              <Button onClick={handleFileUpload} disabled={!selectedFile || loading} className="w-full">
                {loading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          ) : (
            <URLInput onSubmit={handleUrlUpload} loading={loading} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
