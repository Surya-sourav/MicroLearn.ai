"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import {
  MessageSquare,
  ImageIcon,
  Code,
  FileText,
  Music,
  Video,
  BarChart3,
  Settings,
  User,
  LogOut,
  Search,
  Plus,
  History,
  Sparkles,
} from "lucide-react"

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const aiTools = [
    {
      icon: MessageSquare,
      title: "AI Chat",
      description: "Chat with multiple AI models",
      color: "from-blue-500 to-cyan-500",
      href: "/chat",
    },
    {
      icon: ImageIcon,
      title: "Image Generator",
      description: "Create stunning images from text",
      color: "from-purple-500 to-pink-500",
      href: "/image-generator",
    },
    {
      icon: Code,
      title: "Code Generator",
      description: "Generate code in any language",
      color: "from-green-500 to-emerald-500",
      href: "/code-generator",
    },
    {
      icon: FileText,
      title: "PDF Generator",
      description: "Create and edit PDF documents",
      color: "from-red-500 to-orange-500",
      href: "/pdf-generator",
    },
    {
      icon: Music,
      title: "Music Generator",
      description: "Compose music with AI",
      color: "from-yellow-500 to-amber-500",
      href: "/music-generator",
    },
    {
      icon: Video,
      title: "Video Generator",
      description: "Create videos from text prompts",
      color: "from-indigo-500 to-purple-500",
      href: "/video-generator",
    },
    {
      icon: BarChart3,
      title: "AI Analytics",
      description: "Analyze data with AI insights",
      color: "from-teal-500 to-cyan-500",
      href: "/analytics",
    },
  ]

  const recentActivity = [
    { type: "chat", title: "Discussed React best practices", time: "2 hours ago" },
    { type: "image", title: "Generated landscape artwork", time: "4 hours ago" },
    { type: "code", title: "Created Python data analysis script", time: "1 day ago" },
    { type: "pdf", title: "Generated project report", time: "2 days ago" },
  ]

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-black">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#16171A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link to="/" className="text-2xl font-bold">
                PIXA
              </Link>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tools, chats, or files..."
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
              <Button variant="outline" size="icon">
                <User className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-gray-600 dark:text-gray-400">What would you like to create today?</p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Quick Start</h2>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {aiTools.map((tool, index) => (
              <Link key={index} to={tool.href}>
                <Card className="hover-scale hover-glow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${tool.color} flex items-center justify-center mb-4`}
                    >
                      <tool.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{tool.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        {activity.type === "chat" && <MessageSquare className="w-4 h-4" />}
                        {activity.type === "image" && <ImageIcon className="w-4 h-4" />}
                        {activity.type === "code" && <Code className="w-4 h-4" />}
                        {activity.type === "pdf" && <FileText className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Stats */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Usage This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">AI Chat Messages</span>
                  <span className="font-semibold">1,247 / 5,000</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "25%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Image Generations</span>
                  <span className="font-semibold">43 / 100</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: "43%" }}></div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Code Generations</span>
                  <span className="font-semibold">28 / 50</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "56%" }}></div>
                </div>

                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
