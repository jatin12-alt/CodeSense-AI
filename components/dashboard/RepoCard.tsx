'use client'

import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export type Repo = {
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

interface RepoCardProps {
  repo: Repo
  isIndexing: boolean
  onDelete: (id: string) => Promise<void>
}

function formatDate(value: Repo['createdAt']) {
  if (!value) return '—'
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })
}

export function RepoCard({ repo, isIndexing, onDelete }: RepoCardProps) {
  const router = useRouter()
  const indexed = (repo.isIndexed ?? 0) === 1

  return (
    <div className="group rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[#0f1520] p-5 hover:border-[rgba(0,229,160,0.25)] transition">
      <div className="flex items-start justify-between gap-4">
        <button
          onClick={() => router.push(`/repo/${repo.id}`)}
          className="text-left"
        >
          <div className="font-display font-semibold text-lg leading-tight text-[#e8edf3] group-hover:text-white transition">
            {repo.repoName}
          </div>
          <div className="font-mono text-xs text-[#6b7a8d] mt-1">
            {repo.owner}
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={[
              'font-mono text-[10px] tracking-[1.6px] uppercase px-2.5 py-1 rounded-full border',
              indexed
                ? 'border-[rgba(0,229,160,0.25)] bg-[rgba(0,229,160,0.08)] text-[#00e5a0]'
                : isIndexing
                  ? 'border-[rgba(0,170,255,0.25)] bg-[rgba(0,170,255,0.08)] text-[#00aaff]'
                  : 'border-[rgba(255,255,255,0.10)] bg-[rgba(255,255,255,0.04)] text-[#6b7a8d]',
            ].join(' ')}
          >
            {indexed ? 'Indexed' : 'Indexing'}
          </span>

          <button
            onClick={() => void onDelete(repo.id)}
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
            {repo.language || '—'}
          </div>
        </div>
        <div className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-3">
          <div className="font-mono text-[10px] tracking-[2px] uppercase text-[#6b7a8d]">
            Files
          </div>
          <div className="mt-1 font-mono text-sm text-[#e8edf3] tabular-nums">
            {repo.totalFiles ?? 0}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="font-mono text-xs text-[#6b7a8d] truncate">
          {repo.repoUrl}
        </div>
        <div className="font-mono text-xs text-[#6b7a8d] whitespace-nowrap">
          {formatDate(repo.createdAt)}
        </div>
      </div>
    </div>
  )
}
