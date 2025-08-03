import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useSpaces } from "../hooks/useSpaces"
import { useAuth } from "../hooks/useAuth"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { 
  Folder, 
  Plus, 
  Search, 
  Calendar, 
  FileText, 
  Brain, 
  MessageCircle,
  ArrowRight,
  Settings
} from "lucide-react"

export default function SpacesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { spaces, loading, error, createSpace } = useSpaces()
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSpace, setNewSpace] = useState({
    name: "",
    description: "",
    subject: "General",
    color: "#3B82F6"
  })

  const filteredSpaces = spaces.filter(space =>
    space.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    space.subject.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createSpace(newSpace)
      setShowCreateModal(false)
      setNewSpace({ name: "", description: "", subject: "General", color: "#3B82F6" })
    } catch (error) {
      console.error("Failed to create space:", error)
    }
  }

  const getSpaceStats = (space: any) => {
    return {
      documents: space.document_count || 0,
      flashcards: space.flashcard_count || 0,
      conversations: space.conversation_count || 0
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your spaces..." />
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Spaces</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Organize and manage your learning materials
              </p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Space
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search spaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Folder className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">{spaces.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Spaces</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {spaces.reduce((acc, space) => acc + (space.document_count || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Documents</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Brain className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {spaces.reduce((acc, space) => acc + (space.flashcard_count || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Flashcards</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <MessageCircle className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <div className="text-2xl font-bold">
                    {spaces.reduce((acc, space) => acc + (space.conversation_count || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Conversations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spaces Grid */}
        {filteredSpaces.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Folder className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No spaces found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm ? "No spaces match your search." : "Create your first space to get started."}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Space
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space) => {
              const stats = getSpaceStats(space)
              return (
                <Card 
                  key={space.id} 
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/spaces/${space.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-10 h-10 rounded-lg mr-3 flex items-center justify-center"
                          style={{ backgroundColor: space.color }}
                        >
                          <Folder className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{space.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{space.subject}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                      {space.description || "No description provided"}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(space.created_at)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <FileText className="w-3 h-3 mr-1 text-green-600" />
                          {stats.documents}
                        </div>
                        <div className="flex items-center">
                          <Brain className="w-3 h-3 mr-1 text-purple-600" />
                          {stats.flashcards}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="w-3 h-3 mr-1 text-orange-600" />
                          {stats.conversations}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Space Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Space</h2>
            <form onSubmit={handleCreateSpace}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Space Name *</label>
                  <Input
                    value={newSpace.name}
                    onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                    placeholder="Enter space name..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject *</label>
                  <Input
                    value={newSpace.subject}
                    onChange={(e) => setNewSpace({ ...newSpace, subject: e.target.value })}
                    placeholder="e.g., Mathematics, Science, History"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newSpace.description}
                    onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                    placeholder="Describe what this space is for..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color</label>
                  <input
                    type="color"
                    value={newSpace.color}
                    onChange={(e) => setNewSpace({ ...newSpace, color: e.target.value })}
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Space</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 