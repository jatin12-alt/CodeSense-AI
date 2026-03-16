import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-[10px] tracking-[3px] text-[#00e5a0] uppercase font-mono mb-3 block">DEMO</span>
          <h1 className="font-display font-bold text-5xl mb-6">See CodeSense AI in Action</h1>
          <p className="text-[#6b7a8d] text-lg font-mono max-w-2xl mx-auto leading-relaxed">
            Experience how CodeSense AI analyzes complex repositories and answers technical questions in real-time.
          </p>
        </div>

        <div className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-2 md:p-4 aspect-video relative overflow-hidden flex items-center justify-center">
          {/* Demo Placeholder / Video Embed */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00e5a0]/10 to-[#00aaff]/10 z-0" />
          <div className="relative z-10 text-center space-y-4">
            <div className="w-20 h-20 bg-[#00e5a0]/20 border border-[#00e5a0]/30 rounded-full flex items-center justify-center mx-auto cursor-pointer hover:scale-110 transition-transform">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[15px] border-l-[#00e5a0] border-b-[10px] border-b-transparent ml-1" />
            </div>
            <p className="font-mono text-sm text-[#e8edf3]">Click to Watch Product Demo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            {
              title: "Contextual Q&A",
              desc: "Ask about state management, routing, or database schema. CodeSense AI provides answers with file references."
            },
            {
              title: "Smart PR Reviews",
              desc: "Watch the AI review a complex pull request, identifying logic errors and performance issues instantly."
            },
            {
              title: "Repository Health",
              desc: "See a complete visualization of codebase quality, complexity, and documentation coverage."
            }
          ].map((item, i) => (
            <div key={i} className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-8 hover:border-[rgba(0,229,160,0.2)] transition-colors">
              <h3 className="font-display font-bold text-xl mb-3 text-[#e8edf3]">{item.title}</h3>
              <p className="text-[#6b7a8d] font-mono text-xs leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Link href="/sign-up">
            <button className="bg-[#00e5a0] text-black font-mono font-medium px-10 py-3 rounded-lg hover:bg-[#00ffb3] transition-all duration-200">
              Try It on Your Own Codebase →
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
