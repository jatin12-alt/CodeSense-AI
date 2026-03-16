'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#080b10]">
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
        <div className="text-6xl mb-6 opacity-20">🚧</div>
        <div className="inline-flex items-center gap-2 border border-[rgba(0,229,160,0.2)] text-[#00e5a0] text-[10px] tracking-[2px] uppercase px-3 py-1.5 rounded-full mb-6 font-mono">
          IN DEVELOPMENT
        </div>
        <h1 className="font-display font-bold text-3xl text-[#e8edf3] mb-4">
          Dashboard Coming Soon
        </h1>
        <p className="text-[#6b7a8d] text-sm font-mono max-w-sm mb-8">
          We&apos;re building something powerful. Check back soon.
        </p>
        <Link href="/">
          <button className="border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] hover:text-white hover:border-white font-mono text-sm px-6 py-2 rounded-lg transition">
            ← Back to Home
          </button>
        </Link>
      </div>
      <Footer />
    </div>
  )
}
