'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'
import { useToast } from '@/components/toast'

type StarButtonProps = {
  projectId: string
  initialStarred: boolean
  initialCount: number
}

export const StarButton = ({
  projectId,
  initialStarred,
  initialCount,
}: StarButtonProps) => {
  const router = useRouter()
  const { toast } = useToast()
  const [starred, setStarred] = useState(initialStarred)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [showScore, setShowScore] = useState(false)
  const scoreKey = useRef(0)

  const handleToggle = useCallback(async () => {
    if (loading) return

    // Check auth client-side first
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Optimistic update
    const wasStarred = starred
    const prevCount = count
    const newStarred = !wasStarred
    const newCount = wasStarred ? prevCount - 1 : prevCount + 1

    setStarred(newStarred)
    setCount(newCount)
    setLoading(true)

    // Trigger animations on star (not unstar)
    if (!wasStarred) {
      setAnimating(true)
      scoreKey.current += 1
      setShowScore(true)
      setTimeout(() => setAnimating(false), 300)
      setTimeout(() => setShowScore(false), 600)
    }

    try {
      const res = await fetch('/api/stars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      })

      if (!res.ok) {
        throw new Error('API error')
      }

      const data = await res.json()

      // Sync with server count
      setStarred(data.starred)
      setCount(data.count)
    } catch {
      // Revert optimistic update
      setStarred(wasStarred)
      setCount(prevCount)
      toast('Failed to star. Try again.', 'error')
    } finally {
      setLoading(false)
    }
  }, [starred, count, loading, projectId, router, toast])

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`relative flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-md border transition-colors ${
        starred
          ? 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]'
          : 'border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70'
      }`}
    >
      <span className={animating ? 'animate-star-pop' : ''}>
        <Star size={14} fill={starred ? 'currentColor' : 'none'} />
      </span>
      {count}

      {/* +1 score float */}
      {showScore && (
        <span
          key={scoreKey.current}
          className="absolute -top-1 left-1/2 -translate-x-1/2 font-mono text-[10px] font-bold text-[#3ddc84] animate-score-float pointer-events-none"
        >
          +1
        </span>
      )}
    </button>
  )
}
