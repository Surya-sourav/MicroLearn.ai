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
    // Wait for the auth hook to finish loading and validating
    if (!loading) {
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
