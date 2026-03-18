'use client'

interface ProgressBarProps {
  progress: number
  message: string
}

export function ProgressBar({ progress, message }: ProgressBarProps) {
  const displayProgress = Math.max(0, Math.min(100, progress))
  
  return (
    <div className="mt-6 border border-[rgba(255,255,255,0.07)] bg-[#0f1520] rounded-2xl p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-display font-semibold text-[#e8edf3]">Indexing in progress</div>
          <div className="font-mono text-xs text-[#6b7a8d] mt-1">{message}</div>
        </div>
        <div className="font-mono text-sm text-[#00e5a0] tabular-nums">{displayProgress}%</div>
      </div>
      <div className="mt-4 h-2 w-full rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[#00e5a0] transition-[width] duration-300 ease-out"
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      <div className="mt-2 h-[1px] w-full bg-[rgba(255,255,255,0.05)]" />
      <div className="mt-2 font-mono text-[11px] text-[#6b7a8d]">
        Tip: larger repos can take a few minutes — keep this tab open.
      </div>
    </div>
  )
}
