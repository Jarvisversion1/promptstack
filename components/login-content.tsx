'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export const LoginContent = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGitHubSignIn = async () => {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'read:user user:email',
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-[#3ddc84] rounded flex items-center justify-center">
              <span className="font-mono text-[#09090b] text-sm font-bold">PS</span>
            </div>
          </Link>
          <div className="text-center space-y-1">
            <h1 className="font-mono text-xl font-semibold tracking-tight">
              sign in to promptstack
            </h1>
            <p className="font-mono text-sm text-[#e8e8ed]/50">
              share, fork & remix prompt workflows
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
            <p className="font-mono text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* URL error param (from failed callback) */}
        <URLErrorMessage />

        {/* GitHub sign in */}
        <button
          onClick={handleGitHubSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-[#3ddc84] hover:bg-[#3ddc84]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#09090b] font-mono text-sm font-semibold px-4 py-3 rounded-md transition-colors"
        >
          <GitHubIcon />
          {loading ? 'redirecting...' : 'sign in with github'}
        </button>

        {/* Terms */}
        <p className="font-mono text-xs text-[#e8e8ed]/30 text-center">
          by signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}

const URLErrorMessage = () => {
  if (typeof window === 'undefined') return null

  const params = new URLSearchParams(window.location.search)
  const urlError = params.get('error')

  if (!urlError) return null

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
      <p className="font-mono text-sm text-red-400">
        authentication failed. please try again.
      </p>
    </div>
  )
}

const GitHubIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
)
