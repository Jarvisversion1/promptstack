'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

export const AuthButton = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const getUser = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)
      setLoading(false)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-[#1c1c25] animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="font-mono text-sm px-3 py-1.5 bg-[#3ddc84] text-[#09090b] rounded hover:bg-[#3ddc84]/90 transition-colors font-semibold"
      >
        sign in
      </Link>
    )
  }

  const avatarUrl = user.user_metadata.avatar_url
  const username =
    user.user_metadata.user_name ??
    user.user_metadata.preferred_username ??
    user.email?.split('@')[0] ??
    'user'

  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/@${username}`}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            width={28}
            height={28}
            className="w-7 h-7 rounded-full border border-[#1c1c25]"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-[#3ddc84] flex items-center justify-center">
            <span className="font-mono text-[#09090b] text-xs font-bold">
              {username[0].toUpperCase()}
            </span>
          </div>
        )}
        <span className="hidden md:inline font-mono text-sm text-[#e8e8ed]/70">
          {username}
        </span>
      </Link>
      <button
        onClick={handleSignOut}
        className="font-mono text-xs px-2.5 py-1 text-[#e8e8ed]/50 hover:text-[#e8e8ed] hover:bg-[#1c1c25] rounded transition-colors"
      >
        sign out
      </button>
    </div>
  )
}
