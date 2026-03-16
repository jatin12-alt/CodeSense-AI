import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function HowItWorksPage() {
  const steps = [
    {
      num: '01',
      title: 'Paste Repo URL',
      desc: 'Drop any public GitHub repository URL. Our system instantly validates the repository and prepares for ingestion.',
      detail: 'GitHub API + Octokit fetches repository metadata and complete file tree'
    },
    {
      num: '02',
      title: 'AI Indexes Codebase',
      desc: 'We scan your codebase, split it into meaningful chunks, and generate high-dimensional embeddings for each part.',
      detail: 'Google text-embedding-004 converts each code chunk into a 768-dimension vector, stored in pgvector (Neon DB) with HNSW indexing for fast similarity search'
    },
    {
      num: '03',
      title: 'Chat & Analyze',
      desc: 'Ask complex questions, get code reviews, or generate documentation. The AI uses your specific code as context.',
      detail: 'RAG retrieves top 8 most relevant code chunks via cosine similarity search. Gemini 1.5 Pro generates accurate responses with full code context'
    }
  ]

  const techStack = [
    "Next.js 15", "Clerk", "Neon DB", "pgvector", 
    "Google Gemini 1.5 Pro", "GitHub API", "Vercel"
  ]

  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <span className="text-[10px] tracking-[3px] text-[#00e5a0] uppercase font-mono mb-3 block">HOW IT WORKS</span>
          <h1 className="font-display font-bold text-5xl mb-6">From GitHub URL to AI Insights</h1>
          <p className="text-[#6b7a8d] text-lg font-mono max-w-2xl mx-auto leading-relaxed">
            CodeSense AI combines Retrieval-Augmented Generation (RAG) with the power of Gemini 1.5 Pro to provide deep codebase understanding.
          </p>
        </div>

        <div className="space-y-20">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-12 items-start">
              <div className="md:w-1/3">
                <span className="font-display text-8xl text-[#00e5a0] opacity-10 leading-none block mb-4">
                  {step.num}
                </span>
                <h2 className="font-display font-bold text-3xl text-[#e8edf3] mb-4">
                  {step.title}
                </h2>
              </div>
              <div className="md:w-2/3 space-y-6">
                <p className="text-lg text-[#e8edf3]/80 font-mono leading-relaxed">
                  {step.desc}
                </p>
                <div className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-6">
                  <h3 className="text-[10px] uppercase tracking-[2px] text-[#00e5a0] mb-3 font-mono">Technical Detail</h3>
                  <p className="text-xs text-[#6b7a8d] font-mono leading-relaxed">
                    {step.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack Section */}
        <div className="mt-32 pt-20 border-t border-[rgba(255,255,255,0.07)] text-center">
          <h2 className="font-display font-bold text-3xl mb-10">Under The Hood</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] text-[#e8edf3]/70 text-[10px] uppercase tracking-widest px-4 py-2 rounded-full font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
