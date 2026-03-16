'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useUser } from '@clerk/nextjs'
import { Activity, BookOpen, GitPullRequest, MessageSquare } from 'lucide-react'

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

function formatDate(value: Repo['createdAt']) {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

function simpleMarkdownToHtml(md: string) {
  // Minimal formatting: escape, then handle headings/bold/inline code, and newlines.
  const escape = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')

  let html = escape(md)

  html = html.replace(/^###\s(.+)$/gm, '<h3 class="font-display text-lg mt-6 mb-2">$1</h3>')
  html = html.replace(/^##\s(.+)$/gm, '<h2 class="font-display text-xl mt-8 mb-3">$1</h2>')
  html = html.replace(/^#\s(.+)$/gm, '<h1 class="font-display text-2xl mt-10 mb-4">$1</h1>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] font-mono text-[12px]">$1</code>')

  // Lists (very basic)
  html = html.replace(/^\s*-\s(.+)$/gm, '<li class="ml-5 list-disc">$1</li>')
  html = html.replace(/(<li[\s\S]*?<\/li>\n?)+/g, (m) => `<ul class="space-y-1 my-3">${m}</ul>`)

  // Paragraphs/newlines
  html = html
    .split(/\n{2,}/)
    .map(block => {
      if (block.trim().startsWith('<h') || block.trim().startsWith('<ul')) return block
      return `<p class="text-sm leading-7">${block.replace(/\n/g, '<br/>')}</p>`
    })
    .join('\n')

  return html
}

export default function RepoOverviewPage({
  params,
}: {
  params: { repoId: string }
}) {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [repo, setRepo] = useState<Repo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [onboardingLoading, setOnboardingLoading] = useState(false)
  const [onboarding, setOnboarding] = useState<string | null>(null)

  const canInteract = isLoaded && isSignedIn

  const fetchRepo = useCallback(async () => {
    if (!canInteract) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/repos/${params.repoId}`)
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || `Failed to fetch repo (${res.status})`)
      }
      const data = (await res.json()) as { repo: Repo }
      setRepo(data.repo)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch repo'
      setError(msg)
      setRepo(null)
    } finally {
      setLoading(false)
    }
  }, [canInteract, params.repoId])

  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }
    void fetchRepo()
  }, [fetchRepo, isLoaded, isSignedIn, router])

  const language = repo?.language || '—'
  const indexed = useMemo(() => (repo?.isIndexed ?? 0) === 1, [repo?.isIndexed])

  const generateOnboarding = useCallback(async () => {
    if (!repo?.repoUrl || onboardingLoading) return
    setOnboardingLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feature: 'onboarding',
          repoUrl: repo.repoUrl,
          userInput: '',
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || `Failed to generate onboarding (${res.status})`)
      }
      const data = (await res.json()) as { result: string }
      setOnboarding(data.result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate onboarding'
      setError(msg)
    } finally {
      setOnboardingLoading(false)
    }
  }, [onboardingLoading, repo?.repoUrl])

  const cards = [
    {
      title: 'Chat with Codebase',
      description: 'Ask questions and get grounded answers from indexed code.',
      href: `/repo/${params.repoId}/chat`,
      Icon: MessageSquare,
      color: '#00aaff',
    },
    {
      title: 'PR Code Review',
      description: 'Paste diffs or snippets and get senior-level feedback.',
      href: `/repo/${params.repoId}/review`,
      Icon: GitPullRequest,
      color: '#00e5a0',
    },
    {
      title: 'Code Health',
      description: 'Get a health score with actionable refactor suggestions.',
      href: `/repo/${params.repoId}/health`,
      Icon: Activity,
      color: '#a855f7',
    },
    {
      title: 'Onboarding Guide',
      description: 'Generate a practical guide to ramp up quickly.',
      href: '',
      Icon: BookOpen,
      color: '#f97316',
      onClick: () => void generateOnboarding(),
    },
  ] as const

  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />

      <main className="pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="font-mono text-sm px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] hover:text-white hover:border-[rgba(255,255,255,0.18)] transition"
          >
            ← Back to Dashboard
          </button>

          <div className="mt-6 rounded-3xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-7">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-7 w-1/2 bg-[rgba(255,255,255,0.07)] rounded" />
                <div className="mt-4 h-4 w-2/3 bg-[rgba(255,255,255,0.07)] rounded" />
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.06)]" />
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="font-mono text-sm text-[#6b7a8d]">{error}</div>
            ) : repo ? (
              <>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="min-w-0">
                    <h1 className="font-display font-bold text-3xl md:text-4xl truncate">
                      {repo.repoName}
                    </h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="font-mono text-xs text-[#6b7a8d]">
                        {repo.owner}
                      </span>
                      <span className="font-mono text-[10px] tracking-[1.6px] uppercase px-2.5 py-1 rounded-full border border-[rgba(0,170,255,0.25)] bg-[rgba(0,170,255,0.08)] text-[#00aaff]">
                        {language}
                      </span>
                      <span
                        className={[
                          'font-mono text-[10px] tracking-[1.6px] uppercase px-2.5 py-1 rounded-full border',
                          indexed
                            ? 'border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.08)] text-[#00e5a0]'
                            : 'border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-[#6b7a8d]',
                        ].join(' ')}
                      >
                        {indexed ? 'Indexed' : 'Not indexed'}
                      </span>
                    </div>

                    {repo.description && (
                      <p className="mt-4 font-mono text-sm text-[#6b7a8d] leading-7 max-w-3xl">
                        {repo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={repo.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-sm px-4 py-3 rounded-xl border border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.08)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.12)] transition"
                    >
                      Open on GitHub
                    </a>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4">
                    <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#6b7a8d]">Files</div>
                    <div className="mt-1 font-mono text-lg tabular-nums">{repo.totalFiles ?? 0}</div>
                  </div>
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4">
                    <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#6b7a8d]">Indexed date</div>
                    <div className="mt-1 font-mono text-sm">{formatDate(repo.createdAt)}</div>
                  </div>
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4">
                    <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#6b7a8d]">Language</div>
                    <div className="mt-1 font-mono text-sm">{language}</div>
                  </div>
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4">
                    <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#6b7a8d]">Repo ID</div>
                    <div className="mt-1 font-mono text-[12px] truncate">{repo.id}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="font-mono text-sm text-[#6b7a8d]">Repo not found.</div>
            )}
          </div>

          {/* Feature cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
            {cards.map((c) => {
              const Icon = c.Icon
              const clickable = Boolean(c.href) || Boolean((c as any).onClick)
              const onClick = (c as any).onClick as undefined | (() => void)

              return (
                <button
                  key={c.title}
                  onClick={() => {
                    if (onClick) return onClick()
                    if (c.href) router.push(c.href)
                  }}
                  disabled={!repo || loading || Boolean(error) || !clickable}
                  className="text-left rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-6 hover:border-[rgba(255,255,255,0.14)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-display font-semibold text-lg">{c.title}</div>
                      <div className="mt-1 font-mono text-sm text-[#6b7a8d] leading-6">
                        {c.description}
                      </div>
                    </div>
                    <div className="shrink-0 h-11 w-11 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] flex items-center justify-center">
                      <Icon size={20} style={{ color: c.color }} />
                    </div>
                  </div>
                  {c.title === 'Onboarding Guide' && (
                    <div className="mt-4 font-mono text-xs text-[#6b7a8d]">
                      {onboardingLoading ? 'Generating…' : onboarding ? 'Generated — scroll down to view.' : 'Click to generate.'}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Onboarding section */}
          <div className="mt-8">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display font-bold text-2xl">Onboarding Guide</h2>
              <button
                onClick={() => void generateOnboarding()}
                disabled={!repo || onboardingLoading}
                className="font-mono text-sm px-4 py-3 rounded-xl border border-[rgba(0,170,255,0.25)] bg-[rgba(0,170,255,0.08)] text-[#00aaff] hover:bg-[rgba(0,170,255,0.12)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {onboardingLoading ? 'Generating…' : 'Generate Onboarding Guide'}
              </button>
            </div>

            <div className="mt-4 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-6">
              {!onboarding ? (
                <div className="font-mono text-sm text-[#6b7a8d] leading-7">
                  Generate a repo-specific guide (setup, key files, first tasks) using the Demo engine.
                </div>
              ) : (
                <div
                  className="prose prose-invert max-w-none font-mono text-[#e8edf3]"
                  dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(onboarding) }}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
