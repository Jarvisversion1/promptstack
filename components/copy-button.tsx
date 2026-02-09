'use client'

import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { useToast } from '@/components/toast'

type CopyButtonProps = {
  text: string
  label?: string
  className?: string
}

export const CopyButton = ({ text, label, className = '' }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast('Link copied to clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Failed to copy', 'error')
    }
  }, [text, toast])

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 font-mono text-xs px-2 py-1 rounded transition-colors ${
        copied
          ? 'text-[#3ddc84] bg-[#3ddc84]/10'
          : 'text-[#e8e8ed]/40 hover:text-[#e8e8ed]/70 hover:bg-[#1c1c25]'
      } ${className}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {label !== undefined && (
        <span>{copied ? 'Copied' : label}</span>
      )}
    </button>
  )
}
