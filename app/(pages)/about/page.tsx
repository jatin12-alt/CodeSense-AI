'use client'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Github, Linkedin, ExternalLink } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

export default function AboutPage() {
  const { isSignedIn } = useAuth()
  const otherProjects = [
    {
      title: "Scatch",
      tag: "E-Commerce · React · Supabase",
      desc: "A premium bags e-commerce platform built with React (Vite) and Supabase. Features authentication, dynamic product listing, and full backend integration.",
      link: "#"
    },
    {
      title: "PixelPureAI",
      tag: "AI Tool",
      desc: "An AI-powered image enhancement tool that upscales, denoises, and improves image quality using deep learning models.",
      link: "#"
    },
    {
      title: "EchoMind",
      tag: "AI · Interview Prep",
      desc: "An AI-driven interview preparation platform that generates personalized questions, evaluates answers, and tracks your progress.",
      link: "#"
    }
  ]

  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />
      
      <main className="pt-32 pb-24 px-6 space-y-32">
        {/* SECTION 1: HERO */}
        <section className="max-w-4xl mx-auto text-center space-y-6">
          <span className="text-[10px] tracking-[3px] text-[#00e5a0] uppercase font-mono bg-[rgba(0,229,160,0.05)] border border-[rgba(0,229,160,0.1)] px-4 py-2 rounded-full">
            ABOUT THE PROJECT
          </span>
          <h1 className="font-display font-bold text-5xl md:text-6xl leading-tight">
            Built by a Developer, <br />
            <span style={{ WebkitTextStroke: '1px rgba(255,255,255,0.25)', color: 'transparent' }}>For Developers</span>
          </h1>
          <p className="text-[#6b7a8d] text-lg font-mono max-w-2xl mx-auto leading-relaxed">
            CodeSense AI was born from a simple frustration — understanding a new codebase takes days. We built the tool we always wished existed.
          </p>
        </section>

        {/* SECTION 2: THE DEVELOPER */}
        <section className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] tracking-[3px] text-[#6b7a8d] uppercase font-mono">THE DEVELOPER</span>
          </div>
          
          <div className="max-w-2xl mx-auto bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-2xl p-8 space-y-8">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-24 h-24 rounded-full flex items-center justify-center font-display font-bold text-3xl text-black bg-gradient-to-br from-[#00e5a0] to-[#00aaff] shrink-0">
                JD
              </div>
              <div className="space-y-2">
                <h2 className="font-display font-bold text-3xl">Jatin Dongre</h2>
                <p className="text-[#00e5a0] text-sm font-mono uppercase tracking-wider">Full Stack Developer & AI Enthusiast</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                  {["B.Tech — AI & ML", "Pre-Final Year", "Full Stack Developer"].map((tag) => (
                    <span key={tag} className="border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] text-[9px] uppercase tracking-widest px-3 py-1 rounded-full font-mono">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(255,255,255,0.07)] pt-8">
              <p className="text-[#6b7a8d] text-sm font-mono leading-relaxed">
                I&apos;m a Full Stack Developer specializing in the MERN stack and AI/ML integration. Currently in my pre-final year of B.Tech in Artificial Intelligence and Machine Learning, I build scalable web applications that solve real-world problems. CodeSense AI is my attempt to bridge robust web architecture with intelligent AI features — making developer workflows faster and smarter.
              </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-4 justify-center md:justify-start">
              <a href="https://www.linkedin.com/in/jatin-dongre-6a13a3294" target="_blank" rel="noopener noreferrer" className="text-[#6b7a8d] hover:text-[#00aaff] text-sm flex items-center gap-2 transition font-mono">
                <Linkedin size={16} /> Jatin Dongre
              </a>
              <a href="https://github.com/jatin12-alt" target="_blank" rel="noopener noreferrer" className="text-[#6b7a8d] hover:text-white text-sm flex items-center gap-2 transition font-mono">
                <Github size={16} /> jatin12-alt
              </a>
              <a href="https://github.com/jatin12-alt/CodeSense-AI.git" target="_blank" rel="noopener noreferrer" className="text-[#6b7a8d] hover:text-[#00e5a0] text-sm flex items-center gap-2 transition font-mono">
                <ExternalLink size={16} /> CodeSense AI Repo
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 3: THE PROJECT */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[3px] text-[#6b7a8d] uppercase font-mono">THE PROJECT</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-8 space-y-4">
              <span className="text-2xl">💡</span>
              <h3 className="font-display font-bold text-xl">The Problem</h3>
              <p className="text-[#6b7a8d] font-mono text-xs leading-relaxed">
                Understanding a new GitHub codebase can take days. Existing tools don&apos;t give you a conversational interface to ask questions about the code.
              </p>
            </div>
            
            <div className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-8 space-y-4">
              <span className="text-2xl">🛠️</span>
              <h3 className="font-display font-bold text-xl">The Solution</h3>
              <p className="text-[#6b7a8d] font-mono text-xs leading-relaxed">
                CodeSense AI uses RAG (Retrieval Augmented Generation) to index your entire repo, then lets you chat, review, and analyze using Gemini 1.5 Pro.
              </p>
            </div>

            <div className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-8 space-y-4">
              <span className="text-2xl">🚀</span>
              <h3 className="font-display font-bold text-xl">The Stack</h3>
              <div className="flex flex-wrap gap-2">
                {["Next.js 15", "Clerk", "Neon DB", "pgvector", "Gemini 1.5 Pro", "GitHub API", "Vercel", "Drizzle ORM"].map((tech) => (
                  <span key={tech} className="bg-[rgba(0,229,160,0.05)] border border-[rgba(0,229,160,0.1)] text-[#00e5a0] text-[9px] uppercase tracking-widest px-2 py-1 rounded font-mono">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: OTHER PROJECTS */}
        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-[10px] tracking-[3px] text-[#6b7a8d] uppercase font-mono">OTHER PROJECTS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherProjects.map((project, i) => (
              <div key={i} className="bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-xl p-8 space-y-4 hover:border-[rgba(0,229,160,0.2)] transition-colors group">
                <h3 className="font-display font-bold text-xl group-hover:text-[#00e5a0] transition-colors">{project.title}</h3>
                <span className="text-[9px] text-[#00e5a0] font-mono uppercase tracking-widest block">{project.tag}</span>
                <p className="text-[#6b7a8d] font-mono text-xs leading-relaxed">
                  {project.desc}
                </p>
                <Link href={project.link} className="inline-block text-[10px] text-[#e8edf3] hover:text-[#00e5a0] font-mono uppercase tracking-widest transition-colors pt-4 border-b border-transparent hover:border-[#00e5a0]">
                  View Project →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: CTA */}
        <section className="max-w-3xl mx-auto text-center py-20 bg-[#0f1520] border border-[rgba(255,255,255,0.07)] rounded-3xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00e5a0] to-transparent" />
          <h2 className="font-display font-bold text-4xl">Want to Collaborate?</h2>
          <p className="text-[#6b7a8d] font-mono text-base max-w-md mx-auto">
            I&apos;m always open to interesting projects and opportunities. Let&apos;s build something amazing together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <a href="https://www.linkedin.com/in/jatin-dongre-6a13a3294" target="_blank" rel="noopener noreferrer">
              <button className="bg-[#00e5a0] text-black font-mono font-medium px-8 py-3 rounded-lg hover:bg-[#00ffb3] transition duration-200">
                View LinkedIn →
              </button>
            </a>
            <a href="https://github.com/jatin12-alt" target="_blank" rel="noopener noreferrer">
              <button className="border border-[rgba(255,255,255,0.1)] text-[#6b7a8d] hover:text-white hover:border-white font-mono px-8 py-3 rounded-lg transition duration-200">
                View GitHub →
              </button>
            </a>
            <Link href={isSignedIn ? "/dashboard" : "/sign-up"}>
              <button className="text-[#6b7a8d] hover:text-white font-mono text-sm px-6 py-2 transition underline underline-offset-4">
                {isSignedIn ? "Go to Dashboard →" : "Try CodeSense AI →"}
              </button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
