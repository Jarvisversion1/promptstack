'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Share2, Link as LinkIcon, Check } from 'lucide-react'
import { useToast } from '@/components/toast'

type ShareButtonProps = {
  projectTitle: string
  projectUrl: string
  authorUsername: string
  tool: string
}

const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  bolt: 'Bolt',
  lovable: 'Lovable',
  claude: 'Claude',
  replit: 'Replit',
  other: 'AI',
}

export const ShareButton = ({
  projectTitle,
  projectUrl,
  authorUsername,
  tool,
}: ShareButtonProps) => {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  /* Close on click outside ---------------------------------------- */
  useEffect(() => {
    if (!open) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  /* Copy link ----------------------------------------------------- */
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(projectUrl)
      setCopied(true)
      toast('Link copied to clipboard', 'success')
      setTimeout(() => {
        setCopied(false)
        setOpen(false)
      }, 1500)
    } catch {
      toast('Failed to copy link', 'error')
    }
  }, [projectUrl, toast])

  /* Share on X ---------------------------------------------------- */
  const handleShareX = useCallback(() => {
    const toolName = TOOL_LABELS[tool] ?? tool
    const text = `Check out this ${toolName} prompt workflow for ${projectTitle} by @${authorUsername} on @promptstack ${projectUrl}`
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(tweetUrl, '_blank', 'noopener,noreferrer')
    setOpen(false)
  }, [projectTitle, projectUrl, authorUsername, tool])

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-md border border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70 transition-colors"
      >
        <Share2 size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[#0c0c0f] border border-[#1c1c25] rounded-lg shadow-xl shadow-black/40 z-50 overflow-hidden">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 font-mono text-xs text-[#e8e8ed]/60 hover:bg-[#1c1c25] hover:text-[#e8e8ed] transition-colors"
          >
            {copied ? (
              <Check size={13} className="text-[#3ddc84]" />
            ) : (
              <LinkIcon size={13} />
            )}
            {copied ? 'Copied' : 'Copy link'}
          </button>
          <button
            onClick={handleShareX}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 font-mono text-xs text-[#e8e8ed]/60 hover:bg-[#1c1c25] hover:text-[#e8e8ed] transition-colors"
          >
            <XLogo />
            Share on X
          </button>
        </div>
      )}
    </div>
  )
}

/* Tiny X / Twitter logo */
const XLogo = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
