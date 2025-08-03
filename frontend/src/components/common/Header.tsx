"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { Menu, X, ArrowRight,Sun, Moon } from "lucide-react"

interface HeaderProps {
  isDark: boolean
  setIsDark: (dark: boolean) => void
}

export default function Header({ isDark, setIsDark }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-20 flex h-[60px] w-full max-w-5xl px-4 text-gray-700 bg-white dark:text-gray-200 dark:bg-[#17181b] rounded-md shadow-md backdrop-blur-lg opacity-[0.99]">
      <Link to="https://waitinglist-micro-ai.vercel.app/" className="flex p-1 gap-2 items-center">
        <div className="h-[30px] max-w-[100px]">
          <img
            src="https://via.placeholder.com/100x30/6366f1/ffffff?text=PIXA"
            alt="logo"
            className="object-contain h-full w-full dark:invert"
          />
        </div>
        <span className="uppercase text-base font-medium">M I C R O</span>
      </Link>

      <nav className="hidden lg:flex items-center gap-5 mx-auto">
        {/* <Link to="#" className="hover:text-black dark:hover:text-white transition-colors">
          API
        </Link> */}
        {/*}
        <Link to="#" className="hover:text-black dark:hover:text-white transition-colors">
          Blog
        </Link>
        <Link to="#" className="hover:text-black dark:hover:text-white transition-colors">
          Solutions 
        </Link>
        
        <div className="relative group">
          <button className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
            <span>Features</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">
          Pricing
        </a> */}
      </nav>

      <div className="flex items-center gap-4 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="text-gray-600 dark:text-gray-300"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button asChild className="hidden lg:flex gap-2">
          <Link to="https://waitinglist-micro-ai.vercel.app/">
            <span>Learn Micro Way</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#17181b] rounded-md shadow-lg p-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {/* <Link to="#" className="hover:text-black dark:hover:text-white transition-colors">
              API
            </Link>
            <Link to="#" className="hover:text-black dark:hover:text-white transition-colors">
              Blog
            </Link>
            <Link to="#" className="hover:text-black dark:hover:text-white transition-colors">
              Solutions
            </Link>
            <Link to="#" className="hover:text-black dark:hover:text-white transition-colors">
              Features
            </Link> */}
            {/* <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">
              Pricing
            </a> */}
            <Button asChild className="mt-4">
              <Link to="https://waitinglist-micro-ai.vercel.app/">
                <span>Learn Micro Way</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  )
}
