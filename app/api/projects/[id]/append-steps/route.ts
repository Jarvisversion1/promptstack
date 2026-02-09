import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { appendStepsToProject } from '@/lib/queries/projects'

const stepSchema = z.object({
  title: z.string().min(1),
  prompt_text: z.string(),
  context_mode: z.string(),
  output_summary: z.string(),
  tips: z.string().optional().default(''),
})

const bodySchema = z.object({
  steps: z.array(stepSchema).min(1),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: projectId } = await params

    const body = await request.json()
    const parsed = bodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await appendStepsToProject(
      projectId,
      user.id,
      parsed.data.steps
    )

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    const status = message === 'Not authorized' ? 403 : message === 'Project not found' ? 404 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
