import type React from "react"
import "../ui/globals.css"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background font-inter antialiased">
      {children}
    </div>
  )
}