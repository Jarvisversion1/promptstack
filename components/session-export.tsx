'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  X,
  Plus,
  Layers,
  Loader2,
} from 'lucide-react'
import {
  EXPORT_PROMPTS,
  EXPORT_TOOL_SLUGS,
  type ExportToolSlug,
} from '@/lib/config/export-prompts'
import { parseExportJSON, type ExportedStep } from '@/lib/schemas/export'
import { useToast } from '@/components/toast'
import type { UserProjectSummary } from '@/lib/queries/projects'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type ExportMode = 'new' | 'existing'

type AppendSuccess = {
  projectTitle: string
  projectSlug: string
  authorUsername: string
  addedCount: number
  totalSteps: number
}

/* ================================================================== */
/*  SessionExport — main interactive component                         */
/* ================================================================== */

export const SessionExport = ({
  defaultTool = 'cursor',
  userProjects = [],
  username = '',
}: {
  defaultTool?: ExportToolSlug
  userProjects?: UserProjectSummary[]
  username?: string
}) => {
  const router = useRouter()
  const { toast } = useToast()

  /* Tool selector state */
  const [selectedTool, setSelectedTool] = useState<ExportToolSlug>(defaultTool)
  const config = EXPORT_PROMPTS[selectedTool]

  /* Copy state */
  const [copied, setCopied] = useState(false)

  /* Export mode state */
  const [mode, setMode] = useState<ExportMode>('new')
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    userProjects[0]?.id ?? ''
  )

  /* JSON import state */
  const [jsonInput, setJsonInput] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [steps, setSteps] = useState<ExportedStep[] | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  /* Append state */
  const [appending, setAppending] = useState(false)
  const [appendSuccess, setAppendSuccess] = useState<AppendSuccess | null>(null)
  const [appendError, setAppendError] = useState<string | null>(null)

  /* Derived */
  const selectedProject = userProjects.find((p) => p.id === selectedProjectId)
  const hasProjects = userProjects.length > 0
  const stepOffset =
    mode === 'existing' && selectedProject ? selectedProject.step_count : 0

  /* -------------------------------------------------------------- */
  /*  Handlers                                                       */
  /* -------------------------------------------------------------- */

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(config.metaPrompt)
      setCopied(true)
      toast('Prompt copied', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: select text
    }
  }, [config.metaPrompt, toast])

  const handleParse = useCallback(() => {
    setParseError(null)
    setAppendSuccess(null)
    setAppendError(null)
    const result = parseExportJSON(jsonInput)
    if (result.success) {
      setSteps(result.data)
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

  const handleContinueNew = useCallback(() => {
    if (!steps || steps.length === 0) return
    try {
      sessionStorage.setItem('promptstack_export', JSON.stringify(steps))
    } catch {
      // sessionStorage unavailable
    }
    router.push('/new')
  }, [steps, router])

  const handleAppendExisting = useCallback(async () => {
    if (!steps || steps.length === 0 || !selectedProjectId || !selectedProject)
      return

    setAppending(true)
    setAppendError(null)
    setAppendSuccess(null)

    try {
      const res = await fetch(
        `/api/projects/${selectedProjectId}/append-steps`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ steps }),
        }
      )

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to append steps')
      }

      const data = await res.json()

      setAppendSuccess({
        projectTitle: selectedProject.title,
        projectSlug: selectedProject.slug,
        authorUsername: username,
        addedCount: steps.length,
        totalSteps: data.totalSteps,
      })

      toast(
        `Added ${steps.length} step${steps.length !== 1 ? 's' : ''} to ${selectedProject.title}`,
        'success'
      )

      // Update the local project list step count
      selectedProject.step_count = data.totalSteps

      // Clear the parsed steps
      setSteps(null)
      setJsonInput('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong'
      setAppendError(message)
      toast('Failed to append steps', 'error')
    } finally {
      setAppending(false)
    }
  }, [steps, selectedProjectId, selectedProject, toast])

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

            <pre className="px-4 py-4 font-mono text-sm text-[#e8e8ed]/70 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[400px] overflow-y-auto">
              {config.metaPrompt}
            </pre>
          </div>
        </div>

        <p className="font-mono text-xs text-[#e8e8ed]/40 pl-1">
          {config.instructions}
        </p>
      </div>

      {/* ========================================================== */}
      {/*  Project Selector (only if user has projects)               */}
      {/* ========================================================== */}
      {hasProjects && (
        <div className="space-y-4">
          <div className="border-t border-[#1c1c25]" />

          <h2 className="font-mono text-sm text-[#3ddc84]">
            {'// Add to existing project or start new?'}
          </h2>

          {/* Mode toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('new')}
              className={`flex items-center gap-2 font-mono text-sm px-4 py-2.5 rounded-md border transition-colors ${
                mode === 'new'
                  ? 'border-[#3ddc84]/60 bg-[#3ddc84]/10 text-[#3ddc84]'
                  : 'border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70'
              }`}
            >
              <Plus size={14} />
              New Project
            </button>
            <button
              onClick={() => setMode('existing')}
              className={`flex items-center gap-2 font-mono text-sm px-4 py-2.5 rounded-md border transition-colors ${
                mode === 'existing'
                  ? 'border-[#3ddc84]/60 bg-[#3ddc84]/10 text-[#3ddc84]'
                  : 'border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70'
              }`}
            >
              <Layers size={14} />
              Existing Project
            </button>
          </div>

          {/* Project dropdown */}
          {mode === 'existing' && (
            <div className="space-y-2">
              <select
                value={selectedProjectId}
                onChange={(e) => {
                  setSelectedProjectId(e.target.value)
                  setAppendSuccess(null)
                  setAppendError(null)
                }}
                className="input-field w-full font-mono text-sm bg-[#0c0c0f] border border-[#1c1c25] rounded-md px-3 py-2.5 text-[#e8e8ed]/80 focus:outline-none focus:border-[#3ddc84]/40 focus:ring-1 focus:ring-[#3ddc84]/20 transition-colors"
              >
                {userProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>

              {selectedProject && (
                <p className="font-mono text-xs text-[#e8e8ed]/30 pl-1">
                  {selectedProject.step_count}{' '}
                  {selectedProject.step_count === 1 ? 'step' : 'steps'} already
                  in this project
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================== */}
      {/*  Step 2 — JSON Import                                       */}
      {/* ========================================================== */}
      <div className="space-y-6">
        <div className="border-t border-[#1c1c25]" />

        <h2 className="font-mono text-sm text-[#3ddc84]">
          {'// Step 2: Paste your exported JSON'}
        </h2>

        <textarea
          value={jsonInput}
          onChange={(e) => {
            setJsonInput(e.target.value)
            setParseError(null)
            setAppendSuccess(null)
            setAppendError(null)
          }}
          placeholder="Paste the JSON output from your AI tool here..."
          rows={10}
          className="w-full min-h-[200px] bg-[#0c0c0f] border border-[#1c1c25] rounded-lg px-4 py-3 font-mono text-sm text-[#e8e8ed]/80 placeholder:text-[#e8e8ed]/20 focus:outline-none focus:border-[#3ddc84]/50 focus:ring-1 focus:ring-[#3ddc84]/20 resize-y transition-colors"
        />

        {parseError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
            <p className="font-mono text-sm text-red-400">{parseError}</p>
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={!jsonInput.trim()}
          className="w-full font-mono text-sm font-semibold px-6 py-3 bg-[#3ddc84] text-[#09090b] rounded-md hover:bg-[#3ddc84]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Parse & Preview
        </button>
      </div>

      {/* ========================================================== */}
      {/*  Append success message                                     */}
      {/* ========================================================== */}
      {appendSuccess && (
        <div className="bg-[#3ddc84]/10 border border-[#3ddc84]/20 rounded-lg px-5 py-4 space-y-3">
          <p className="font-mono text-sm text-[#3ddc84] font-semibold">
            Added {appendSuccess.addedCount} step
            {appendSuccess.addedCount !== 1 ? 's' : ''} to{' '}
            {appendSuccess.projectTitle}. Total: {appendSuccess.totalSteps}{' '}
            steps.
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/@${appendSuccess.authorUsername}/${appendSuccess.projectSlug}`}
              className="font-mono text-xs text-[#3ddc84]/70 hover:text-[#3ddc84] transition-colors flex items-center gap-1"
            >
              View project <ChevronRight size={12} />
            </Link>
            <Link
              href={`/@${appendSuccess.authorUsername}/${appendSuccess.projectSlug}/edit`}
              className="font-mono text-xs text-[#3ddc84]/70 hover:text-[#3ddc84] transition-colors flex items-center gap-1"
            >
              Edit project <ChevronRight size={12} />
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/*  Append error message                                       */}
      {/* ========================================================== */}
      {appendError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-md px-4 py-3">
          <p className="font-mono text-sm text-red-400">{appendError}</p>
        </div>
      )}

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

          {/* Context note for append mode */}
          {mode === 'existing' && selectedProject && (
            <div className="bg-[#1c1c25]/50 border border-[#1c1c25] rounded-md px-4 py-3">
              <p className="font-mono text-xs text-[#e8e8ed]/50">
                These {steps.length} step{steps.length !== 1 ? 's' : ''} will
                be added after step {selectedProject.step_count} in{' '}
                <span className="text-[#e8e8ed]/70 font-semibold">
                  {selectedProject.title}
                </span>
              </p>
            </div>
          )}

          {/* Step cards */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <StepCard
                key={`${step.step_order}-${step.title}`}
                step={step}
                index={index}
                total={steps.length}
                displayOrder={stepOffset + index + 1}
                onRemove={() => handleRemoveStep(index)}
                onMove={(dir) => handleMoveStep(index, dir)}
              />
            ))}
          </div>

          {/* Action button */}
          {mode === 'existing' && selectedProject ? (
            <button
              onClick={handleAppendExisting}
              disabled={appending}
              className="w-full flex items-center justify-center gap-2 font-mono text-sm font-semibold px-6 py-3.5 bg-[#3ddc84] text-[#09090b] rounded-md hover:bg-[#3ddc84]/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {appending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Appending...
                </>
              ) : (
                <>
                  Append {steps.length} Step{steps.length !== 1 ? 's' : ''} →
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleContinueNew}
              className="w-full font-mono text-sm font-semibold px-6 py-3.5 bg-[#3ddc84] text-[#09090b] rounded-md hover:bg-[#3ddc84]/90 transition-colors"
            >
              Continue to Publish →
            </button>
          )}
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
  displayOrder,
  onRemove,
  onMove,
}: {
  step: ExportedStep
  index: number
  total: number
  displayOrder: number
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
            {displayOrder}
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
