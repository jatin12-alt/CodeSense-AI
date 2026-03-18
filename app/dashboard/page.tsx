'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useUser } from '@clerk/nextjs'
import { Plus, Database, Trash2 } from 'lucide-react'

type Repo = {
  id: string
  repoUrl: string
  repoName: string
  owner: string
  description: string | null
  language: string | null
  isIndexed: number | null
  totalFiles: number | null
  createdAt: string | Date | null
}

type IngestEvent = {
  progress: number
  message: string
  repoId?: string
  alreadyIndexed?: boolean
  error?: boolean
}

function formatDate(value: Repo['createdAt']) {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

export default function DashboardPage() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

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
                Dashboard
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
            <div className="mt-6 border border-[rgba(255,255,255,0.07)] bg-[#0f1520] rounded-2xl p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-display font-semibold">Indexing in progress</div>
                  <div className="font-mono text-xs text-[#6b7a8d] mt-1">{ingest.message}</div>
                </div>
                <div className="font-mono text-sm text-[#00e5a0] tabular-nums">{Math.max(0, Math.min(100, ingest.progress))}%</div>
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#00e5a0] transition-[width] duration-300 ease-out"
                  style={{ width: `${Math.max(0, Math.min(100, ingest.progress))}%` }}
                />
              </div>
              <div className="mt-2 h-[1px] w-full bg-[rgba(255,255,255,0.05)]" />
              <div className="mt-2 font-mono text-[11px] text-[#6b7a8d]">
                Tip: larger repos can take a few minutes — keep this tab open.
              </div>
            </div>
          )}

          {/* Repo grid */}
          <div className="mt-8">
            {reposLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-6 animate-pulse"
                  >
                    <div className="flex items-start justify-between">
                      <div className="h-5 w-1/2 bg-[rgba(255,255,255,0.05)] rounded-lg" />
                      <div className="h-6 w-16 bg-[rgba(255,255,255,0.05)] rounded-full" />
                    </div>
                    <div className="h-3 w-1/3 bg-[rgba(255,255,255,0.03)] rounded-md mt-3" />
                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <div className="h-10 bg-[rgba(255,255,255,0.03)] rounded-xl" />
                      <div className="h-10 bg-[rgba(255,255,255,0.03)] rounded-xl" />
                    </div>
                    <div className="h-3 w-2/3 bg-[rgba(255,255,255,0.03)] rounded-md mt-6" />
                  </div>
                ))}
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
                {repos.map((r) => {
                  const indexed = (r.isIndexed ?? 0) === 1
                  const indexing = !indexed && ingest.running && ingest.repoId === r.id
                  return (
                    <div
                      key={r.id}
                      className="group rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-5 hover:border-[rgba(0,229,160,0.25)] transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <button
                          onClick={() => router.push(`/repo/${r.id}`)}
                          className="text-left"
                        >
                          <div className="font-display font-semibold text-lg leading-tight text-[#e8edf3] group-hover:text-white transition">
                            {r.repoName}
                          </div>
                          <div className="font-mono text-xs text-[#6b7a8d] mt-1">
                            {r.owner}
                          </div>
                        </button>

                        <div className="flex items-center gap-2">
                          <span
                            className={[
                              'font-mono text-[10px] tracking-[1.6px] uppercase px-2.5 py-1 rounded-full border',
                              indexed
                                ? 'border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.08)] text-[#00e5a0]'
                                : indexing
                                  ? 'border-[rgba(0,170,255,0.25)] bg-[rgba(0,170,255,0.08)] text-[#00aaff]'
                                  : 'border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-[#6b7a8d]',
                            ].join(' ')}
                          >
                            {indexed ? 'Indexed' : 'Indexing'}
                          </span>

                          <button
                            onClick={() => void deleteRepo(r.id)}
                            className="p-2 rounded-lg border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] hover:text-[#ff4d4d] hover:border-[#ff4d4d]/30 hover:bg-[#ff4d4d]/5 transition"
                            title="Delete repo"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-3">
                          <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#6b7a8d]">
                            Language
                          </div>
                          <div className="mt-1 font-mono text-sm text-[#e8edf3]">
                            {r.language || '—'}
                          </div>
                        </div>
                        <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-3">
                          <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#6b7a8d]">
                            Files
                          </div>
                          <div className="mt-1 font-mono text-sm text-[#e8edf3] tabular-nums">
                            {r.totalFiles ?? 0}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="font-mono text-xs text-[#6b7a8d] truncate">
                          {r.repoUrl}
                        </div>
                        <div className="font-mono text-xs text-[#6b7a8d] whitespace-nowrap">
                          {formatDate(r.createdAt)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
        >
          <button
            className="absolute inset-0 bg-[rgba(0,0,0,0.6)]"
            onClick={closeModal}
            aria-label="Close modal"
          />

          <div className="relative w-full max-w-xl rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display font-bold text-xl">Add a GitHub repository</div>
                <div className="font-mono text-xs text-[#6b7a8d] mt-1">
                  We&apos;ll fetch code files, chunk them, and store embeddings for fast RAG.
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={ingest.running}
                className="font-mono text-xs px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>
            </div>

            <div className="mt-5">
              <label className="block font-mono text-[10px] tracking-[2px] uppercase text-[#6b7a8d]">
                GitHub URL
              </label>
              <input
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/vercel/next.js"
                disabled={ingest.running}
                className="mt-2 w-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#080b10] px-4 py-3 font-mono text-sm text-[#e8edf3] placeholder:text-[rgba(107,122,141,0.85)] outline-none focus:border-[rgba(0,229,160,0.35)]"
              />
            </div>

            {ingest.running && (
              <div className="mt-5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-mono text-xs text-[#6b7a8d]">{ingest.message}</div>
                  <div className="font-mono text-sm text-[#00e5a0] tabular-nums">
                    {Math.max(0, Math.min(100, ingest.progress))}%
                  </div>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00e5a0] transition-[width] duration-300 ease-out"
                    style={{ width: `${Math.max(0, Math.min(100, ingest.progress))}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={closeModal}
                disabled={ingest.running}
                className="font-mono text-sm px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] hover:text-white hover:border-[rgba(255,255,255,0.18)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => void startIngest()}
                disabled={!repoUrl.trim() || ingest.running}
                className="font-mono text-sm px-4 py-3 rounded-xl border border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.08)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.12)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Start indexing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
