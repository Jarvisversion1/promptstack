import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { addComment, deleteComment } from '@/lib/queries/comments'

/* ================================================================== */
/*  Schemas                                                            */
/* ================================================================== */

const createCommentSchema = z.object({
  projectId: z.string().uuid(),
  body: z.string().min(1, 'Comment cannot be empty').max(2000),
  parentCommentId: z.string().uuid().nullable().optional().default(null),
})

const deleteCommentSchema = z.object({
  commentId: z.string().uuid(),
})

/* ================================================================== */
/*  POST — Create a comment                                            */
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
    const parsed = createCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { projectId, body: commentBody, parentCommentId } = parsed.data

    const comment = await addComment(
      projectId,
      user.id,
      commentBody,
      parentCommentId
    )

    return NextResponse.json(comment, { status: 201 })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/* ================================================================== */
/*  DELETE — Delete a comment                                          */
/* ================================================================== */

export async function DELETE(request: Request) {
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
    const parsed = deleteCommentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    await deleteComment(parsed.data.commentId, user.id)

    return NextResponse.json({ success: true })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Something went wrong'

    if (message.includes('only delete your own')) {
      return NextResponse.json({ error: message }, { status: 403 })
    }
    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
