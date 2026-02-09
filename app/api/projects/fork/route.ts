import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { forkProject } from '@/lib/queries/projects'

export async function POST(request: Request) {
  try {
    /* ---- Auth check ---------------------------------------------- */
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

    /* ---- Parse body ---------------------------------------------- */
    const body = await request.json()
    const projectId = body?.projectId

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      )
    }

    /* ---- Fork ---------------------------------------------------- */
    const result = await forkProject(projectId, user.id)

    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Something went wrong'

    // Map known messages to HTTP status codes
    if (message.includes('not found') || message.includes('not available')) {
      return NextResponse.json({ error: message }, { status: 404 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
