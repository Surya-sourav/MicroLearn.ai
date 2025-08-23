"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import LoadingSpinner from "../common/LoadingSpinner"
import { useDocuments } from "../../hooks/useDocument"
import { DocumentUpload } from "./DocumentUpload"
import { ProcessingStatus } from "./ProcessingStatus"
import { FileText, Search, Filter, Download, Trash2, Eye, Calendar, FileIcon } from "lucide-react"

interface DocumentListProps {
  spaceId?: string
}

export function DocumentList({ spaceId }: DocumentListProps) {
  const { documents, loading, deleteDocument, refreshDocuments, error } = useDocuments(spaceId)
  const [searchTerm, setSearchTerm] = useState("")
  const [showUpload, setShowUpload] = useState(false)

  // Debug logging
  console.log("DocumentList render:", { spaceId, documents, loading, error })

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.content_preview?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getFileIcon = (contentType: string) => {
    if (contentType === "pdf") return <FileText className="w-4 h-4" />
    if (contentType === "docx") return <FileText className="w-4 h-4" />
    if (contentType === "youtube") return <FileIcon className="w-4 h-4" />
    if (contentType === "web_page" || contentType === "url") return <FileIcon className="w-4 h-4" />
    return <FileText className="w-4 h-4" />
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Documents</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your learning materials and resources</p>
        </div>
        <Button onClick={() => setShowUpload(true)}>
          <FileText className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          spaceId={spaceId}
          onClose={() => setShowUpload(false)}
          onUploadComplete={() => {
            setShowUpload(false)
            refreshDocuments()
          }}
        />
      )}

      {/* Documents Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm ? "No documents match your search." : "Upload your first document to get started."}
            </p>
            {!searchTerm && <Button onClick={() => setShowUpload(true)}>Upload Document</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getFileIcon(document.content_type)}
                    <CardTitle className="text-sm font-medium truncate">{document.title}</CardTitle>
                  </div>
                  <ProcessingStatus status={document.processing_status} />
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {document.content_preview && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {document.content_preview.substring(0, 150)}...
                    </p>
                  )}
                  {document.error_message && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Error: {document.error_message}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(document.created_at).toLocaleDateString()}
                    </div>
                    <span className="capitalize">{document.content_type}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteDocument(document.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
