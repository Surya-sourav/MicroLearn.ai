import type React from "react"
import { Brain } from "lucide-react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md", text }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} animate-spin`}>
        <Brain className="w-full h-full text-purple-500" />
      </div>
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
