import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-[3px] text-[#00e5a0] uppercase font-mono mb-3 block">ABOUT US</span>
          <h1 className="font-display font-bold text-5xl mb-6 text-[#e8edf3]">Our Mission</h1>
          <p className="text-[#6b7a8d] text-lg font-mono max-w-2xl mx-auto leading-relaxed">
            We&apos;re building the most advanced AI platform for codebase intelligence, helping developers understand complex systems in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <div className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8">
            <h2 className="font-display font-bold text-2xl mb-4 text-[#00e5a0]">The Problem</h2>
            <p className="text-[#6b7a8d] font-mono leading-relaxed text-sm">
              As codebases grow, understanding them becomes exponentially harder. New developers spend weeks just on boarding, and even experienced ones struggle to keep up with architecture changes across thousands of files.
            </p>
          </div>
          <div className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8">
            <h2 className="font-display font-bold text-2xl mb-4 text-[#00aaff]">The Solution</h2>
            <p className="text-[#6b7a8d] font-mono leading-relaxed text-sm">
              CodeSense AI uses Retrieval-Augmented Generation (RAG) to bridge the gap. By indexing your entire repository and using Gemini 1.5 Pro&apos;s massive context window, we provide answers that are accurate, contextual, and actionable.
            </p>
          </div>
        </div>

        <div className="space-y-12 font-mono text-[#e8edf3]/80">
          <section>
            <h2 className="font-display font-bold text-2xl mb-4 text-[#e8edf3]">Why CodeSense AI?</h2>
            <p className="leading-relaxed mb-6">
              Unlike traditional documentation which is often outdated the moment it&apos;s written, CodeSense AI is always in sync with your latest commit. We don&apos;t just search for text; we understand the semantics of your code.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="flex gap-3 text-sm">
                <span className="text-[#00e5a0]">✔</span> Built for Next.js 15 & Modern Web
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-[#00e5a0]">✔</span> Powered by Google Gemini 1.5 Pro
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-[#00e5a0]">✔</span> Fast, Vector-Based Search
              </li>
              <li className="flex gap-3 text-sm">
                <span className="text-[#00e5a0]">✔</span> Privacy-First Architecture
              </li>
            </ul>
          </section>

          <section className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-10 text-center">
            <h2 className="font-display font-bold text-3xl mb-6 text-[#e8edf3]">Join the Future of Development</h2>
            <p className="text-[#6b7a8d] mb-8 max-w-lg mx-auto">
              Stop guessing and start understanding. Analyze your first repository today.
            </p>
            <Link href="/sign-up">
              <button className="bg-[#00e5a0] text-black font-mono font-medium px-10 py-3 rounded-lg hover:bg-[#00ffb3] transition-all duration-200">
                Get Started for Free
              </button>
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
