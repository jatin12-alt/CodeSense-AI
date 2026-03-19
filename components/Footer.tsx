import Link from 'next/link'
import { Github } from 'lucide-react'

export default function Footer() {
  const techStack = ["Next.js 15", "Groq AI", "pgvector", "Clerk", "Neon DB"]

  return (
    <footer className="bg-[#080b10] pt-16 pb-8 px-10 relative">
      {/* TOP GLOW */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,229,160,0.4) 30%, rgba(0,170,255,0.4) 70%, transparent 100%)'
        }}
      />

      {/* ROW 1 — 4 column grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        {/* Column 1 — Brand */}
        <div>
          <Link href="/">
            <span className="font-display font-bold text-xl cursor-pointer">
              <span className="text-[#e8edf3]">Code</span>
              <span className="text-[#00e5a0]">Sense</span>
              <span className="text-[#e8edf3]"> AI</span>
            </span>
          </Link>
          <p className="text-xs text-[#6b7a8d] font-mono mt-2">
            Understand any codebase, instantly.
          </p>
          <a
            href="https://github.com/jatin12-alt/CodeSense-AI.git"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-fit border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-2 text-xs text-[#6b7a8d] hover:border-[rgba(0,229,160,0.3)] hover:text-white transition font-mono mt-4"
          >
            <Github size={14} /> Star on GitHub ⭐
          </a>
        </div>

        {/* Column 2 — PRODUCT */}
        <div>
          <h4 className="text-[10px] tracking-[2px] text-[#6b7a8d] uppercase mb-4 font-mono">PRODUCT</h4>
          <div className="flex flex-col gap-2">
            <Link href="/demo" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              Demo
            </Link>
            <Link href="/#features" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              Features
            </Link>
            <Link href="/how-it-works" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              How It Works
            </Link>
            <div className="flex items-center text-sm text-[#6b7a8d] font-mono opacity-60">
              Pricing
              <span className="ml-2 text-[9px] uppercase tracking-wider bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.2)] text-[#00e5a0] px-2 py-0.5 rounded-full">Soon</span>
            </div>
          </div>
        </div>

        {/* Column 3 — DEVELOPERS */}
        <div>
          <h4 className="text-[10px] tracking-[2px] text-[#6b7a8d] uppercase mb-4 font-mono">DEVELOPERS</h4>
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com/jatin12-alt/CodeSense-AI.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#6b7a8d] hover:text-white transition font-mono"
            >
              GitHub Repo
            </a>
            <Link href="/about" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              About
            </Link>
            <Link href="/contact" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              Contact
            </Link>
            <div className="flex items-center text-sm text-[#6b7a8d] font-mono opacity-60">
              Changelog
              <span className="ml-2 text-[9px] uppercase tracking-wider bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.2)] text-[#00e5a0] px-2 py-0.5 rounded-full">Soon</span>
            </div>
          </div>
        </div>

        {/* Column 4 — LEGAL */}
        <div>
          <h4 className="text-[10px] tracking-[2px] text-[#6b7a8d] uppercase mb-4 font-mono">LEGAL</h4>
          <div className="flex flex-col gap-2">
            <Link href="/privacy" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-[#6b7a8d] hover:text-white transition font-mono">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[rgba(255,255,255,0.07)] my-8" />

      {/* ROW 2 — Bottom bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[11px] text-[#6b7a8d] font-mono">
          © 2026 CodeSense AI. All rights reserved.
        </p>

        <div className="flex gap-2 flex-wrap justify-center">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] text-[9px] uppercase tracking-wider px-2 py-1 rounded-full font-mono"
            >
              {tech}
            </span>
          ))}
        </div>

        <p className="text-[11px] text-[#6b7a8d] font-mono flex gap-1 items-center">
          Built with ♥ by
          <a
            href="https://github.com/jatin12-alt"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00e5a0] hover:underline"
          >
            Jatin Dongre
          </a>
        </p>
      </div>
    </footer>
  )
}
