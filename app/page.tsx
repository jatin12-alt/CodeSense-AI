'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function HomePage() {
  const { isSignedIn } = useAuth()
  const ctaHref = isSignedIn ? '/dashboard' : '/sign-up'

  useEffect(() => {
    console.log('CodeSense AI Landing Page Loaded')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll('.fade-up')
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-[#080b10] text-[#e8edf3] font-mono selection:bg-[#00e5a0]/30">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative overflow-hidden">
          {/* Background effects */}
          <div
            className="absolute inset-0 z-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,229,160,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.03) 1px, transparent 1px)',
              backgroundSize: '48px 48px'
            }}
          />

          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,229,160,0.08) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          />

          <div
            className="absolute w-[300px] h-[300px] rounded-full blur-[100px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(0,170,255,0.06) 0%, transparent 70%)',
              top: '25%',
              right: '25%'
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto">
            <div
              className="fade-up inline-flex items-center gap-2 border border-[rgba(0,229,160,0.2)] text-[#00e5a0] text-[10px] tracking-[2px] uppercase px-4 py-2 rounded-full bg-[rgba(0,229,160,0.05)] mb-8"
              style={{ animationDelay: '0s' }}
            >
              <span className="w-1.5 h-1.5 bg-[#00e5a0] rounded-full animate-pulse" />
              v1.0 BETA
            </div>

            <h1 className="fade-up font-display font-extrabold tracking-tight leading-[1.05] mb-6" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)' }}>
              <span className="text-[#e8edf3] block">Understand Any</span>
              <span
                className="block"
                style={{
                  WebkitTextStroke: '1px rgba(255,255,255,0.25)',
                  color: 'transparent'
                }}
              >
                Codebase Instantly
              </span>
            </h1>

            <p className="fade-up max-w-lg mx-auto text-[#6b7a8d] text-sm leading-relaxed font-mono mb-10">
              Paste a GitHub repo URL — CodeSense AI reads every file, understands the architecture, and lets you chat with your codebase like a senior developer.
            </p>

            <div className="fade-up flex gap-4 justify-center flex-wrap">
              <Link
                href={ctaHref}
                className="bg-[#00e5a0] text-black font-mono font-medium px-8 py-3 rounded-lg hover:bg-[#00ffb3] hover:-translate-y-0.5 transition-all duration-200 shadow-[0_0_0_0_rgba(0,229,160,0)] hover:shadow-[0_12px_40px_rgba(0,229,160,0.25)]"
              >
                Analyze a Repo →
              </Link>
              {!isSignedIn && (
                <Link
                  href="/sign-in"
                  className="bg-transparent border border-[rgba(255,255,255,0.1)] text-[#e8edf3] font-mono font-medium px-8 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-all duration-200"
                >
                  Sign In
                </Link>
              )}
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-[#6b7a8d] hover:text-white font-mono text-sm transition"
              >
                See How It Works ↓
              </button>
            </div>
          </div>
        </section>

        {/* STATS BAR */}
        <section className="fade-up w-full bg-[#0f1520] border-y border-[rgba(255,255,255,0.07)] py-0">
          <div className="max-w-4xl mx-auto flex divide-x divide-[rgba(255,255,255,0.07)]">
            {[
              { num: '50+', label: 'Supported Languages' },
              { num: '10x', label: 'Faster Code Understanding' },
              { num: '4', label: 'AI Powered Features' }
            ].map((stat, i) => (
              <div key={i} className="flex-1 text-center py-8 px-4">
                <span className="font-display font-bold text-3xl text-[#00e5a0] block">{stat.num}</span>
                <span className="text-[10px] uppercase tracking-widest text-[#6b7a8d] mt-1 block font-mono">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="fade-up py-24 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[3px] text-[#00e5a0] uppercase font-mono mb-3 block">PROCESS</span>
            <h2 className="font-display font-bold text-4xl text-[#e8edf3]">From URL to Insight in Seconds</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-[rgba(255,255,255,0.07)] rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.07)]">
            {[
              {
                num: '01',
                icon: '🔗',
                title: 'Paste Repo URL',
                desc: 'Drop any public GitHub repository URL — no setup, no config, no cloning required.'
              },
              {
                num: '02',
                icon: '⚡',
                title: 'AI Indexes Codebase',
                desc: 'Our RAG engine fetches every file, creates embeddings, and maps your entire architecture.'
              },
              {
                num: '03',
                icon: '🧠',
                title: 'Chat & Analyze',
                desc: 'Ask anything, get PR reviews, detect bugs, and generate onboarding guides instantly.'
              }
            ].map((card, i) => (
              <div key={i} className="bg-[#0f1520] p-10 hover:bg-[#121c2a] transition group">
                <span className="font-display text-6xl text-[#00e5a0] opacity-10 leading-none mb-4 block">{card.num}</span>
                <div className="text-2xl w-11 h-11 flex items-center justify-center bg-[rgba(0,229,160,0.1)] border border-[rgba(0,229,160,0.2)] rounded-xl mb-5 group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <h3 className="font-display font-bold text-lg mb-3 text-[#e8edf3]">{card.title}</h3>
                <p className="text-xs text-[#6b7a8d] leading-relaxed font-mono">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="fade-up py-24 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[3px] text-[#00e5a0] uppercase font-mono mb-3 block">FEATURES</span>
            <h2 className="font-display font-bold text-4xl text-[#e8edf3]">Everything a Developer Needs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: '💬',
                title: 'Chat With Codebase',
                desc: 'Ask questions about any part of your repo. Get accurate answers backed by actual code context using RAG.',
                tag: 'RAG POWERED'
              },
              {
                icon: '🔍',
                title: 'PR Review AI',
                desc: 'Paste your code or PR diff — get a senior developer review with specific improvement suggestions.',
                tag: 'GEMINI PRO'
              },
              {
                icon: '🐛',
                title: 'Bug Detection',
                desc: 'Automatically scan your codebase for bugs, security vulnerabilities, and code smells.',
                tag: 'SMART SCAN'
              },
              {
                icon: '📋',
                title: 'Onboarding Guide',
                desc: 'New to a codebase? Generate a complete onboarding document explaining architecture and key flows.',
                tag: 'AI GENERATED'
              }
            ].map((feature, i) => (
              <div key={i} className="group relative bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-8 hover:-translate-y-1 hover:border-[rgba(0,229,160,0.15)] transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00e5a0] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-display font-bold text-xl mb-3 text-[#e8edf3]">{feature.title}</h3>
                <p className="text-sm text-[#6b7a8d] leading-relaxed font-mono mb-4">{feature.desc}</p>
                <span className="text-[10px] uppercase tracking-widest text-[#00e5a0] bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.15)] px-2 py-1 rounded-full inline-block font-mono">
                  {feature.tag}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="fade-up py-24 px-6 text-center">
          <div className="max-w-2xl mx-auto bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-16 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at top, rgba(0,229,160,0.06), transparent)'
              }}
            />

            <h2 className="font-display text-3xl font-bold tracking-tight mb-4 text-[#e8edf3]">Ready to Understand Any Codebase?</h2>
            <p className="text-[#6b7a8d] text-sm max-w-md mx-auto mb-10 font-mono">
              Join developers who use CodeSense AI to onboard faster, review better, and ship with confidence.
            </p>

            <Link
              href={ctaHref}
              className="inline-block bg-[#00e5a0] text-black font-mono font-medium px-10 py-3 rounded-lg hover:bg-[#00ffb3] hover:-translate-y-0.5 transition-all duration-200"
            >
              Get Started →
            </Link>

            <p className="text-[10px] text-[#6b7a8d] mt-3 uppercase tracking-wider font-mono">
              No credit card required
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
