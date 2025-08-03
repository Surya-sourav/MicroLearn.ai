"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { DocumentList } from "../components/documents/DocumentList"
import { FlashcardList } from "../components/flashcards/FlashcardList"
import { ChatInterface } from "../components/chat/ChatInterface"
import { useSpaces } from "../hooks/useSpaces"
import { useDocuments } from "../hooks/useDocument"
import { useFlashcards } from "../hooks/useFlashcards"
import LoadingSpinner from "../components/common/LoadingSpinner"
import { ArrowLeft, FileText, Brain, MessageCircle, Settings, Upload, Plus, BarChart3, Calendar } from "lucide-react"

export default function SpaceDetail() {
  const { spaceId } = useParams<{ spaceId: string }>()
  const [activeTab, setActiveTab] = useState("overview")
  const { getSpace, loading: spaceLoading } = useSpaces()
  const { documents, loading: documentsLoading } = useDocuments(spaceId)
  const { flashcards, loading: flashcardsLoading } = useFlashcards(spaceId)
  const [space, setSpace] = useState<any>(null)

  useEffect(() => {
    if (spaceId) {
      loadSpace()
    }
  }, [spaceId])

  const loadSpace = async () => {
    if (!spaceId) return
    try {
      const spaceData = await getSpace(spaceId)
      setSpace(spaceData)
    } catch (error) {
      console.error("Failed to load space:", error)
    }
  }

  if (spaceLoading || !space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  const stats = [
    {
      label: "Documents",
      value: documents.length,
      icon: FileText,
      color: "text-blue-500",
      loading: documentsLoading,
    },
    {
      label: "Flashcards",
      value: flashcards.length,
      icon: Brain,
      color: "text-purple-500",
      loading: flashcardsLoading,
    },
    {
      label: "Conversations",
      value: space.chat_count || 0,
      icon: MessageCircle,
      color: "text-green-500",
      loading: false,
    },
    {
      label: "Created",
      value: new Date(space.created_at).toLocaleDateString(),
      icon: Calendar,
      color: "text-gray-500",
      loading: false,
    },
  ]

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16171A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link to="/spaces">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Spaces
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{space.name}</h1>
                {space.description && <p className="text-sm text-gray-600 dark:text-gray-400">{space.description}</p>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.loading ? <LoadingSpinner /> : stat.value}</p>
                  </div>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" onClick={() => setActiveTab("documents")}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveTab("flashcards")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Flashcards
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => setActiveTab("chat")}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Conversation
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {documents.slice(0, 3).map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div className="flex-1">
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}

                    {flashcards.slice(0, 2).map((card) => (
                      <div key={card.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Brain className="w-5 h-5 text-purple-500" />
                        <div className="flex-1">
                          <p className="font-medium">Flashcard created</p>
                          <p className="text-sm text-gray-500">{new Date(card.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}

                    {documents.length === 0 && flashcards.length === 0 && (
                      <div className="text-center py-8">
                        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 dark:text-gray-400">No activity yet</p>
                        <p className="text-sm text-gray-500">Upload documents or create flashcards to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <DocumentList spaceId={spaceId} />
          </TabsContent>

          <TabsContent value="flashcards">
            <FlashcardList spaceId={spaceId!} />
          </TabsContent>

          <TabsContent value="chat">
            <div className="max-w-4xl mx-auto">
              <ChatInterface spaceId={spaceId} chatType="general" />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Completed</span>
                      <span>{documents.filter((d) => d.processing_status === "completed").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing</span>
                      <span>{documents.filter((d) => d.processing_status === "processing").length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed</span>
                      <span>{documents.filter((d) => d.processing_status === "failed").length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Flashcard Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Reviews</span>
                      <span>{flashcards.reduce((acc, card) => acc + card.review_count, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Correct Answers</span>
                      <span>{flashcards.reduce((acc, card) => acc + card.correct_count, 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy</span>
                      <span>
                        {flashcards.length > 0
                          ? Math.round(
                              (flashcards.reduce((acc, card) => acc + card.correct_count, 0) /
                                flashcards.reduce((acc, card) => acc + card.review_count, 0) || 0) * 100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Space Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Created</span>
                      <span>{new Date(space.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated</span>
                      <span>{new Date(space.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Items</span>
                      <span>{documents.length + flashcards.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
