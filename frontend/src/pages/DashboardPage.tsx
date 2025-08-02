"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
  User,
  FolderOpen,
  GraduationCap,
  Brain,
  MessageCircle,
  Search,
  Settings,
  LogOut,
  Plus,
  History,
  Sparkles,
  FileText,
} from "lucide-react"
import { FloatingDock } from "../components/ui/floating-dock"
import { IconBrandGithub, IconBrandX, IconExchange, IconHome, IconNewSection, IconTerminal2 } from "@tabler/icons-react"
import { useSpaces } from "../hooks/useSpaces"
import { useAuth } from "../hooks/useAuth"
import { SpaceForm } from "../components/spaces/SpaceForm"
import LoadingSpinner from "../components/common/LoadingSpinner"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateSpace, setShowCreateSpace] = useState(false)
  const { spaces, loading: spacesLoading, refreshSpaces } = useSpaces()
  const { user, logout } = useAuth()

  // Filter spaces based on search
  const filteredSpaces = spaces.filter(
    (space) =>
      space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      space.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Calculate stats from actual data
  const totalSpaces = spaces.length
  const totalDocuments = spaces.reduce((acc, space) => acc + (space.document_count || 0), 0)
  const totalFlashcards = spaces.reduce((acc, space) => acc + (space.flashcard_count || 0), 0)
  const totalChats = spaces.reduce((acc, space) => acc + (space.chat_count || 0), 0)

  const quickStats = [
    { label: "Active Spaces", value: totalSpaces.toString(), icon: FolderOpen, color: "text-blue-500" },
    { label: "Documents", value: totalDocuments.toString(), icon: FileText, color: "text-green-500" },
    { label: "Flashcards", value: totalFlashcards.toString(), icon: Brain, color: "text-purple-500" },
    { label: "Conversations", value: totalChats.toString(), icon: MessageCircle, color: "text-orange-500" },
  ]

  const dashboardSections = [
    {
      icon: User,
      title: "User Profile",
      description: "Manage your account and preferences",
      color: "from-blue-500 to-cyan-500",
      href: "/profile",
      stats: user ? `Welcome, ${user.username}` : "Profile",
    },
    {
      icon: FolderOpen,
      title: "Spaces",
      description: "Organize your learning materials",
      color: "from-purple-500 to-pink-500",
      href: "/spaces",
      stats: `${totalSpaces} spaces`,
    },
    {
      icon: GraduationCap,
      title: "AI-Tutor",
      description: "Get personalized learning assistance",
      color: "from-green-500 to-emerald-500",
      href: "/ai-tutor",
      stats: "Interactive learning",
    },
    {
      icon: Brain,
      title: "AI-Quizzes",
      description: "Test your knowledge with smart quizzes",
      color: "from-red-500 to-orange-500",
      href: "/ai-quizzes",
      stats: `${totalFlashcards} flashcards`,
    },
    {
      icon: MessageCircle,
      title: "Converse",
      description: "Chat and collaborate with AI",
      color: "from-indigo-500 to-purple-500",
      href: "/converse",
      stats: `${totalChats} conversations`,
    },
  ]

  const links = [
    {
      title: "Home",
      icon: <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/dashboard",
    },
    {
      title: "Spaces",
      icon: <IconTerminal2 className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/spaces",
    },
    {
      title: "AI Tutor",
      icon: <IconNewSection className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/ai-tutor",
    },
    {
      title: "Profile",
      icon: <img src="https://assets.aceternity.com/logo-dark.png" width={20} height={20} alt="Profile" />,
      href: "/profile",
    },
    {
      title: "Quizzes",
      icon: <IconExchange className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/ai-quizzes",
    },
    {
      title: "Converse",
      icon: <IconBrandX className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "/converse",
    },
    {
      title: "GitHub",
      icon: <IconBrandGithub className="h-full w-full text-neutral-500 dark:text-neutral-300" />,
      href: "#",
    },
  ]

  const handleCreateSpace = () => {
    setShowCreateSpace(false)
    refreshSpaces()
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16171A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-2xl font-bold">
                MicroNotes
              </Link>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search spaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <History className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              <Link to="/profile">
                <Button variant="outline" size="icon">
                  <User className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="icon" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back{user ? `, ${user.username}` : ""}!</h1>
          <p className="text-gray-600 dark:text-gray-400">Continue your learning journey or start something new.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard Sections */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Your Learning Hub</h2>
            <Button className="btn-primary" onClick={() => setShowCreateSpace(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Space
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {dashboardSections.map((section, index) => (
              <Link key={index} to={section.href}>
                <Card className="hover-scale hover-glow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center mb-4`}
                    >
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{section.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{section.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">{section.stats}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Spaces & Quick Access */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Spaces */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5" />
                    Recent Spaces
                  </div>
                  <Link to="/spaces">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {spacesLoading ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : filteredSpaces.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {searchQuery ? "No spaces match your search." : "No spaces created yet."}
                    </p>
                    {!searchQuery && (
                      <Button onClick={() => setShowCreateSpace(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Space
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSpaces.slice(0, 5).map((space) => (
                      <Link key={space.id} to={`/spaces/${space.id}`}>
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                            <FolderOpen className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{space.name}</p>
                            <p className="text-sm text-gray-500">
                              {space.document_count || 0} docs • {space.flashcard_count || 0} cards
                            </p>
                          </div>
                          <div className="text-xs text-gray-400">{new Date(space.updated_at).toLocaleDateString()}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowCreateSpace(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Space
                </Button>

                <Link to="/spaces">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Browse All Spaces
                  </Button>
                </Link>

                <Link to="/ai-tutor">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Start AI Tutoring
                  </Button>
                </Link>

                <Link to="/ai-quizzes">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Brain className="w-4 h-4 mr-2" />
                    Practice Flashcards
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Space Modal */}
      {showCreateSpace && <SpaceForm onClose={() => setShowCreateSpace(false)} onSuccess={handleCreateSpace} />}

      <div>
        <FloatingDock mobileClassName="translate-y-20" items={links} />
      </div>
    </div>
  )
}
