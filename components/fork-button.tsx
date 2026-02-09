'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { GitFork, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type ForkButtonProps = {
  projectId: string
  projectSlug: string
  authorUsername: string
  forkCount: number
}

export const ForkButton = ({
  projectId,
  forkCount,
}: ForkButtonProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFork = useCallback(async () => {
    if (loading) return
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const res = await fetch('/api/projects/fork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to fork project')
      }

      const { slug, authorUsername } = await res.json()
      router.push(`/@${authorUsername}/${slug}/edit`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fork failed')
      setLoading(false)
    }
  }, [loading, projectId, router])

  return (
    <div className="relative">
      <button
        onClick={handleFork}
        disabled={loading}
        className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-md border border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70 transition-colors disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <GitFork size={14} />
        )}
        <span>{loading ? 'Forking...' : 'Fork'}</span>
        {forkCount > 0 && !loading && (
          <span className="text-[#e8e8ed]/30">{forkCount}</span>
        )}
      </button>
      {error && (
        <p className="absolute top-full left-0 mt-1 font-mono text-[10px] text-red-400 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  )
}
