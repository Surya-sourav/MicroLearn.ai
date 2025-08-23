import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import DashboardPage from "./pages/DashboardPage"
import SpacesPage from "./pages/SpacesPage"
import ProfilePage from "./pages/ProfilePage"
import AIQuizzesPage from "./pages/AIQuizzesPage"
import ConversePage from "./pages/ConversePage"
import QuizTakingPage from "./pages/QuizTakingPage"
import SpaceDetail from "./pages/SpaceDetail"
import AuthGuard from "./components/auth/AuthGuard"
import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          {/* <Route path="/login" element={<LoginPage />} /> */}
          {/* <Route path="/register" element={<RegisterPage />} /> */}

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <AuthGuard>
                <DashboardPage />
              </AuthGuard>
            } 
          />

          {/* Spaces Routes */}
          <Route 
            path="/spaces" 
            element={
              <AuthGuard>
                <SpacesPage />
              </AuthGuard>
            } 
          />

          <Route 
            path="/spaces/:spaceId" 
            element={
              <AuthGuard>
                <SpaceDetail />
              </AuthGuard>
            } 
          />

          {/* Profile Route */}
          <Route 
            path="/profile" 
            element={
              <AuthGuard>
                <ProfilePage />
              </AuthGuard>
            } 
          />

          {/* AI Quizzes Route */}
          <Route 
            path="/ai-quizzes" 
            element={
              <AuthGuard>
                <AIQuizzesPage />
              </AuthGuard>
            } 
          />

          {/* Converse Route */}
          <Route 
            path="/converse" 
            element={
              <AuthGuard>
                <ConversePage />
              </AuthGuard>
            } 
          />

          {/* Quiz Taking Route */}
          <Route 
            path="/quiz/:quizId" 
            element={
              <AuthGuard>
                <QuizTakingPage />
              </AuthGuard>
            } 
          />

          {/* Redirect unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
