import { useState } from "react"
import Header from "./components/common/Header"
import Footer from "./components/common/Footer"
import LoginForm from "./components/auth/LoginForm"
import RegisterPage from "./components/auth/RegisterForm"

export default function App() {
  const [isDark, setIsDark] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showSignup, setShowSignup] = useState(false)

  return (
    <div className={isDark ? "dark min-h-screen bg-black text-white" : "min-h-screen bg-[#fcfcfc] text-black"}>
      <Header isDark={isDark} setIsDark={setIsDark} />
      {/* Auth Modals */}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      {showSignup && <RegisterPage onClose={() => setShowSignup(false)} />}
      {/* Main content placeholder */}
      <main className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold mb-4">Welcome to MicroLearn</h1>
        <div className="flex gap-4">
          <button className="btn-primary" onClick={() => setShowLogin(true)}>Login</button>
          <button className="btn-primary" onClick={() => setShowSignup(true)}>Sign Up</button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
