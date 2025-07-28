"use client"

import { useState } from "react"

interface HeaderProps {
  isDark: boolean
  setIsDark: (dark: boolean) => void
}

export default function Header({ isDark, setIsDark }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-20 flex h-[60px] w-full max-w-5xl px-4 text-gray-700 bg-white dark:text-gray-200 dark:bg-[#17181b] rounded-md shadow-md backdrop-blur-lg opacity-[0.99]">
      <a href="/" className="flex p-1 gap-2 items-center">
        <div className="h-[30px] max-w-[100px]">
          <img
            src="/placeholder.svg"
            alt="logo"
            width={100}
            height={30}
            className="object-contain h-full w-full dark:invert"
          />
        </div>
        <span className="uppercase text-base font-medium">MicroLearn</span>
      </a>

      <nav className="hidden lg:flex items-center gap-5 mx-auto">
        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
          API
        </a>
        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
          Blog
        </a>
        <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
          Solutions
        </a>
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
            <span>Features</span>
          </button>
        </div>
        <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">
          Pricing
        </a>
      </nav>

      <div className="flex items-center gap-4 ml-auto">
        <button
          className="text-gray-600 dark:text-gray-300"
          onClick={() => setIsDark(!isDark)}
        >
          {isDark ? '🌞' : '🌙'}
        </button>
        <a href="/dashboard" className="hidden lg:flex gap-2 btn-primary">
          <span>Try playground</span>
        </a>
      </div>

      <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? '✖' : '☰'}
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#17181b] rounded-md shadow-lg p-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
              API
            </a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Blog
            </a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Solutions
            </a>
            <a href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">
              Pricing
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}
