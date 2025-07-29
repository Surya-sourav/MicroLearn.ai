"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react"
import { useAuth } from "../hooks/useAuth"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  })
  const { register, loading, error } = useAuth()
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    try {
      await register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      })
      setSuccess(true)
    } catch (err) {
      // error handled by hook
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        <Card className="bg-white dark:bg-[#16171A] shadow-xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create Your Pixa Account</CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-center">Join Pixa and start your AI journey today.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  name="agreeToTerms"
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300"
                  required
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Account"}
              </Button>
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
              {success && <div className="text-green-600 text-sm mt-2">Registration successful! You can now log in.</div>}
            </form>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
