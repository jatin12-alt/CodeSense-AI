import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function FeaturesPage() {
  const features = [
    {
      icon: '💬',
      title: 'Chat With Codebase',
      tag: 'RAG POWERED',
      desc: 'Ask questions about any part of your repo. Get accurate answers backed by actual code context using RAG. Our AI understands the relationships between different modules and files, providing deep insights that go beyond simple text search.',
      bullets: [
        'Context-aware answers using RAG architecture',
        'Understand complex code relationships',
        'Support for 50+ programming languages',
        'Generate documentation and explanations on the fly',
        'Ask about architecture, logic, or specific functions'
      ]
    },
    {
      icon: '🔍',
      title: 'PR Review AI',
      tag: 'GEMINI PRO',
      desc: 'Paste your code or PR diff — get a senior developer review with specific improvement suggestions. Our AI identifies potential bugs, security risks, and performance bottlenecks before they hit production.',
      bullets: [
        'Automated code review for any PR',
        'Security vulnerability detection',
        'Performance optimization suggestions',
        'Best practices and style consistency checks',
        'Actionable feedback with code examples'
      ]
    },
    {
      icon: '🐛',
      title: 'Bug Detection',
      tag: 'SMART SCAN',
      desc: 'Automatically scan your codebase for bugs, security vulnerabilities, and code smells. CodeSense AI uses advanced static analysis patterns and LLM reasoning to find issues that traditional linters might miss.',
      bullets: [
        'Deep semantic bug hunting',
        'Identify memory leaks and race conditions',
        'Detect common security anti-patterns',
        'Reduce technical debt with refactoring tips',
        'Continuous codebase health monitoring'
      ]
    },
    {
      icon: '📋',
      title: 'Onboarding Guide',
      tag: 'AI GENERATED',
      desc: 'New to a codebase? Generate a complete onboarding document explaining architecture and key flows. Perfect for scaling teams and helping new developers become productive within hours instead of days.',
      bullets: [
        'Instant architecture overview generation',
        'Mapping of key data flows and entry points',
        'Automatically generated READMEs and guides',
        'Interactive Q&A for new team members',
        'Up-to-date documentation that evolves with your code'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[10px] tracking-[3px] text-[#00e5a0] uppercase font-mono mb-3 block">FEATURES</span>
          <h1 className="font-display font-bold text-5xl mb-6">Everything You Need to Ship Faster</h1>
          <p className="text-[#6b7a8d] text-lg font-mono max-w-2xl mx-auto leading-relaxed">
            Four powerful AI features designed specifically for developers who want to understand, review, and improve codebases faster.
          </p>
        </div>

        <div className="space-y-12">
          {features.map((feature, i) => (
            <div key={i} className="group relative bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-10 hover:border-[rgba(0,229,160,0.15)] transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00e5a0] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1">
                  <div className="text-4xl mb-6">{feature.icon}</div>
                  <h2 className="font-display font-bold text-3xl mb-4">{feature.title}</h2>
                  <p className="text-[#6b7a8d] font-mono leading-relaxed mb-6">
                    {feature.desc}
                  </p>
                  <span className="text-[10px] uppercase tracking-widest text-[#00e5a0] bg-[rgba(0,229,160,0.08)] border border-[rgba(0,229,160,0.15)] px-3 py-1 rounded-full font-mono">
                    {feature.tag}
                  </span>
                </div>
                
                <div className="flex-1 bg-[#080b10]/50 rounded-xl p-8 border border-[rgba(255,255,255,0.03)]">
                  <h3 className="text-xs uppercase tracking-widest text-[#6b7a8d] mb-4 font-mono">Capabilities</h3>
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet, j) => (
                      <li key={j} className="flex gap-3 text-sm font-mono text-[#e8edf3]/80">
                        <span className="text-[#00e5a0]">→</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-24 text-center">
          <Link href="/sign-up">
            <button className="bg-[#00e5a0] text-black font-mono font-medium px-10 py-4 rounded-lg hover:bg-[#00ffb3] hover:-translate-y-0.5 transition-all duration-200">
              Get Started Now →
            </button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
