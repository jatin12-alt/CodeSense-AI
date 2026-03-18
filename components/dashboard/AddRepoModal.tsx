'use client'

interface AddRepoModalProps {
  isOpen: boolean
  onClose: () => void
  repoUrl: string
  setRepoUrl: (url: string) => void
  onStartIndexing: () => Promise<void>
  isIndexing: boolean
  indexingMessage: string
  indexingProgress: number
}

export function AddRepoModal({
  isOpen,
  onClose,
  repoUrl,
  setRepoUrl,
  onStartIndexing,
  isIndexing,
  indexingMessage,
  indexingProgress,
}: AddRepoModalProps) {
  if (!isOpen) return null

  const displayProgress = Math.max(0, Math.min(100, indexingProgress))

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute inset-0 bg-[rgba(0,0,0,0.6)]"
        onClick={onClose}
        aria-label="Close modal"
      />

      <div className="relative w-full max-w-xl rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-display font-bold text-xl text-[#e8edf3]">Add a GitHub repository</div>
            <div className="font-mono text-xs text-[#6b7a8d] mt-1">
              We&apos;ll fetch code files, chunk them, and store embeddings for fast RAG.
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isIndexing}
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
            disabled={isIndexing}
            className="mt-2 w-full rounded-xl border border-[rgba(255,255,255,0.07)] bg-[#080b10] px-4 py-3 font-mono text-sm text-[#e8edf3] placeholder:text-[rgba(107,122,141,0.85)] outline-none focus:border-[rgba(0,229,160,0.35)]"
          />
        </div>

        {isIndexing && (
          <div className="mt-5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="font-mono text-xs text-[#6b7a8d]">{indexingMessage}</div>
              <div className="font-mono text-sm text-[#00e5a0] tabular-nums">
                {displayProgress}%
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00e5a0] transition-[width] duration-300 ease-out"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={onClose}
            disabled={isIndexing}
            className="font-mono text-sm px-4 py-3 rounded-xl border border-[rgba(255,255,255,0.07)] text-[#6b7a8d] hover:text-white hover:border-[rgba(255,255,255,0.18)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={() => void onStartIndexing()}
            disabled={!repoUrl.trim() || isIndexing}
            className="font-mono text-sm px-4 py-3 rounded-xl border border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.08)] text-[#00e5a0] hover:bg-[rgba(0,229,160,0.12)] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isIndexing ? 'Indexing...' : 'Start indexing'}
          </button>
        </div>
      </div>
    </div>
  )
}
