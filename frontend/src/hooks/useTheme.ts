"use client"

import { useState, useEffect } from "react"

export const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    // Check localStorage and system preference
    const savedTheme = localStorage.getItem("color-mode")
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      setTheme("dark")
      document.documentElement.classList.add("tw-dark")
    } else {
      setTheme("light")
      document.documentElement.classList.remove("tw-dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)

    if (newTheme === "dark") {
      document.documentElement.classList.add("tw-dark")
      localStorage.setItem("color-mode", "dark")
    } else {
      document.documentElement.classList.remove("tw-dark")
      localStorage.setItem("color-mode", "light")
    }
  }

  return { theme, toggleTheme }
}
