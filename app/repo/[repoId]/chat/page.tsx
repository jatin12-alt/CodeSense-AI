'use client'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { LoadingPage, LoadingDots } from '@/components/LoadingSpinner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
  timestamp: Date
}

type Repo = {
  id: string
  repoName: string
  repoUrl: string
}

type ChatHistoryRow = {
  id: string
  question: string
  answer: string
  createdAt?: string | Date | null
}

function toDate(v: unknown) {
  const d = v instanceof Date ? v : new Date(typeof v === 'string' ? v : Date.now())
  return Number.isNaN(d.getTime()) ? new Date() : d
}

export default function RepoChatPage() {
  const params = useParams()
  const repoId = params.repoId as string

  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  const [repo, setRepo] = useState<Repo | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [sending, setSending] = useState(false)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const canInteract = isLoaded && isSignedIn

  const repoName = repo?.repoName || 'this repository'

  const scrollToBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const autosizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineHeight = 20
    const max = lineHeight * 4 + 18
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
  }, [])

  useEffect(() => {
    autosizeTextarea()
  }, [input, autosizeTextarea])

  const fetchRepo = useCallback(async () => {
    if (!canInteract) return
    const repoRes = await fetch(`/api/repos/${repoId}`)
    if (!repoRes.ok) {
      if (repoRes.status === 404) throw new Error("Repo not found")
      const body = (await repoRes.json().catch(() => null)) as { error?: string } | null
      throw new Error(body?.error || "Something went wrong, please try again")
    }
    const data = (await repoRes.json()) as { repo: Repo & { isIndexed?: number } }
    
    if (data.repo && data.repo.isIndexed === 0) {
      throw new Error("Please index repo first")
    }
    
    setRepo(data.repo)
  }, [canInteract, repoId])

  const fetchHistory = useCallback(async () => {
    if (!canInteract) return
    setLoadingHistory(true)
    const res = await fetch(`/api/chat?repoId=${encodeURIComponent(repoId)}`)
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(body?.error || `Failed to fetch history (${res.status})`)
    }
    const data = (await res.json()) as { history: ChatHistoryRow[] }
    const rows = data.history || []

    const mapped: Message[] = rows.flatMap((r) => {
      const ts = toDate(r.createdAt)
      return [
        {
          id: `${r.id}-q`,
          role: 'user',
          content: r.question,
          timestamp: ts,
        },
        {
          id: `${r.id}-a`,
          role: 'assistant',
          content: r.answer,
          timestamp: ts,
        },
      ]
    })

    setMessages(mapped)
    setLoadingHistory(false)
  }, [canInteract, repoId])

  useEffect(() => {
    document.title = "Chat | CodeSense AI"
    if (!isLoaded) return
    if (!isSignedIn) {
      router.replace('/sign-in')
      return
    }
  }, [isLoaded, isSignedIn, router])

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return
    setError(null)
    void (async () => {
      try {
        await fetchRepo()
        await fetchHistory()
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to load chat'
        setError(msg)
        setLoadingHistory(false)
      }
    })()
  }, [fetchHistory, fetchRepo, isLoaded, isSignedIn])

  const suggestions = useMemo(
    () => [
      'What does this codebase do?',
      'How is the project structured?',
      'What are the main dependencies?',
    ],
    []
  )

  const sendMessage = useCallback(
    async (question: string) => {
      const trimmed = question.trim()
      if (!trimmed || sending || !repo) return

      setError(null)
      setSending(true)
      setInput('')

      const userMsg: Message = {
        id: `u-${crypto.randomUUID()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      }
      const loadingMsg: Message = {
        id: `l-${crypto.randomUUID()}`,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg, loadingMsg])

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repoId,
            repoName: repo.repoName,
            question: trimmed,
          }),
        })

        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null
          throw new Error(body?.error || `Chat failed (${res.status})`)
        }

        const data = (await res.json()) as { answer: string; sources?: string[] }
        const assistantMsg: Message = {
          id: `a-${crypto.randomUUID()}`,
          role: 'assistant',
          content: data.answer,
          sources: data.sources || [],
          timestamp: new Date(),
        }

        setMessages((prev) => {
          const next = [...prev]
          const idx = next.findIndex((m) => m.id === loadingMsg.id)
          if (idx >= 0) next.splice(idx, 1, assistantMsg)
          else next.push(assistantMsg)
          return next
        })
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Chat failed'
        setMessages((prev) => prev.filter((m) => m.id !== loadingMsg.id))
        setError(msg)
      } finally {
        setSending(false)
      }
    },
    [repoId, repo, sending]
  )

  return (
    <div className="min-h-screen bg-[#080b10] text-[#e8edf3]">
      <Navbar />

      <main className="pt-28 pb-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => router.push(`/repo/${repoId}`)}
              className="font-mono text-sm px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] hover:text-white hover:border-[rgba(255,255,255,0.18)] transition"
            >
              ← Back
            </button>

            <div className="text-right">
              <div className="font-display font-bold text-xl">Chat</div>
              <div className="font-mono text-xs text-[#6b7a8d] truncate max-w-[60vw]">
                {repoName}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,0,80,0.06)] p-4">
              <div className="font-mono text-xs text-[rgba(232,237,243,0.9)]">{error}</div>
            </div>
          )}

          <div className="mt-6 rounded-3xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] overflow-hidden">
            <div ref={scrollRef} className="h-[50vh] md:h-[62vh] overflow-y-auto px-4 md:px-5 py-6 space-y-4">
              {loadingHistory ? (
                <LoadingPage text="Loading chat history..." />
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <div className="inline-flex items-center gap-2 border border-[rgba(0,170,255,0.25)] text-[#00aaff] text-[10px] tracking-[2px] uppercase px-3 py-1.5 rounded-full bg-[rgba(0,170,255,0.06)] font-mono w-fit mx-auto">
                    READY
                  </div>
                  <h2 className="font-display font-bold text-2xl mt-4">
                    Ask anything about {repoName}
                  </h2>
                  <p className="font-mono text-sm text-[#6b7a8d] mt-2">
                    Grounded answers using your indexed code context.
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => void sendMessage(s)}
                        disabled={sending || !repo}
                        className="font-mono text-xs px-3 py-2 rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] text-[#6b7a8d] hover:text-white hover:border-[rgba(0,170,255,0.25)] hover:bg-[rgba(0,170,255,0.06)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => {
                  const isUser = m.role === 'user'
                  const isLoadingBubble = m.role === 'assistant' && m.content.trim().length === 0 && sending

                  return (
                    <div key={m.id} className={isUser ? 'flex justify-end' : 'flex justify-start'}>
                      <div
                        className={[
                          'max-w-[84%] rounded-2xl border px-4 py-3',
                          isUser
                            ? 'bg-[rgba(0,170,255,0.14)] border-[rgba(0,170,255,0.25)]'
                            : 'bg-[#0f1520] border-[rgba(255,255,255,0.07)]',
                        ].join(' ')}
                      >
                        {isLoadingBubble ? (
                          <LoadingDots />
                        ) : (
                          <div className="font-mono text-sm leading-7 whitespace-pre-wrap wrap-break-word">
                            {m.content}
                          </div>
                        )}

                        {!isUser && !isLoadingBubble && m.sources && m.sources.length > 0 && (
                          <div className="mt-3">
                            <div className="font-mono text-[11px] text-[#6b7a8d] mb-2">Sources:</div>
                            <div className="flex flex-wrap gap-2">
                              {Array.from(new Set(m.sources)).map((s, idx) => (
                                <span
                                  key={`${s}-${idx}`}
                                  className="font-mono text-[11px] px-2 py-1 rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] text-[#6b7a8d]"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Input bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[rgba(255,255,255,0.07)] bg-[rgba(8,11,16,0.92)] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] px-4 py-3 flex items-end gap-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  void sendMessage(input)
                }
              }}
              placeholder={repo ? `Message ${repoName}…` : 'Loading…'}
              disabled={sending || !repo}
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none font-mono text-sm leading-5 text-[#e8edf3] placeholder:text-[rgba(107,122,141,0.85)] disabled:opacity-60"
            />

            <button
              onClick={() => void sendMessage(input)}
              disabled={sending || !repo || !input.trim()}
              className="shrink-0 font-mono text-sm px-4 py-2 rounded-xl border border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.10)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.14)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <div className="mt-2 font-mono text-[11px] text-[#6b7a8d]">
            Enter to send • Shift+Enter for a new line
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}