import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const toggleStarSchema = z.object({
  projectId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = toggleStarSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { projectId } = parsed.data

    // Check if the project exists
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', projectId)
      .maybeSingle()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if star already exists
    const { data: existingStar } = await supabase
      .from('stars')
      .select('id')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .maybeSingle()

    const admin = createAdminClient()

    if (existingStar) {
      // Unstar — delete the star row
      const { error: deleteError } = await supabase
        .from('stars')
        .delete()
        .eq('user_id', user.id)
        .eq('project_id', projectId)

      if (deleteError) {
        return NextResponse.json(
          { error: 'Failed to unstar' },
          { status: 500 }
        )
      }

      // Decrement star_count (use admin to bypass RLS on projects)
      const { data: updated, error: updateError } = await admin
        .from('projects')
        .select('star_count')
        .eq('id', projectId)
        .single()

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to sync count' },
          { status: 500 }
        )
      }

      const newCount = Math.max((updated.star_count ?? 1) - 1, 0)

      await admin
        .from('projects')
        .update({ star_count: newCount })
        .eq('id', projectId)

      return NextResponse.json({ starred: false, count: newCount })
    } else {
      // Star — insert the star row
      const { error: insertError } = await supabase
        .from('stars')
        .insert({ user_id: user.id, project_id: projectId })

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to star' },
          { status: 500 }
        )
      }

      // Increment star_count (use admin to bypass RLS on projects)
      const { data: updated, error: updateError } = await admin
        .from('projects')
        .select('star_count')
        .eq('id', projectId)
        .single()

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to sync count' },
          { status: 500 }
        )
      }

      const newCount = (updated.star_count ?? 0) + 1

      await admin
        .from('projects')
        .update({ star_count: newCount })
        .eq('id', projectId)

      return NextResponse.json({ starred: true, count: newCount })
    }
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
