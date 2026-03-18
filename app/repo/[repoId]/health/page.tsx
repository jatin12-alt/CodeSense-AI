 'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

type Repo = {
  id: string
  repoName: string
  repoUrl: string
}

type HealthSuggestion = {
  type: string
  message: string
  severity: string
}

type HealthReport = {
  overallScore: number
  complexityScore: number
  documentationScore: number
  duplicateScore: number
  bugRiskScore: number
  suggestions: HealthSuggestion[]
}

function clampScore(v: number) {
  if (!Number.isFinite(v)) return 0
  return Math.max(0, Math.min(100, Math.round(v)))
}

function scoreColor(score: number) {
  const s = clampScore(score)
  if (s >= 80) return '#00e5a0'
  if (s >= 50) return '#f59e0b'
  return '#ef4444'
}

function badgeForType(type: string) {
  const t = (type || '').toLowerCase()
  if (t === 'bug') return { label: 'BUG', bg: 'bg-[rgba(239,68,68,0.12)]', border: 'border-[rgba(239,68,68,0.35)]', text: 'text-[#ef4444]' }
  if (t === 'security')
    return { label: 'SECURITY', bg: 'bg-[rgba(245,158,11,0.12)]', border: 'border-[rgba(245,158,11,0.35)]', text: 'text-[#f59e0b]' }
  if (t === 'performance')
    return { label: 'PERF', bg: 'bg-[rgba(0,170,255,0.12)]', border: 'border-[rgba(0,170,255,0.35)]', text: 'text-[#00aaff]' }
  if (t === 'style')
    return { label: 'STYLE', bg: 'bg-[rgba(168,85,247,0.14)]', border: 'border-[rgba(168,85,247,0.35)]', text: 'text-[#a855f7]' }
  if (t === 'documentation')
    return { label: 'DOCS', bg: 'bg-[rgba(0,229,160,0.10)]', border: 'border-[rgba(0,229,160,0.35)]', text: 'text-[#00e5a0]' }
  return { label: (type || 'INFO').toUpperCase(), bg: 'bg-[rgba(255,255,255,0.06)]', border: 'border-[rgba(255,255,255,0.10)]', text: 'text-[#e8edf3]' }
}

function ProgressRing({
  value,
  label,
}: {
  value: number
  label: string
}) {
  const v = clampScore(value)
  const color = scoreColor(v)
  const textClass = v >= 80 ? 'text-[#00e5a0]' : v >= 50 ? 'text-[#f59e0b]' : 'text-[#ef4444]'
  const size = 86
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - v / 100)

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <svg width={size} height={size} className="block">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${c} ${c}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="font-display font-bold text-lg leading-none" aria-label={`${label} score`}>
              <span className={textClass}>{v}</span>
            </div>
            <div className="font-mono text-[10px] text-[#6b7a8d] mt-0.5">/100</div>
          </div>
        </div>
      </div>

      <div className="min-w-0">
        <div className="font-display font-semibold text-sm text-[#e8edf3]">{label}</div>
        <div className="font-mono text-[11px] text-[#6b7a8d] mt-1">
          {v >= 80 ? 'Healthy' : v >= 50 ? 'Needs attention' : 'High risk'}
        </div>
      </div>
    </div>
  )
}

