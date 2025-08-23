import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { useAuth } from "../hooks/useAuth"
import { useSpaces } from "../hooks/useSpaces"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Edit, 
  Save, 
  X,
  Folder,
  FileText,
  Brain,
  MessageCircle,
  Activity
} from "lucide-react"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const { spaces } = useSpaces()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    email: user?.email || ""
  })

  const handleSave = async () => {
    // TODO: Implement profile update functionality
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditForm({
      username: user?.username || "",
      email: user?.email || ""
    })
    setIsEditing(false)
  }

  const getStats = () => {
    return {
      totalSpaces: spaces.length,
      totalDocuments: spaces.reduce((acc, space) => acc + (space.document_count || 0), 0),
      totalFlashcards: spaces.reduce((acc, space) => acc + (space.flashcard_count || 0), 0),
      totalConversations: 0  // TODO: Add conversation tracking
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    )
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your account and preferences
              </p>
            </div>
            <Button variant="outline" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Information
                  </CardTitle>
                  {!isEditing && (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Username</label>
                      <Input
                        value={editForm.username}
                        onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <Input
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        placeholder="Enter email"
                        type="email"
                      />
                    </div>
                    <div className="flex space-x-3">
                      <Button onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Username</div>
                        <div className="font-medium">{user.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Member Since</div>
                        <div className="font-medium">
                          {user.created_at ? formatDate(user.created_at) : "Unknown"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Learning Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Folder className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold">{stats.totalSpaces}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Spaces</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Brain className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold">{stats.totalFlashcards}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Flashcards</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <MessageCircle className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="text-2xl font-bold">{stats.totalConversations}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Conversations</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Account Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Notification Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    No recent activity to show.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 