'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

export const WelcomeBanner = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('promptstack_welcome_dismissed')
    if (dismissed !== 'true') {
      setIsVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('promptstack_welcome_dismissed', 'true')
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed top-14 left-0 right-0 z-40 bg-[#0c0c0f]/95 backdrop-blur-sm border-b border-[#1c1c25]">
      <div className="max-w-7xl mx-auto px-4 h-[44px] flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center">
          <Link
            href="/guide"
            className="font-mono text-[13px] text-[#e8e8ed]/70 hover:text-[#e8e8ed] transition-colors group"
          >
            New to PromptStack?{' '}
            <span className="text-[#3ddc84] group-hover:underline">
              Read the 5-minute guide to sharing your first prompt workflow →
            </span>
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[#e8e8ed]/30 hover:text-[#e8e8ed]/70 transition-colors shrink-0"
          aria-label="Dismiss welcome banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
