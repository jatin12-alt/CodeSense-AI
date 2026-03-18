'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useUser } from '@clerk/nextjs'
import { Plus, Database } from 'lucide-react'
import { LoadingCard } from '@/components/LoadingSpinner'

// New components
import { RepoCard, type Repo } from '@/components/dashboard/RepoCard'
import { AddRepoModal } from '@/components/dashboard/AddRepoModal'
import { ProgressBar } from '@/components/dashboard/ProgressBar'

type IngestEvent = {
  progress: number
  message: string
  repoId?: string
  alreadyIndexed?: boolean
  error?: boolean
}

export default function DashboardPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()

  const [repos, setRepos] = useState<Repo[]>([])
  const [reposLoading, setReposLoading] = useState(false)
  const [reposError, setReposError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [repoUrl, setRepoUrl] = useState('')

  const [ingest, setIngest] = useState<{
    running: boolean
    progress: number
    message: string
    repoId?: string
  }>({ running: false, progress: 0, message: '' })

  const canInteract = isLoaded && isSignedIn

  const fetchRepos = useCallback(async () => {
    if (!canInteract) return
    setReposLoading(true)
    setReposError(null)
    try {
      const res = await fetch('/api/repos', { method: 'GET' })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || `Failed to fetch repos (${res.status})`)
      }
      const data = (await res.json()) as { repos: Repo[] }
      setRepos(data.repos || [])
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch repos'
      setReposError(msg)
    } finally {
      setReposLoading(false)
    }
  }, [canInteract])

  useEffect(() => {
    document.title = "Dashboard | CodeSense AI"
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }
    void fetchRepos()
  }, [fetchRepos, isLoaded, isSignedIn, router])

  const indexedCount = useMemo(() => repos.filter(r => (r.isIndexed ?? 0) === 1).length, [repos])

  const closeModal = useCallback(() => {
    if (ingest.running) return
    setIsModalOpen(false)
    setRepoUrl('')
  }, [ingest.running])

  const startIngest = useCallback(async () => {
    if (!repoUrl.trim() || ingest.running) return

    setIngest({ running: true, progress: 0, message: 'Starting...', repoId: undefined })
    setReposError(null)

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      })

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Ingest failed (${res.status})`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const line = part
            .split('\n')
            .map(l => l.trim())
            .find(l => l.startsWith('data:'))
          if (!line) continue

          const jsonStr = line.replace(/^data:\s*/, '')
          let evt: IngestEvent | null = null
          try {
            evt = JSON.parse(jsonStr) as IngestEvent
          } catch {
            evt = null
          }
          if (!evt) continue

          setIngest(prev => ({
            running: true,
            progress: typeof evt!.progress === 'number' ? evt!.progress : prev.progress,
            message: evt!.message || prev.message,
            repoId: evt!.repoId || prev.repoId,
          }))

          if (evt.error) {
            throw new Error(evt.message || 'Indexing failed')
          }

          if (evt.progress >= 100) {
            setIngest(prev => ({ ...prev, running: false }))
            closeModal()
            void fetchRepos()
            return
          }
        }
      }

      setIngest(prev => ({ ...prev, running: false }))
      void fetchRepos()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Indexing failed'
      setIngest({ running: false, progress: 0, message: '' })
      setReposError(msg)
    }
  }, [closeModal, fetchRepos, ingest.running, repoUrl])

  const deleteRepo = useCallback(async (id: string) => {
    if (!canInteract) return
    try {
      const res = await fetch(`/api/repos/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || `Delete failed (${res.status})`)
      }
      void fetchRepos()
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Delete failed'
      setReposError(msg)
    }
  }, [canInteract, fetchRepos])

  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 border border-[rgba(0,170,255,0.25)] text-[#00aaff] text-[10px] tracking-[2px] uppercase px-3 py-1.5 rounded-full bg-[rgba(0,170,255,0.06)] font-mono w-fit">
                YOUR WORKSPACE
              </div>
              <h1 className="font-display font-bold text-3xl md:text-4xl mt-4">
                {(() => {
                  const hour = new Date().getHours()
                  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
                  return `${greeting}, ${user?.firstName || 'Developer'}! 👋`
                })()}
              </h1>
              <p className="text-[#6b7a8d] font-mono text-sm mt-2">
                Track indexed repos and chat with their codebase.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 border border-[rgba(255,255,255,0.07)] bg-[#0f1520] rounded-xl px-4 py-3">
                <div className="w-2 h-2 rounded-full bg-[#00e5a0]" />
                <div className="font-mono text-xs text-[#6b7a8d]">
                  Indexed <span className="text-[#e8edf3]">{indexedCount}</span> / {repos.length}
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!canInteract || ingest.running}
                className="font-mono text-sm px-4 py-3 rounded-xl border border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.08)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.12)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add New Repo
              </button>
            </div>
          </div>

          {reposError && (
            <div className="mt-6 border border-[rgba(255,255,255,0.07)] bg-[rgba(255,0,80,0.06)] text-[#e8edf3] rounded-xl p-4">
              <div className="font-mono text-xs text-[rgba(232,237,243,0.9)]">
                {reposError}
              </div>
            </div>
          )}

          {/* Indexing status banner */}
          {ingest.running && (
            <ProgressBar progress={ingest.progress} message={ingest.message} />
          )}

          {/* Repo grid */}
          <div className="mt-8">
            {reposLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <LoadingCard />
                <LoadingCard />
                <LoadingCard />
              </div>
            ) : repos.length === 0 ? (
              <div className="relative overflow-hidden rounded-[2.5rem] border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-12 text-center group">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00e5a0]/10 blur-[100px] pointer-events-none" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl border border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.06)] text-[#00e5a0] mb-6">
                    <Database size={32} />
                  </div>
                  <h2 className="font-display font-bold text-3xl text-white">
                    Index your first repository
                  </h2>
                  <p className="font-mono text-sm text-[#6b7a8d] mt-4 max-w-lg mx-auto leading-relaxed">
                    Connect your GitHub codebase to unlock AI-powered chat, instant code reviews, and deep architecture insights.
                  </p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={!canInteract}
                    className="mt-10 inline-flex items-center gap-2 font-mono text-sm px-8 py-4 rounded-2xl border border-[#00e5a0]/30 bg-[#00e5a0]/10 text-[#00e5a0] hover:bg-[#00e5a0]/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    <Plus size={18} />
                    Add Your First Repo
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {repos.map((r) => (
                  <RepoCard 
                    key={r.id} 
                    repo={r} 
                    isIndexing={ingest.running && ingest.repoId === r.id} 
                    onDelete={deleteRepo} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal */}
      <AddRepoModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        repoUrl={repoUrl} 
        setRepoUrl={setRepoUrl} 
        onStartIndexing={startIngest}
        isIndexing={ingest.running}
        indexingMessage={ingest.message}
        indexingProgress={ingest.progress}
      />
    </div>
  )
}
