import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { projectUpdateSchema } from '@/lib/schemas/project'

/**
 * POST /api/projects — Create a brand-new project with steps and tags.
 */
export async function POST(request: Request) {
  try {
    /* ---- Auth check ------------------------------------------------ */
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

    /* ---- Validate body --------------------------------------------- */
    const body = await request.json()
    const parsed = projectUpdateSchema.safeParse(body)

    if (!parsed.success) {
      const errors = parsed.error.flatten()
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      tool,
      category,
      difficulty,
      demo_url,
      tags,
      steps,
      is_published,
    } = parsed.data

    /* ---- Generate unique slug -------------------------------------- */
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)

    let slug = baseSlug || 'project'
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts) {
      const { data: existing } = await supabase
        .from('projects')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (!existing) break

      const suffix = Math.random().toString(36).slice(2, 6)
      slug = `${baseSlug}-${suffix}`
      attempts++
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { error: 'Could not generate a unique slug. Try a different title.' },
        { status: 409 }
      )
    }

    /* ---- Create project row ---------------------------------------- */
    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert({
        author_id: user.id,
        title,
        slug,
        description: description || null,
        tool,
        category,
        difficulty: difficulty || null,
        demo_url: demo_url || null,
        is_published,
        is_approved: is_published, // auto-approve on publish
        import_method: 'session_export',
      })
      .select('id')
      .single()

    if (createError || !project) {
      return NextResponse.json(
        { error: createError?.message ?? 'Failed to create project' },
        { status: 500 }
      )
    }

    const projectId = project.id

    /* ---- Insert steps ---------------------------------------------- */
    const validModes = ['inline', 'composer', 'cursor_rule', 'terminal', 'chat', 'cascade']

    if (steps.length > 0) {
      const stepRows = steps.map((s) => ({
        project_id: projectId,
        step_order: s.step_order,
        title: s.title,
        prompt_text: s.prompt_text,
        context_mode: s.context_mode && validModes.includes(s.context_mode) ? s.context_mode : null,
        output_notes: s.output_notes || null,
        tips: s.tips || null,
        fork_note: s.fork_note || null,
      }))

      const { error: stepsError } = await supabase
        .from('prompt_steps')
        .insert(stepRows)

      if (stepsError) {
        // Clean up the project if steps fail
        await supabase.from('projects').delete().eq('id', projectId)
        return NextResponse.json(
          { error: 'Failed to save steps' },
          { status: 500 }
        )
      }
    }

    /* ---- Insert tags ----------------------------------------------- */
    if (tags.length > 0) {
      const tagRows = tags.map((t) => ({
        project_id: projectId,
        tag_name: t,
      }))

      const { error: tagsError } = await supabase
        .from('project_tags')
        .insert(tagRows)

      if (tagsError) {
        // Non-critical: project and steps were saved, just log
      }
    }

    /* ---- Fetch username for redirect ------------------------------- */
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()

    return NextResponse.json({
      id: projectId,
      slug,
      authorUsername: profile?.username ?? 'unknown',
    })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Something went wrong'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
