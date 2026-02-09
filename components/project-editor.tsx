'use client'

import { useCallback, useState, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Save,
  Send,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Loader2,
  GitFork,
} from 'lucide-react'
import { TOOLS, CATEGORIES, DIFFICULTIES } from '@/lib/config/filters'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type StepData = {
  step_order: number
  title: string
  prompt_text: string
  context_mode: string | null
  output_notes: string
  tips: string
  fork_note: string
}

type ProjectFormData = {
  title: string
  description: string
  tool: string
  category: string
  difficulty: string | null
  demo_url: string
  tags: string[]
  steps: StepData[]
  is_published: boolean
}

type ForkOrigin = {
  title: string
  slug: string
  authorUsername: string
}

type ProjectEditorProps = {
  projectId: string
  slug: string
  authorUsername: string
  initialData: ProjectFormData
  forkedFromId: string | null
  forkOrigin: ForkOrigin | null
}

const CONTEXT_MODES = [
  { label: 'None', value: '' },
  { label: 'Inline', value: 'inline' },
  { label: 'Composer', value: 'composer' },
  { label: 'Cursor Rule', value: 'cursor_rule' },
  { label: 'Terminal', value: 'terminal' },
  { label: 'Chat', value: 'chat' },
  { label: 'Cascade', value: 'cascade' },
]

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export const ProjectEditor = ({
  projectId,
  slug,
  authorUsername,
  initialData,
  forkedFromId,
  forkOrigin,
}: ProjectEditorProps) => {
  const router = useRouter()
  const [form, setForm] = useState<ProjectFormData>(initialData)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')

  const isFork = !!forkedFromId

  /* ================================================================ */
  /*  Field updaters                                                   */
  /* ================================================================ */

  const updateField = useCallback(
    <K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  /* ---- Tags ------------------------------------------------------ */
  const addTag = useCallback(
    (tag: string) => {
      const cleaned = tag.trim().toLowerCase()
      if (!cleaned || form.tags.includes(cleaned) || form.tags.length >= 10)
        return
      setForm((prev) => ({ ...prev, tags: [...prev.tags, cleaned] }))
      setTagInput('')
    },
    [form.tags]
  )

  const removeTag = useCallback((tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }, [])

  const handleTagKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag(tagInput)
      }
      if (e.key === 'Backspace' && !tagInput && form.tags.length > 0) {
        removeTag(form.tags[form.tags.length - 1])
      }
    },
    [tagInput, addTag, removeTag, form.tags]
  )

  /* ---- Steps ----------------------------------------------------- */
  const updateStep = useCallback(
    (index: number, key: keyof StepData, value: string | number | null) => {
      setForm((prev) => {
        const steps = [...prev.steps]
        steps[index] = { ...steps[index], [key]: value }
        return { ...prev, steps }
      })
    },
    []
  )

  const addStep = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          step_order: prev.steps.length + 1,
          title: '',
          prompt_text: '',
          context_mode: null,
          output_notes: '',
          tips: '',
          fork_note: '',
        },
      ],
    }))
  }, [])

  const removeStep = useCallback((index: number) => {
    setForm((prev) => {
      const steps = prev.steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, step_order: i + 1 }))
      return { ...prev, steps }
    })
  }, [])

  const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const steps = [...prev.steps]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= steps.length) return prev
      ;[steps[index], steps[targetIndex]] = [steps[targetIndex], steps[index]]
      return {
        ...prev,
        steps: steps.map((s, i) => ({ ...s, step_order: i + 1 })),
      }
    })
  }, [])

  /* ================================================================ */
  /*  Save / Publish                                                   */
  /* ================================================================ */

  const handleSave = useCallback(
    async (publish: boolean) => {
      if (saving || publishing) return
      setError(null)
      setSuccess(null)

      if (publish) {
        setPublishing(true)
      } else {
        setSaving(true)
      }

      try {
        // Basic client-side validation
        if (!form.title.trim()) throw new Error('Title is required')
        if (form.steps.length === 0)
          throw new Error('At least one step is required')
        if (form.steps.some((s) => !s.title.trim()))
          throw new Error('All steps need a title')

        const payload = {
          title: form.title.trim(),
          description: form.description.trim() || null,
          tool: form.tool,
          category: form.category,
          difficulty: form.difficulty || null,
          demo_url: form.demo_url.trim() || null,
          tags: form.tags,
          steps: form.steps.map((s) => ({
            step_order: s.step_order,
            title: s.title.trim(),
            prompt_text: s.prompt_text,
            context_mode: s.context_mode || null,
            output_notes: s.output_notes.trim() || null,
            tips: s.tips.trim() || null,
            fork_note: s.fork_note.trim() || null,
          })),
          is_published: publish,
        }

        const res = await fetch(`/api/projects/${projectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Failed to save')
        }

        if (publish) {
          setSuccess('Published! Your project is now in the review queue.')
          // Redirect to the project view after a short delay
          setTimeout(() => {
            router.push(`/@${authorUsername}/${slug}`)
          }, 1500)
        } else {
          setSuccess('Draft saved.')
          // Update form state to reflect saved draft
          setForm((prev) => ({ ...prev, is_published: false }))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setSaving(false)
        setPublishing(false)
      }
    },
    [
      form,
      saving,
      publishing,
      projectId,
      authorUsername,
      slug,
      router,
    ]
  )

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/*  Fork banner                                                  */}
      {/* ============================================================ */}
      {isFork && forkOrigin && (
        <div className="flex items-center gap-2 bg-[#3b82f6]/[0.06] border border-[#3b82f6]/15 rounded-lg px-4 py-3">
          <GitFork size={15} className="text-[#3b82f6]/60 shrink-0" />
          <p className="font-mono text-xs text-[#3b82f6]/70">
            You{"'"}re editing a remix of{' '}
            <Link
              href={`/@${forkOrigin.authorUsername}/${forkOrigin.slug}`}
              className="text-[#3b82f6] hover:underline"
            >
              @{forkOrigin.authorUsername}/{forkOrigin.title}
            </Link>
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Page header                                                  */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-lg md:text-xl font-bold tracking-tight">
          {isFork ? '// Edit Remix' : '// Edit Project'}
        </h1>
        <Link
          href={`/@${authorUsername}/${slug}`}
          className="font-mono text-xs text-[#e8e8ed]/30 hover:text-[#e8e8ed]/60 transition-colors"
        >
          View project →
        </Link>
      </div>

      {/* ============================================================ */}
      {/*  Status messages                                              */}
      {/* ============================================================ */}
      {error && (
        <div className="bg-red-500/[0.08] border border-red-500/20 rounded-lg px-4 py-3">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-[#3ddc84]/[0.08] border border-[#3ddc84]/20 rounded-lg px-4 py-3">
          <p className="font-mono text-xs text-[#3ddc84]">{success}</p>
        </div>
      )}

      {/* ============================================================ */}
      {/*  Project Details                                              */}
      {/* ============================================================ */}
      <section className="space-y-5">
        <h2 className="font-mono text-sm text-[#3ddc84]">
          {'// Project Details'}
        </h2>

        {/* Title */}
        <FieldGroup label="Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            maxLength={100}
            className="input-field"
            placeholder="My Awesome Project"
          />
        </FieldGroup>

        {/* Description */}
        <FieldGroup label="Description">
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            maxLength={2000}
            className="input-field resize-y min-h-[80px]"
            placeholder="Describe what this project does..."
          />
        </FieldGroup>

        {/* Row: Tool + Category + Difficulty */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FieldGroup label="Tool" required>
            <select
              value={form.tool}
              onChange={(e) => updateField('tool', e.target.value)}
              className="input-field"
            >
              {TOOLS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Category" required>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className="input-field"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </FieldGroup>

          <FieldGroup label="Difficulty">
            <select
              value={form.difficulty ?? ''}
              onChange={(e) =>
                updateField('difficulty', e.target.value || null)
              }
              className="input-field"
            >
              <option value="">Not set</option>
              {DIFFICULTIES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </FieldGroup>
        </div>

        {/* Demo URL */}
        <FieldGroup label="Demo URL" hint="Optional">
          <input
            type="url"
            value={form.demo_url}
            onChange={(e) => updateField('demo_url', e.target.value)}
            className="input-field"
            placeholder="https://example.com"
          />
        </FieldGroup>

        {/* Tags */}
        <FieldGroup label="Tags" hint={`${form.tags.length}/10`}>
          <div className="flex flex-wrap items-center gap-1.5 input-field min-h-[38px] !py-1.5">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#1c1c25] text-[#e8e8ed]/60"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-[#e8e8ed]/30 hover:text-red-400 transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className="flex-1 min-w-[100px] bg-transparent border-none outline-none font-mono text-xs text-[#e8e8ed]/80 placeholder:text-[#e8e8ed]/20"
              placeholder={form.tags.length === 0 ? 'Type and press Enter...' : ''}
              disabled={form.tags.length >= 10}
            />
          </div>
        </FieldGroup>
      </section>

      {/* ============================================================ */}
      {/*  Prompt Steps                                                 */}
      {/* ============================================================ */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-sm text-[#3ddc84]">
            {'// Prompt Steps'}{' '}
            <span className="text-[#e8e8ed]/30">({form.steps.length})</span>
          </h2>
        </div>

        <div className="space-y-4">
          {form.steps.map((step, index) => (
            <StepEditor
              key={index}
              step={step}
              index={index}
              total={form.steps.length}
              isFork={isFork}
              onUpdate={(key, value) => updateStep(index, key, value)}
              onRemove={() => removeStep(index)}
              onMove={(dir) => moveStep(index, dir)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addStep}
          className="flex items-center gap-1.5 font-mono text-xs px-4 py-2.5 rounded-md border border-dashed border-[#1c1c25] text-[#e8e8ed]/40 hover:border-[#3ddc84]/30 hover:text-[#3ddc84]/60 hover:bg-[#3ddc84]/[0.02] transition-colors w-full justify-center"
        >
          <Plus size={14} />
          Add Step
        </button>
      </section>

      {/* ============================================================ */}
      {/*  Action buttons                                               */}
      {/* ============================================================ */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#1c1c25]">
        <button
          type="button"
          disabled={saving || publishing}
          onClick={() => handleSave(false)}
          className="flex items-center gap-1.5 font-mono text-xs px-4 py-2.5 rounded-md border border-[#1c1c25] text-[#e8e8ed]/60 hover:border-[#2a2a35] hover:text-[#e8e8ed]/80 transition-colors disabled:opacity-40"
        >
          {saving ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Save size={14} />
          )}
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>

        <button
          type="button"
          disabled={saving || publishing}
          onClick={() => handleSave(true)}
          className="flex items-center gap-1.5 font-mono text-xs px-4 py-2.5 rounded-md bg-[#3ddc84] text-[#09090b] font-semibold hover:bg-[#3ddc84]/90 transition-colors disabled:opacity-40"
        >
          {publishing ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
          {publishing ? 'Publishing...' : 'Publish'}
        </button>

        <Link
          href={`/@${authorUsername}/${slug}`}
          className="ml-auto font-mono text-xs text-[#e8e8ed]/30 hover:text-[#e8e8ed]/60 transition-colors"
        >
          Cancel
        </Link>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  StepEditor                                                         */
/* ================================================================== */

const StepEditor = ({
  step,
  index,
  total,
  isFork,
  onUpdate,
  onRemove,
  onMove,
}: {
  step: StepData
  index: number
  total: number
  isFork: boolean
  onUpdate: (key: keyof StepData, value: string | number | null) => void
  onRemove: () => void
  onMove: (direction: 'up' | 'down') => void
}) => {
  const [confirmRemove, setConfirmRemove] = useState(false)

  return (
    <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg overflow-hidden">
      {/* Step header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1c1c25] bg-[#0a0a0d]">
        <span className="font-mono text-xs font-bold text-[#3ddc84]/70 w-6 text-center">
          {step.step_order}
        </span>

        <input
          type="text"
          value={step.title}
          onChange={(e) => onUpdate('title', e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-mono text-sm font-semibold text-[#e8e8ed]/80 placeholder:text-[#e8e8ed]/20"
          placeholder="Step title..."
        />

        {/* Reorder + delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove('up')}
            className="p-1 text-[#e8e8ed]/20 hover:text-[#e8e8ed]/60 transition-colors disabled:opacity-20"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMove('down')}
            className="p-1 text-[#e8e8ed]/20 hover:text-[#e8e8ed]/60 transition-colors disabled:opacity-20"
          >
            <ChevronDown size={14} />
          </button>
          <div className="w-px h-4 bg-[#1c1c25] mx-1" />
          {confirmRemove ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onRemove}
                className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setConfirmRemove(false)}
                className="font-mono text-[10px] px-2 py-0.5 text-[#e8e8ed]/30 hover:text-[#e8e8ed]/60 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="p-1 text-[#e8e8ed]/20 hover:text-red-400 transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Step body */}
      <div className="px-4 py-4 space-y-4">
        {/* Prompt text */}
        <div>
          <label className="block font-mono text-[10px] text-[#e8e8ed]/30 uppercase tracking-wider mb-1.5">
            Prompt
          </label>
          <textarea
            value={step.prompt_text}
            onChange={(e) => onUpdate('prompt_text', e.target.value)}
            rows={6}
            className="input-field font-mono text-[13px] resize-y min-h-[120px]"
            placeholder="The prompt you gave to the AI..."
          />
        </div>

        {/* Context mode */}
        <div className="max-w-[200px]">
          <label className="block font-mono text-[10px] text-[#e8e8ed]/30 uppercase tracking-wider mb-1.5">
            Context Mode
          </label>
          <select
            value={step.context_mode ?? ''}
            onChange={(e) =>
              onUpdate('context_mode', e.target.value || null)
            }
            className="input-field text-xs"
          >
            {CONTEXT_MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Output notes */}
        <div>
          <label className="block font-mono text-[10px] text-[#e8e8ed]/30 uppercase tracking-wider mb-1.5">
            Output Notes
          </label>
          <textarea
            value={step.output_notes}
            onChange={(e) => onUpdate('output_notes', e.target.value)}
            rows={2}
            className="input-field resize-y text-xs"
            placeholder="What did the AI produce?"
          />
        </div>

        {/* Tips */}
        <div>
          <label className="block font-mono text-[10px] text-[#e8e8ed]/30 uppercase tracking-wider mb-1.5">
            Tips
          </label>
          <textarea
            value={step.tips}
            onChange={(e) => onUpdate('tips', e.target.value)}
            rows={2}
            className="input-field resize-y text-xs"
            placeholder="Any gotchas or tips for this step?"
          />
        </div>

        {/* Fork note — only for forked projects */}
        {isFork && (
          <div>
            <label className="block font-mono text-[10px] text-[#3b82f6]/60 uppercase tracking-wider mb-1.5">
              Why did you change this step?
            </label>
            <textarea
              value={step.fork_note}
              onChange={(e) => onUpdate('fork_note', e.target.value)}
              rows={2}
              className="input-field resize-y text-xs !border-[#3b82f6]/15 focus:!border-[#3b82f6]/40 focus:!ring-[#3b82f6]/20"
              placeholder="Explain what you changed and why..."
            />
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  FieldGroup helper                                                  */
/* ================================================================== */

const FieldGroup = ({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="font-mono text-[10px] text-[#e8e8ed]/30 uppercase tracking-wider">
        {label}
        {required && <span className="text-[#3ddc84]/50 ml-0.5">*</span>}
      </label>
      {hint && (
        <span className="font-mono text-[10px] text-[#e8e8ed]/20">
          {hint}
        </span>
      )}
    </div>
    {children}
  </div>
)
