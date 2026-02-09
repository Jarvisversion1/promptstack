import { z } from 'zod'

/* ================================================================== */
/*  Step schema                                                        */
/* ================================================================== */

export const stepSchema = z.object({
  step_order: z.number().int().min(1),
  title: z.string().min(1, 'Step title is required').max(200),
  prompt_text: z.string(), // allow empty for screenshot-only steps
  context_mode: z
    .enum(['inline', 'composer', 'cursor_rule', 'terminal', 'chat', 'cascade'])
    .nullable()
    .default(null),
  output_notes: z.string().max(2000).nullable().default(null),
  tips: z.string().max(2000).nullable().default(null),
  fork_note: z.string().max(2000).nullable().default(null),
})

export type StepInput = z.infer<typeof stepSchema>

/* ================================================================== */
/*  Project update schema                                              */
/* ================================================================== */

export const projectUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(2000).nullable().default(null),
  tool: z.enum([
    'cursor',
    'windsurf',
    'bolt',
    'lovable',
    'claude',
    'replit',
    'other',
  ]),
  category: z.enum([
    'landing-page',
    'dashboard',
    'api',
    'mobile-app',
    'cli-tool',
    'chrome-extension',
    'full-stack-app',
    'component',
    'other',
  ]),
  difficulty: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .nullable()
    .default(null),
  demo_url: z.string().url().max(500).nullable().default(null).or(z.literal('')),
  tags: z.array(z.string().min(1).max(50)).max(10).default([]),
  steps: z.array(stepSchema).min(1, 'At least one step is required'),
  is_published: z.boolean(),
})

export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
