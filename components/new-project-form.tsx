'use client'

import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
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
  FileCode2,
} from 'lucide-react'
import { TOOLS, CATEGORIES, DIFFICULTIES, SUGGESTED_TAGS } from '@/lib/config/filters'
import { useToast } from '@/components/toast'

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
}

type ImportedStep = {
  step_order: number
  title: string
  prompt_text: string
  context_mode: string
  output_summary: string
  tips: string
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
/*  Auto-extract tech stack tags from step content                      */
/* ================================================================== */

const TAG_KEYWORDS: Record<string, string[]> = {
  nextjs: ['next.js', 'nextjs', 'next js', 'app router', 'next/'],
  react: ['react', 'jsx', 'tsx', 'usestate', 'useeffect', 'react-dom'],
  typescript: ['typescript', '.tsx', '.ts', 'type ', 'interface '],
  tailwind: ['tailwind', 'tailwindcss', 'className='],
  supabase: ['supabase', 'createclient', 'supabase.from'],
  prisma: ['prisma', 'prismaClient', '@prisma'],
  postgres: ['postgres', 'postgresql', 'pg_', 'psql'],
  mongodb: ['mongodb', 'mongoose', 'mongo'],
  python: ['python', '.py', 'pip install', 'flask', 'django', 'fastapi'],
  node: ['node.js', 'nodejs', 'npm ', 'package.json'],
  express: ['express', 'app.get', 'app.post', 'router.'],
  openai: ['openai', 'gpt-4', 'gpt-3', 'chatgpt', 'dall-e'],
  stripe: ['stripe', 'payment', 'checkout session'],
  firebase: ['firebase', 'firestore', 'firebase auth'],
  redis: ['redis', 'upstash'],
  docker: ['docker', 'dockerfile', 'docker-compose'],
  graphql: ['graphql', 'apollo', 'gql`'],
  vue: ['vue', 'vuejs', 'nuxt'],
  svelte: ['svelte', 'sveltekit'],
  aws: ['aws', 'lambda', 's3 bucket', 'dynamodb', 'ec2'],
  vercel: ['vercel', 'vercel.json', 'vercel deploy'],
  auth: ['auth', 'oauth', 'jwt', 'session', 'login'],
  saas: ['saas', 'subscription', 'billing', 'tenant'],
  ai: ['ai', 'llm', 'embedding', 'vector', 'langchain', 'rag'],
  'e-commerce': ['e-commerce', 'ecommerce', 'cart', 'product catalog', 'checkout'],
  testing: ['jest', 'vitest', 'cypress', 'playwright', 'test('],
  'ci-cd': ['ci/cd', 'github actions', 'pipeline', '.yml'],
  fastapi: ['fastapi', 'fast api', 'uvicorn'],
  flask: ['flask', 'from flask'],
  django: ['django', 'from django'],
  angular: ['angular', '@angular'],
  'react-native': ['react native', 'react-native', 'expo'],
  flutter: ['flutter', 'dart'],
  rust: ['rust', 'cargo', '.rs'],
  go: ['golang', ' go ', 'go.mod', 'go.sum'],
}

function extractTagsFromSteps(steps: ImportedStep[]): string[] {
  const allText = steps
    .map((s) => `${s.title} ${s.prompt_text} ${s.output_summary} ${s.tips}`)
    .join(' ')
    .toLowerCase()

  const found: string[] = []

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (keywords.some((kw) => allText.includes(kw.toLowerCase()))) {
      found.push(tag)
    }
  }

  // Cap at 10
  return found.slice(0, 10)
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export const NewProjectForm = () => {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [loaded, setLoaded] = useState(false)

  const [form, setForm] = useState<ProjectFormData>({
    title: '',
    description: '',
    tool: 'cursor',
    category: 'other',
    difficulty: null,
    demo_url: '',
    tags: [],
    steps: [
      {
        step_order: 1,
        title: '',
        prompt_text: '',
        context_mode: null,
        output_notes: '',
        tips: '',
        fork_note: '',
      },
    ],
  })

  /* ================================================================ */
  /*  Load imported steps from sessionStorage                          */
  /* ================================================================ */

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('promptstack_export')
      if (raw) {
        const imported: ImportedStep[] = JSON.parse(raw)
        if (Array.isArray(imported) && imported.length > 0) {
          const steps: StepData[] = imported.map((s, i) => ({
            step_order: i + 1,
            title: s.title || `Step ${i + 1}`,
            prompt_text: s.prompt_text || '',
            context_mode: s.context_mode || null,
            output_notes: s.output_summary || '',
            tips: s.tips || '',
            fork_note: '',
          }))

          // Auto-extract tags from step content
          const autoTags = extractTagsFromSteps(imported)

          setForm((prev) => ({
            ...prev,
            steps,
            tags: autoTags,
          }))

          // Clear sessionStorage so it doesn't reload on revisit
          sessionStorage.removeItem('promptstack_export')
        }
      }
    } catch {
      // sessionStorage unavailable or invalid data
    }
    setLoaded(true)
  }, [])

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
        // Client-side validation
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
            fork_note: null,
          })),
          is_published: publish,
        }

        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error ?? 'Failed to create project')
        }

        const result = await res.json()

        if (publish) {
          setSuccess('Published! Your project is now live on PromptStack.')
          toast('Project published!', 'success')
          setTimeout(() => {
            router.push(`/@${result.authorUsername}/${result.slug}`)
          }, 1500)
        } else {
          setSuccess('Draft saved!')
          toast('Draft saved', 'success')
          setTimeout(() => {
            router.push(
              `/@${result.authorUsername}/${result.slug}/edit`
            )
          }, 1000)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Something went wrong'
        setError(message)
        toast(message, 'error')
      } finally {
        setSaving(false)
        setPublishing(false)
      }
    },
    [form, saving, publishing, router, toast]
  )

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-[#3ddc84]/50" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ============================================================ */}
      {/*  Page header                                                  */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileCode2 size={20} className="text-[#3ddc84]" />
          <h1 className="font-mono text-lg md:text-xl font-bold tracking-tight">
            {'// New Project'}
          </h1>
        </div>
        <Link
          href="/export"
          className="font-mono text-xs text-[#e8e8ed]/30 hover:text-[#e8e8ed]/60 transition-colors"
        >
          Back to export
        </Link>
      </div>

      {form.steps.length > 1 && (
        <div className="flex items-center gap-2 bg-[#3ddc84]/[0.06] border border-[#3ddc84]/15 rounded-lg px-4 py-3">
          <FileCode2 size={15} className="text-[#3ddc84]/60 shrink-0" />
          <p className="font-mono text-xs text-[#3ddc84]/70">
            {form.steps.length} steps imported from your session export. Fill in
            the project details below and publish.
          </p>
        </div>
      )}

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
        <FieldGroup label="Stack / Tags" hint={`${form.tags.length}/10`}>
          <div className="flex flex-wrap items-center gap-1.5 input-field min-h-[38px] !py-1.5">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-[#3ddc84]/10 text-[#3ddc84]/70 border border-[#3ddc84]/15"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-[#3ddc84]/30 hover:text-red-400 transition-colors"
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
              placeholder={
                form.tags.length === 0
                  ? 'e.g. nextjs, react, tailwind — press Enter to add'
                  : 'Add another tag...'
              }
              disabled={form.tags.length >= 10}
            />
          </div>
          <p className="font-mono text-[10px] text-[#e8e8ed]/20 mt-1.5 pl-1">
            Add the tech stack and frameworks used in this project
          </p>
          {/* Suggested tags */}
          {form.tags.length < 10 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTED_TAGS.filter((t) => !form.tags.includes(t))
                .slice(0, 12)
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className="font-mono text-[10px] px-2 py-0.5 rounded border border-[#1c1c25] text-[#e8e8ed]/25 hover:border-[#3ddc84]/30 hover:text-[#3ddc84]/50 hover:bg-[#3ddc84]/[0.03] transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
            </div>
          )}
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
          href="/export"
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
  onUpdate,
  onRemove,
  onMove,
}: {
  step: StepData
  index: number
  total: number
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
