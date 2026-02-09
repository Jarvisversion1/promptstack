import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { projectUpdateSchema } from '@/lib/schemas/project'

type RouteContext = { params: Promise<{ id: string }> }

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id: projectId } = await context.params

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

    /* ---- Verify ownership ---------------------------------------- */
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('id, author_id, slug')
      .eq('id', projectId)
      .single()

    if (fetchError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    if (project.author_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own projects' },
        { status: 403 }
      )
    }

    /* ---- Validate body ------------------------------------------- */
    const body = await request.json()
    const parsed = projectUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten()
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { title, description, tool, category, difficulty, demo_url, tags, steps, is_published } =
      parsed.data

    /* ---- Update project row -------------------------------------- */
    const { error: updateError } = await supabase
      .from('projects')
      .update({
        title,
        description: description || null,
        tool,
        category,
        difficulty,
        demo_url: demo_url || null,
        is_published,
        // is_approved stays as-is (only admins change this)
      })
      .eq('id', projectId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    /* ---- Replace steps ------------------------------------------- */
    // Delete all existing steps, then re-insert
    const { error: deleteStepsError } = await supabase
      .from('prompt_steps')
      .delete()
      .eq('project_id', projectId)

    if (deleteStepsError) {
      return NextResponse.json(
        { error: 'Failed to update steps' },
        { status: 500 }
      )
    }

    if (steps.length > 0) {
      const stepRows = steps.map((s) => ({
        project_id: projectId,
        step_order: s.step_order,
        title: s.title,
        prompt_text: s.prompt_text,
        context_mode: s.context_mode,
        output_notes: s.output_notes || null,
        tips: s.tips || null,
        fork_note: s.fork_note || null,
      }))

      const { error: insertStepsError } = await supabase
        .from('prompt_steps')
        .insert(stepRows)

      if (insertStepsError) {
        return NextResponse.json(
          { error: 'Failed to save steps' },
          { status: 500 }
        )
      }
    }

    /* ---- Replace tags -------------------------------------------- */
    const { error: deleteTagsError } = await supabase
      .from('project_tags')
      .delete()
      .eq('project_id', projectId)

    if (deleteTagsError) {
      return NextResponse.json(
        { error: 'Failed to update tags' },
        { status: 500 }
      )
    }

    if (tags.length > 0) {
      const tagRows = tags.map((t) => ({
        project_id: projectId,
        tag_name: t,
      }))

      const { error: insertTagsError } = await supabase
        .from('project_tags')
        .insert(tagRows)

      if (insertTagsError) {
        return NextResponse.json(
          { error: 'Failed to save tags' },
          { status: 500 }
        )
      }
    }

    /* ---- Fetch username for redirect info ------------------------ */
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      id: projectId,
      slug: project.slug,
      authorUsername: profile?.username ?? 'unknown',
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
