import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import LoadingSpinner from "../common/LoadingSpinner"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user is authenticated by looking for access token
    const token = localStorage.getItem("access_token")
    if (!token && !loading) {
      setIsChecking(false)
    } else if (token && !user) {
      // Token exists but user state is not set - try to validate token
      // For now, we'll just set checking to false
      setIsChecking(false)
    } else {
      setIsChecking(false)
    }
  }, [user, loading])

  if (isChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    )
  }

  if (!user) {
    // Redirect to login page with the current location as the return URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
