import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { pinComment, unpinComment } from '@/lib/queries/comments'

/* ================================================================== */
/*  Schema                                                             */
/* ================================================================== */

const pinSchema = z.object({
  commentId: z.string().uuid(),
  projectId: z.string().uuid(),
  action: z.enum(['pin', 'unpin']).default('pin'),
})

/* ================================================================== */
/*  POST — Pin or unpin a comment                                      */
/* ================================================================== */

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const parsed = pinSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { commentId, projectId, action } = parsed.data

    // Verify the current user is the project author
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, author_id')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (action === 'unpin') {
      await unpinComment(commentId, user.id, project.author_id)
    } else {
      await pinComment(commentId, projectId, user.id, project.author_id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Something went wrong'

    if (message.includes('Only the project author')) {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