export default function RepoHealthPage() {
  const params = useParams()
  const repoId = params.repoId as string

  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  const [repo, setRepo] = useState<Repo | null>(null)
  const [report, setReport] = useState<HealthReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canInteract = isLoaded && isSignedIn
  const repoName = repo?.repoName || 'this repository'

  useEffect(() => {
    document.title = "Health | CodeSense AI"
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in')
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!canInteract || !repoId) return
    let cancelled = false

    const load = async () => {
      setError(null)
      setLoading(true)
      try {
        const [repoRes, healthRes] = await Promise.all([
          fetch(`/api/repos/${repoId}`),
          fetch(`/api/health?repoId=${encodeURIComponent(repoId)}`),
        ])

        if (!repoRes.ok) {
          if (repoRes.status === 404) throw new Error("Repo not found")
          const body = (await repoRes.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error || "Something went wrong, please try again")
        }

        const repoData = (await repoRes.json()) as { repo: Repo & { isIndexed?: number } }
        
        if (repoData.repo && repoData.repo.isIndexed === 0) {
          throw new Error("Please index repo first")
        }

        if (!healthRes.ok) {
          const body = (await healthRes.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error || "Something went wrong, please try again")
        }
        const healthData = (await healthRes.json()) as
          | { report: HealthReport | null }
          | HealthReport
          | null

        const maybeReport =
          healthData && typeof healthData === 'object' && 'report' in healthData
            ? (healthData as { report: HealthReport | null }).report
            : (healthData as HealthReport | null)

        if (cancelled) return
        setRepo(repoData.repo)
        setReport(maybeReport || null)
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : 'Failed to load health page'
        setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [canInteract, repoId])

  const scoreCards = useMemo(() => {
    const r = report
    return [
      { key: 'overall', label: 'Overall', value: r?.overallScore ?? 0 },
      { key: 'complexity', label: 'Complexity', value: r?.complexityScore ?? 0 },
      { key: 'docs', label: 'Documentation', value: r?.documentationScore ?? 0 },
      { key: 'bugs', label: 'Bug Risk', value: r?.bugRiskScore ?? 0 },
      { key: 'dup', label: 'Duplicates', value: r?.duplicateScore ?? 0 },
    ] as const
  }, [report])

  const runAnalysis = async () => {
    if (!canInteract || running) return
    setError(null)
    setRunning(true)
    try {
      const res = await fetch('/api/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoId }),
      })

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(body?.error || `Health analysis failed (${res.status})`)
      }

      const data = (await res.json()) as { report?: HealthReport } | HealthReport
      const next = data && typeof data === 'object' && 'report' in data ? (data as { report?: HealthReport }).report : (data as HealthReport)
      setReport(next || null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Health analysis failed'
      setError(msg)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />

      <main className="pt-28 pb-24 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push(`/repo/${repoId}`)}
              className="font-mono text-sm px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] hover:text-white hover:border-[rgba(255,255,255,0.18)] transition"
            >
              ← Back
            </button>

            <div className="text-right">
              <div className="font-display font-bold text-xl">Health</div>
              <div className="font-mono text-xs text-[#6b7a8d] truncate max-w-[60vw]">{repoName}</div>
            </div>
          </div>

          {error && (
            <div className="rounded-2xl border border-[rgba(255,0,80,0.35)] bg-[rgba(255,0,80,0.08)] p-4">
              <div className="font-mono text-xs text-[rgba(232,237,243,0.9)]">{error}</div>
            </div>
          )}

          <section className="rounded-3xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="font-display font-semibold text-lg">Repo Health Analysis</h2>
                <p className="font-mono text-[11px] text-[#6b7a8d] mt-1">
                  Run an analysis to score risk areas and get targeted suggestions.
                </p>
              </div>

              <button
                onClick={runAnalysis}
                disabled={!canInteract || running}
                className="w-full md:w-auto font-mono text-sm px-6 py-3 rounded-2xl border border-[rgba(0,229,160,0.28)] bg-[rgba(0,229,160,0.12)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.18)] hover:border-[rgba(0,229,160,0.42)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {running && (
                    <span
                      className="inline-block h-4 w-4 rounded-full border-2 border-[rgba(0,229,160,0.35)] border-t-[#00e5a0] animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {running ? 'Analyzing…' : 'Run Health Analysis'}
                </span>
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-semibold text-lg">Scores</h2>
                <p className="font-mono text-[11px] text-[#6b7a8d] mt-1">
                  0–100 scale with color-coded thresholds.
                </p>
              </div>
              {!loading && !report && (
                <div className="font-mono text-[11px] text-[#6b7a8d] border border-[rgba(255,255,255,0.07)] bg-[rgba(8,11,16,0.6)] px-3 py-1.5 rounded-full">
                  No report yet
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scoreCards.map((c) => (
                <div
                  key={c.key}
                  className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(8,11,16,0.9)] p-4"
                >
                  <ProgressRing value={c.value} label={c.label} />
                </div>
              ))}

              {loading && (
                <>
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(8,11,16,0.9)] p-4 animate-pulse">
                    <div className="h-20 w-full rounded-xl bg-[rgba(255,255,255,0.05)]" />
                  </div>
                  <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(8,11,16,0.9)] p-4 animate-pulse">
                    <div className="h-20 w-full rounded-xl bg-[rgba(255,255,255,0.05)]" />
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-5">
            <div>
              <h2 className="font-display font-semibold text-lg">Suggestions</h2>
              <p className="font-mono text-[11px] text-[#6b7a8d] mt-1">
                Prioritized actions based on detected risks.
              </p>
            </div>

            <div className="mt-4">
              {!loading && !report ? (
                <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(8,11,16,0.9)] p-6 text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-[rgba(0,170,255,0.35)] bg-[rgba(0,170,255,0.08)] text-[#00aaff]">
                    <span className="font-mono text-lg">✓</span>
                  </div>
                  <div className="mt-3">
                    <div className="font-display font-semibold">No report yet</div>
                    <div className="font-mono text-[11px] text-[#6b7a8d] mt-1">
                      Run a health analysis to generate suggestions for {repoName}.
                    </div>
                  </div>
                </div>
              ) : (report?.suggestions?.length || 0) === 0 ? (
                <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(8,11,16,0.9)] p-4 font-mono text-[12px] text-[#6b7a8d]">
                  No suggestions returned.
                </div>
              ) : (
                <ul className="space-y-2">
                  {(report?.suggestions || []).map((s, idx) => {
                    const badge = badgeForType(s.type)
                    const sev = (s.severity || 'unknown').toUpperCase()
                    return (
                      <li
                        key={`${s.type}-${idx}`}
                        className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(8,11,16,0.9)] p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={[
                                  'font-mono text-[10px] tracking-[2px] uppercase px-2 py-1 rounded-full border',
                                  badge.bg,
                                  badge.border,
                                  badge.text,
                                ].join(' ')}
                              >
                                {badge.label}
                              </span>
                              <span className="font-mono text-[10px] tracking-[2px] uppercase px-2 py-1 rounded-full border border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.05)] text-[#e8edf3]">
                                {sev}
                              </span>
                            </div>
                            <p className="mt-2 font-mono text-[13px] leading-6 text-[#c5d0de] whitespace-pre-wrap">
                              {s.message}
                            </p>
                          </div>

                          <div className="shrink-0">
                            <div className="font-mono text-[11px] text-[#6b7a8d]">Severity</div>
                            <div className="mt-1 font-display font-semibold text-sm text-[#e8edf3]">{sev}</div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
