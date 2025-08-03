"use client"

import { useState } from "react"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { SpaceCard } from "./SpaceCard"
import { SpaceForm } from "./SpaceForm"
import { useSpaces } from "../../hooks/useSpaces"
import LoadingSpinner from "../common/LoadingSpinner"
import { Search, Plus, FolderOpen, Grid3X3, List, Filter } from "lucide-react"

export function SpaceList() {
  const { spaces, loading, deleteSpace } = useSpaces()
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const filteredSpaces = spaces.filter(
    (space) =>
      space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDeleteSpace = async (spaceId: string) => {
    if (window.confirm("Are you sure you want to delete this space? This action cannot be undone.")) {
      await deleteSpace(spaceId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Spaces</h1>
          <p className="text-gray-600 dark:text-gray-400">Organize your learning materials into focused study spaces</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Space
        </Button>
      </div>

      {/* Search and Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search spaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Create Space Form */}
      {showCreateForm && (
        <SpaceForm onClose={() => setShowCreateForm(false)} onSuccess={() => setShowCreateForm(false)} />
      )}

      {/* Spaces Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredSpaces.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">{searchTerm ? "No spaces found" : "No spaces yet"}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm
                ? "Try adjusting your search terms."
                : "Create your first space to start organizing your learning materials."}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Space
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
          }
        >
          {filteredSpaces.map((space) => (
            <SpaceCard key={space.id} space={space} viewMode={viewMode} onDelete={handleDeleteSpace} />
          ))}
        </div>
      )}
    </div>
  )
}
