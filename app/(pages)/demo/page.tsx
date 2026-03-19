'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { useAuth } from '@clerk/nextjs'

export default function DemoPage() {
  const { isSignedIn } = useAuth()
  const [selectedFeature, setSelectedFeature] = useState<'chat' | 'review' | 'bug' | 'onboarding' | 'readme'>('chat')
  const [repoUrl, setRepoUrl] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Track page visit on mount
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_type: 'page_visit' })
        })
      } catch (err) {
        console.warn('Analytics tracking failed', err)
      }
    }
    trackVisit()
  }, [])

  const handleRunDemo = async () => {
    if (!repoUrl) {
      setError('Please enter a repository URL')
      return
    }
    if (selectedFeature !== 'onboarding' && selectedFeature !== 'readme' && !userInput) {
      setError('Please provide some input for the AI')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    // Track demo run
    try {
      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event_type: 'demo_run', 
          feature: selectedFeature 
        })
      })
    } catch (err) {
      console.warn('Analytics tracking failed', err)
    }

    try {
      const response = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: selectedFeature,
          repoUrl,
          userInput
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT PANEL — Input */}
          <div className="space-y-10">
            <div>
              <h1 className="font-display font-bold text-4xl mb-2 text-[#e8edf3]">Try CodeSense AI</h1>
              <p className="text-[#6b7a8d] font-mono text-sm">No signup required for demo mode</p>
            </div>

            <div className="space-y-8">
              {/* Section 1 — Repo URL */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#6b7a8d] font-mono">Repository URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/owner/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full bg-[#0f1520] border border-[rgba(255,255,255,0.07)] text-[#e8edf3] rounded-lg p-3 font-mono text-sm focus:border-[#00e5a0] focus:outline-none transition"
                />
                <p className="text-[10px] text-[#00e5a0] font-mono italic">⚡ Demo uses AI simulation</p>
              </div>

              {/* Section 2 — Feature selector */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-[#6b7a8d] font-mono">Select Feature</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'chat', label: '💬 Chat' },
                    { id: 'review', label: '🔍 PR Review' },
                    { id: 'bug', label: '🐛 Bug Detection' },
                    { id: 'onboarding', label: '📋 Onboarding' },
                    { id: 'readme', label: '📄 README' }
                  ].map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => setSelectedFeature(feature.id as 'chat' | 'review' | 'bug' | 'onboarding' | 'readme')}
                      className={`px-4 py-2 rounded-full font-mono text-xs transition-all ${
                        selectedFeature === feature.id
                          ? 'bg-[#00e5a0] text-black font-bold'
                          : 'border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] hover:text-white hover:border-white'
                      }`}
                    >
                      {feature.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 3 — Dynamic textarea */}
              <div className="space-y-3">
                {selectedFeature !== 'onboarding' && selectedFeature !== 'readme' ? (
                  <>
                    <label className="text-[10px] uppercase tracking-widest text-[#6b7a8d] font-mono">
                      {selectedFeature === 'chat' ? 'Your Question' : 'Code Snippet'}
                    </label>
                    <textarea
                      rows={6}
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={
                        selectedFeature === 'chat'
                          ? 'Ask anything about the codebase...'
                          : selectedFeature === 'review'
                          ? 'Paste your code snippet here...'
                          : 'Paste code to scan for bugs...'
                      }
                      className="w-full bg-[#0f1520] border border-[rgba(255,255,255,0.07)] text-[#e8edf3] rounded-lg p-3 font-mono text-sm focus:border-[#00e5a0] focus:outline-none transition resize-none"
                    />
                  </>
                ) : (
                  <div className="p-4 bg-[rgba(0,229,160,0.05)] border border-[rgba(0,229,160,0.1)] rounded-lg">
                    <p className="text-xs text-[#6b7a8d] font-mono leading-relaxed">
                      {selectedFeature === 'onboarding' 
                        ? 'AI will generate a complete onboarding guide based on the repository URL provided.'
                        : 'AI will generate an impressive professional README based on the repository context.'}
                    </p>
                  </div>
                )}
              </div>

              {error && <p className="text-red-500 text-xs font-mono">{error}</p>}

              <button
                onClick={handleRunDemo}
                disabled={isLoading}
                className="w-full bg-[#00e5a0] text-black font-mono font-medium px-8 py-3 rounded-lg hover:bg-[#00ffb3] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Running Simulation...' : 'Run Demo →'}
              </button>

              {!isSignedIn && (
                <p className="text-center text-xs text-[#6b7a8d] font-mono">
                  🔒 Want full features?{' '}
                  <Link href="/sign-up" className="text-[#00e5a0] hover:underline">
                    Sign up free →
                  </Link>
                </p>
              )}
            </div>
          </div>

          {/* RIGHT PANEL — Output */}
          <div className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8 flex flex-col min-h-[400px]">
            {isLoading ? (
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded-full w-full animate-pulse" />
                  <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded-full w-5/6 animate-pulse" />
                  <div className="h-4 bg-[rgba(255,255,255,0.05)] rounded-full w-2/3 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[#6b7a8d] font-mono text-center">Analyzing with Gemini 1.5 Pro...</p>
                  <div className="h-1 bg-[rgba(0,229,160,0.1)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00e5a0] rounded-full animate-[slide_1.5s_ease-in-out_infinite]" />
                  </div>
                </div>
              </div>
            ) : result ? (
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-lg text-[#e8edf3] capitalize">{selectedFeature} Analysis</h3>
                  <span className="text-[10px] uppercase tracking-widest text-[#00e5a0] bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.15)] px-2 py-1 rounded-full font-mono">
                    ✓ Complete
                  </span>
                </div>
                <div className="relative flex-1 overflow-y-auto max-h-96 pr-2 custom-scrollbar">
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(result)
                      setCopied(true)
                      window.setTimeout(() => setCopied(false), 2000)
                    }}
                    className="absolute right-0 top-0 font-mono text-xs text-[#6b7a8d] hover:text-[#e8edf3] transition px-2 py-1 rounded-md border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <p className="whitespace-pre-wrap font-mono text-sm text-[#e8edf3]/90 leading-relaxed">
                    {result}
                  </p>
                </div>
                {!isSignedIn && (
                  <Link href="/sign-up" className="mt-6">
                    <button className="w-full bg-[#00e5a0] text-black font-mono font-medium py-3 rounded-lg hover:bg-[#00ffb3] transition duration-200">
                      🚀 Get Full Access — Sign Up Free
                    </button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                <span className="text-6xl">🧠</span>
                <div>
                  <p className="font-display font-bold text-lg text-[#e8edf3]">Your analysis will appear here</p>
                  <p className="text-xs text-[#6b7a8d] font-mono">Powered by Gemini 1.5 Pro</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Demo Banner */}
        {!isSignedIn && (
          <div className="bg-[rgba(0,229,160,0.05)] border border-[rgba(0,229,160,0.1)] rounded-xl p-6 mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-[#e8edf3]/80 font-mono leading-relaxed">
              ⚡ <span className="text-[#00e5a0] font-bold">Demo Mode</span> — Using AI simulation. Sign up to analyze your actual repositories with full RAG pipeline and real-time codebase indexing.
            </p>
            <Link href="/sign-up">
              <Button variant="outline" size="sm" className="whitespace-nowrap border-[#00e5a0] text-[#00e5a0] hover:bg-[#00e5a0] hover:text-black">
                Get Full Access →
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
