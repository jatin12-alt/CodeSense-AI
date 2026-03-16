'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Github, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
        setIsScrolled(window.scrollY > 20)
        setLastScrollY(window.scrollY)
      }
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-8 py-4 transition-transform duration-300 backdrop-blur-xl border-b border-[rgba(255,255,255,0.07)] bg-[rgba(8,11,16,0.85)] ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LEFT — Logo */}
        <Link href="/">
          <span className="font-display font-bold text-xl cursor-pointer">
            <span className="text-[#e8edf3]">Code</span>
            <span className="text-[#00e5a0]">Sense</span>
            <span className="text-[#e8edf3]"> AI</span>
          </span>
        </Link>

        {/* CENTER — Badge & Nav links */}
        <div className="hidden md:flex items-center gap-8">
          <span className="flex items-center gap-2 border border-[rgba(0,229,160,0.2)] text-[#00e5a0] text-[10px] tracking-[2px] uppercase px-3 py-1.5 rounded-full">
            POWERED BY GEMINI 1.5 PRO
          </span>
          <div className="flex gap-6">
            <Link href="/demo" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              Demo
            </Link>
            <Link href="/about" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              About
            </Link>
            <Link href="/how-it-works" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              How It Works
            </Link>
          </div>
        </div>

        {/* RIGHT — Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://github.com/jatin12-alt/CodeSense-AI.git"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6b7a8d] hover:text-white transition"
          >
            <Github size={18} />
          </a>
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">
              Get Started
            </Button>
          </Link>
        </div>

        {/* MOBILE — Hamburger */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#6b7a8d] hover:text-white transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 p-4 bg-[#0d1117] border-b border-[rgba(255,255,255,0.07)] flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <Link href="/demo" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
            Demo
          </Link>
          <Link href="/about" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
            About
          </Link>
          <Link href="/how-it-works" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
            How It Works
          </Link>
          <div className="border-t border-[rgba(255,255,255,0.07)] pt-4 flex flex-col gap-3">
            <Link href="/sign-in" className="w-full">
              <Button variant="ghost" size="sm" className="w-full justify-center">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up" className="w-full">
              <Button size="sm" className="w-full justify-center">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
