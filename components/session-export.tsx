'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, ChevronUp, ChevronDown, X } from 'lucide-react'
import {
  EXPORT_PROMPTS,
  EXPORT_TOOL_SLUGS,
  type ExportToolSlug,
} from '@/lib/config/export-prompts'
import { parseExportJSON, type ExportedStep } from '@/lib/schemas/export'

/* ================================================================== */
/*  SessionExport — main interactive component                         */
/* ================================================================== */

export const SessionExport = ({
  defaultTool = 'cursor',
}: {
  defaultTool?: ExportToolSlug
}) => {
  const router = useRouter()

  /* Tool selector state */
  const [selectedTool, setSelectedTool] = useState<ExportToolSlug>(defaultTool)
  const config = EXPORT_PROMPTS[selectedTool]

  /* Copy state */
  const [copied, setCopied] = useState(false)

  /* JSON import state */
  const [jsonInput, setJsonInput] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [steps, setSteps] = useState<ExportedStep[] | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  /* -------------------------------------------------------------- */
  /*  Handlers                                                       */
  /* -------------------------------------------------------------- */

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(config.metaPrompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text
    }
  }, [config.metaPrompt])

  const handleParse = useCallback(() => {
    setParseError(null)
    const result = parseExportJSON(jsonInput)
    if (result.success) {
      setSteps(result.data)
      // Scroll to preview after short delay for render
      setTimeout(() => {
        previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      setSteps(null)
      setParseError(result.error)
    }
  }, [jsonInput])

  const handleRemoveStep = useCallback((index: number) => {
    setSteps((prev) => {
      if (!prev) return prev
      const next = prev.filter((_, i) => i !== index)
      // Re-number step_order
      return next.map((s, i) => ({ ...s, step_order: i + 1 }))
    })
  }, [])

  const handleMoveStep = useCallback((index: number, direction: 'up' | 'down') => {
    setSteps((prev) => {
      if (!prev) return prev
      const next = [...prev]
      const swapIndex = direction === 'up' ? index - 1 : index + 1
      if (swapIndex < 0 || swapIndex >= next.length) return prev
      ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
      return next.map((s, i) => ({ ...s, step_order: i + 1 }))
    })
  }, [])

  const handleContinue = useCallback(() => {
    if (!steps || steps.length === 0) return
    try {
      sessionStorage.setItem('promptstack_export', JSON.stringify(steps))
    } catch {
      // sessionStorage unavailable — data won't persist
    }
    router.push('/new')
  }, [steps, router])

  /* -------------------------------------------------------------- */
  /*  Render                                                         */
  /* -------------------------------------------------------------- */

  return (
    <div className="space-y-16">
      {/* ========================================================== */}
      {/*  Step 1 — Tool Selector + Meta-Prompt                      */}
      {/* ========================================================== */}
      <div className="space-y-6">
        <h2 className="font-mono text-sm text-[#3ddc84] mb-2">
          {'// Step 1: Copy the export prompt'}
        </h2>

        {/* Tool chips */}
        <div className="flex flex-wrap gap-2">
          {EXPORT_TOOL_SLUGS.map((slug) => {
            const tool = EXPORT_PROMPTS[slug]
            const isActive = slug === selectedTool
            return (
              <button
                key={slug}
                onClick={() => {
                  setSelectedTool(slug)
                  setCopied(false)
                }}
                className={`font-mono text-sm px-3.5 py-1.5 rounded-md border transition-colors ${
                  isActive
                    ? 'border-[#3ddc84]/60 bg-[#3ddc84]/10 text-[#3ddc84]'
                    : 'border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70'
                }`}
              >
                {tool.name}
              </button>
            )
          })}
        </div>

        {/* Meta-prompt code block */}
        <div className="relative group">
          <div className="bg-[#0c0c0f] border border-[#1c1c25] border-l-2 border-l-[#3ddc84] rounded-lg overflow-hidden">
            {/* Copy button */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1c1c25]">
              <span className="font-mono text-xs text-[#e8e8ed]/30">
                {config.name} export prompt
              </span>
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded transition-colors ${
                  copied
                    ? 'text-[#3ddc84] bg-[#3ddc84]/10'
                    : 'text-[#e8e8ed]/50 hover:text-[#e8e8ed] hover:bg-[#1c1c25]'
                }`}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* Prompt text */}
            <pre className="px-4 py-4 font-mono text-sm text-[#e8e8ed]/70 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto">
              {config.metaPrompt}
            </pre>
          </div>
        </div>

        {/* Tool-specific instructions */}
        <p className="font-mono text-xs text-[#e8e8ed]/40 pl-1">
          {config.instructions}
        </p>
      </div>

      {/* ========================================================== */}
      {/*  Step 2 — JSON Import                                       */}
      {/* ========================================================== */}
      <div className="space-y-6">
        {/* Divider */}
        <div className="border-t border-[#1c1c25]" />

        <h2 className="font-mono text-sm text-[#3ddc84]">
          {'// Step 2: Paste your exported JSON'}
        </h2>

        {/* Textarea */}
        <textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value)
            setParseError(null)
          }}
          placeholder="Paste the JSON output from your AI tool here..."
          rows={10}
          className="w-full min-h-[200px] bg-[#0c0c0f] border border-[#1c1c25] rounded-lg px-4 py-3 font-mono text-sm text-[#e8e8ed]/80 placeholder:text-[#e8e8ed]/20 focus:outline-none focus:border-[#3ddc84]/50 focus:ring-1 focus:ring-[#3ddc84]/20 resize-y transition-colors"
        />

        {/* Error message */}
        {parseError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
            <p className="font-mono text-sm text-red-400">{parseError}</p>
          </div>
        )}

        {/* Parse button */}
        <button
          onClick={handleParse}
          disabled={!jsonInput.trim()}
          className="w-full font-mono text-sm font-semibold px-6 py-3 bg-[#3ddc84] text-[#09090b] rounded-md hover:bg-[#3ddc84]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Parse & Preview
        </button>
      </div>

      {/* ========================================================== */}
      {/*  Step 3 — Preview                                           */}
      {/* ========================================================== */}
      {steps && steps.length > 0 && (
        <div ref={previewRef} className="space-y-6">
          <div className="border-t border-[#1c1c25]" />

          {/* Header */}
          <div className="flex items-center gap-2">
            <Check size={16} className="text-[#3ddc84]" />
            <h2 className="font-mono text-sm text-[#3ddc84]">
              {steps.length} {steps.length === 1 ? 'step' : 'steps'} found
            </h2>
          </div>

          {/* Step cards */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <StepCard
                key={`${step.step_order}-${step.title}`}
                step={step}
                index={index}
                total={steps.length}
                onRemove={() => handleRemoveStep(index)}
                onMove={(dir) => handleMoveStep(index, dir)}
              />
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            className="w-full font-mono text-sm font-semibold px-6 py-3.5 bg-[#3ddc84] text-[#09090b] rounded-md hover:bg-[#3ddc84]/90 transition-colors"
          >
            Continue to Publish →
          </button>
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  StepCard — individual parsed step preview                          */
/* ================================================================== */

const StepCard = ({
  step,
  index,
  total,
  onRemove,
  onMove,
}: {
  step: ExportedStep
  index: number
  total: number
  onRemove: () => void
  onMove: (direction: 'up' | 'down') => void
}) => {
  const truncatedPrompt =
    step.prompt_text.length > 100
      ? `${step.prompt_text.slice(0, 100)}...`
      : step.prompt_text

  return (
    <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-4 group">
      <div className="flex gap-3">
        {/* Reorder controls */}
        <div className="flex flex-col items-center gap-0.5 pt-0.5 shrink-0">
          <button
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="text-[#e8e8ed]/20 hover:text-[#e8e8ed]/60 disabled:opacity-0 disabled:cursor-default transition-colors p-0.5"
            aria-label="Move up"
          >
            <ChevronUp size={14} />
          </button>
          <span className="font-mono text-xs text-[#3ddc84] font-semibold w-5 text-center">
            {step.step_order}
          </span>
          <button
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="text-[#e8e8ed]/20 hover:text-[#e8e8ed]/60 disabled:opacity-0 disabled:cursor-default transition-colors p-0.5"
            aria-label="Move down"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-mono text-sm font-semibold leading-snug">
              {step.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1c1c25] text-[#e8e8ed]/40">
                {step.context_mode}
              </span>
              <button
                onClick={onRemove}
                className="text-[#e8e8ed]/20 hover:text-red-400 transition-colors p-0.5"
                aria-label="Remove step"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Prompt preview */}
          <p className="font-mono text-xs text-[#e8e8ed]/40 leading-relaxed">
            {truncatedPrompt}
          </p>

          {/* Output summary */}
          {step.output_summary && (
            <p className="text-xs text-[#e8e8ed]/30 leading-relaxed">
              {step.output_summary}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
