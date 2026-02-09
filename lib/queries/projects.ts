import { createClient } from '@/lib/supabase/server'
import type {
  ProjectDetail,
  ProjectWithDetails,
  ProjectReference,
} from '@/types/project'

/* ================================================================== */
/*  Supabase select strings                                            */
/* ================================================================== */

/** Select for the full project detail page */
const DETAIL_SELECT = `
  *,
  author:profiles!author_id(username, display_name, avatar_url),
  steps:prompt_steps(id, project_id, step_order, title, prompt_text, context_mode, output_notes, tips, screenshot_url, fork_note, created_at),
  tags:project_tags(tag_name)
`

/** Select for card-level listings */
const CARD_SELECT = `
  *,
  author:profiles!author_id(username, avatar_url),
  tags:project_tags(tag_name),
  prompt_steps(id)
`

/* ================================================================== */
/*  getProjectBySlug                                                   */
/* ================================================================== */

/**
 * Fetches a single project with all relations for the detail page.
 * RLS handles visibility — published+approved for everyone, all for the author.
 * Returns null when not found or when the username doesn't match the author.
 */
export async function getProjectBySlug(
  username: string,
  slug: string
): Promise<ProjectDetail | null> {
  try {
    const supabase = await createClient()

    const { data: project, error } = await supabase
      .from('projects')
      .select(DETAIL_SELECT)
      .eq('slug', slug)
      .single()

    if (error || !project) return null

    // Verify the URL username matches the actual author
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = project as any
    if (raw.author?.username !== username) return null

    // Fetch forked_from reference if it exists
    const forkedFrom = await fetchProjectReference(supabase, raw.forked_from_id)
    const inspiredBy = await fetchProjectReference(supabase, raw.inspired_by_id)

    // Sort steps by step_order
    const steps = Array.isArray(raw.steps)
      ? [...raw.steps].sort(
          (a: { step_order: number }, b: { step_order: number }) =>
            a.step_order - b.step_order
        )
      : []

    // Map tags to string[]
    const tags = Array.isArray(raw.tags)
      ? raw.tags.map((t: { tag_name: string }) => t.tag_name)
      : []

    return {
      ...raw,
      author: raw.author ?? { username: 'unknown', avatar_url: null },
      steps,
      tags,
      forked_from: forkedFrom,
      inspired_by: inspiredBy,
    } as ProjectDetail
  } catch {
    return null
  }
}

/* ================================================================== */
/*  getRelatedProjects                                                 */
/* ================================================================== */

/**
 * Fetches published projects that share the same tool or category,
 * excluding the current project. Used for "Related Projects" sidebar.
 */
export async function getRelatedProjects(
  projectId: string,
  tool: string,
  category: string,
  limit = 3
): Promise<ProjectWithDetails[]> {
  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('projects')
      .select(CARD_SELECT)
      .eq('is_published', true)
      .eq('is_approved', true)
      .neq('id', projectId)
      .or(`tool.eq.${tool},category.eq.${category}`)
      .order('star_count', { ascending: false })
      .limit(limit)

    return transformCardProjects(data)
  } catch {
    return []
  }
}

/* ================================================================== */
/*  isStarredByUser                                                    */
/* ================================================================== */

/**
 * Checks whether a user has starred a specific project.
 */
export async function isStarredByUser(
  projectId: string,
  userId: string
): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data } = await supabase
      .from('stars')
      .select('id')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .maybeSingle()

    return !!data
  } catch {
    return false
  }
}

/* ================================================================== */
/*  getProjectStarCount                                                */
/* ================================================================== */

/**
 * Returns the live star count for a project.
 * (The projects table caches this, but this queries the source of truth.)
 */
export async function getProjectStarCount(
  projectId: string
): Promise<number> {
  try {
    const supabase = await createClient()

    const { count } = await supabase
      .from('stars')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    return count ?? 0
  } catch {
    return 0
  }
}

/* ================================================================== */
/*  getProjects (explore / listing page)                               */
/* ================================================================== */

export type GetProjectsParams = {
  tool?: string | null
  category?: string | null
  difficulty?: string | null
  search?: string | null
  sort?: 'stars' | 'forks' | 'newest' | 'discussed'
  page?: number
  perPage?: number
}

export type GetProjectsResult = {
  projects: ProjectWithDetails[]
  totalCount: number
}

/**
 * Fetches a paginated, filterable, sortable list of published projects.
 * Used by the Explore page and any listing view.
 */
export async function getProjects({
  tool = null,
  category = null,
  difficulty = null,
  search = null,
  sort = 'newest',
  page = 1,
  perPage = 12,
}: GetProjectsParams = {}): Promise<GetProjectsResult> {
  try {
    const supabase = await createClient()

    /* ---------------------------------------------------------------- */
    /*  Base query — published & approved only                           */
    /* ---------------------------------------------------------------- */
    let query = supabase
      .from('projects')
      .select(CARD_SELECT, { count: 'exact' })
      .eq('is_published', true)
      .eq('is_approved', true)

    /* ---------------------------------------------------------------- */
    /*  Conditional filters                                              */
    /* ---------------------------------------------------------------- */
    if (tool) {
      query = query.eq('tool', tool)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty)
    }

    if (search) {
      // Use ilike for partial matching on title OR description
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%`
      )
    }

    /* ---------------------------------------------------------------- */
    /*  Sort order                                                       */
    /* ---------------------------------------------------------------- */
    switch (sort) {
      case 'stars':
        query = query.order('star_count', { ascending: false })
        break
      case 'forks':
        query = query.order('fork_count', { ascending: false })
        break
      case 'discussed':
        query = query.order('comment_count', { ascending: false })
        break
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }

    // Secondary sort for stable ordering
    query = query.order('id', { ascending: false })

    /* ---------------------------------------------------------------- */
    /*  Pagination                                                       */
    /* ---------------------------------------------------------------- */
    const from = (page - 1) * perPage
    const to = from + perPage - 1
    query = query.range(from, to)

    /* ---------------------------------------------------------------- */
    /*  Execute                                                          */
    /* ---------------------------------------------------------------- */
    const { data, count, error } = await query

    if (error) return { projects: [], totalCount: 0 }

    return {
      projects: transformCardProjects(data),
      totalCount: count ?? 0,
    }
  } catch {
    return { projects: [], totalCount: 0 }
  }
}

/* ================================================================== */
/*  forkProject                                                        */
/* ================================================================== */

export type ForkResult = {
  id: string
  slug: string
  authorUsername: string
}

/**
 * Generates a random alphanumeric suffix for fork slugs.
 */
function randomSuffix(len = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}

/**
 * Creates a fork of an existing project for the given user.
 *
 * - Copies the project row (as draft), all prompt_steps, and all project_tags
 * - Sets forked_from_id and inspired_by_id to the original
 * - Generates a unique slug with a random suffix
 * - Increments fork_count on the original project
 * - Cleans up on failure
 */
export async function forkProject(
  originalProjectId: string,
  userId: string
): Promise<ForkResult> {
  const supabase = await createClient()

  /* ---------------------------------------------------------------- */
  /*  1. Fetch original project with steps and tags                    */
  /* ---------------------------------------------------------------- */
  const { data: original, error: fetchError } = await supabase
    .from('projects')
    .select(
      `
      *,
      steps:prompt_steps(step_order, title, prompt_text, context_mode, output_notes, tips),
      tags:project_tags(tag_name)
    `
    )
    .eq('id', originalProjectId)
    .eq('is_published', true)
    .eq('is_approved', true)
    .single()

  if (fetchError || !original) {
    throw new Error('Project not found or not available for forking')
  }

  /* ---------------------------------------------------------------- */
  /*  2. Fetch the forking user's username                             */
  /* ---------------------------------------------------------------- */
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    throw new Error('User profile not found')
  }

  /* ---------------------------------------------------------------- */
  /*  3. Generate a unique slug                                        */
  /* ---------------------------------------------------------------- */
  const baseSlug = original.slug
  let newSlug = ''
  let attempts = 0
  const MAX_ATTEMPTS = 10

  while (attempts < MAX_ATTEMPTS) {
    newSlug = `${baseSlug}-${randomSuffix()}`
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('slug', newSlug)
      .maybeSingle()

    if (!existing) break
    attempts++
  }

  if (attempts >= MAX_ATTEMPTS) {
    throw new Error('Could not generate a unique slug')
  }

  /* ---------------------------------------------------------------- */
  /*  4. Insert the new project                                        */
  /* ---------------------------------------------------------------- */
  const { data: newProject, error: insertError } = await supabase
    .from('projects')
    .insert({
      author_id: userId,
      title: original.title,
      slug: newSlug,
      description: original.description,
      tool: original.tool,
      category: original.category,
      difficulty: original.difficulty,
      is_published: false,
      is_approved: false,
      forked_from_id: originalProjectId,
      inspired_by_id: originalProjectId,
      import_method: 'manual',
      star_count: 0,
      fork_count: 0,
      comment_count: 0,
    })
    .select('id, slug')
    .single()

  if (insertError || !newProject) {
    throw new Error(insertError?.message ?? 'Failed to create forked project')
  }

  const newProjectId = newProject.id

  /* ---------------------------------------------------------------- */
  /*  5. Copy prompt steps                                             */
  /* ---------------------------------------------------------------- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const steps = Array.isArray((original as any).steps)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (original as any).steps
    : []

  if (steps.length > 0) {
    const stepRows = steps.map(
      (s: {
        step_order: number
        title: string
        prompt_text: string
        context_mode: string | null
        output_notes: string | null
        tips: string | null
      }) => ({
        project_id: newProjectId,
        step_order: s.step_order,
        title: s.title,
        prompt_text: s.prompt_text,
        context_mode: s.context_mode,
        output_notes: s.output_notes,
        tips: s.tips,
        fork_note: null,
      })
    )

    const { error: stepsError } = await supabase
      .from('prompt_steps')
      .insert(stepRows)

    if (stepsError) {
      // Cleanup: delete the new project (cascade will clean up)
      await supabase.from('projects').delete().eq('id', newProjectId)
      throw new Error('Failed to copy prompt steps')
    }
  }

  /* ---------------------------------------------------------------- */
  /*  6. Copy tags                                                     */
  /* ---------------------------------------------------------------- */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tags = Array.isArray((original as any).tags)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? (original as any).tags
    : []

  if (tags.length > 0) {
    const tagRows = tags.map((t: { tag_name: string }) => ({
      project_id: newProjectId,
      tag_name: t.tag_name,
    }))

    const { error: tagsError } = await supabase
      .from('project_tags')
      .insert(tagRows)

    if (tagsError) {
      // Cleanup
      await supabase.from('projects').delete().eq('id', newProjectId)
      throw new Error('Failed to copy tags')
    }
  }

  /* ---------------------------------------------------------------- */
  /*  7. fork_count on the original is handled by the DB trigger       */
  /*     (update_fork_count fires on INSERT when forked_from_id set)   */
  /* ---------------------------------------------------------------- */

  return {
    id: newProjectId,
    slug: newSlug,
    authorUsername: profile.username,
  }
}

/* ================================================================== */
/*  getProjectsByUser (for export "append" flow)                       */
/* ================================================================== */

export type UserProjectSummary = {
  id: string
  title: string
  slug: string
  step_count: number
  updated_at: string
}

/**
 * Fetches all projects belonging to a user (published + drafts).
 * Used on the export page to let users append steps to an existing project.
 */
export async function getProjectsByUser(
  userId: string
): Promise<UserProjectSummary[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select('id, title, slug, updated_at, steps:prompt_steps(id)')
      .eq('author_id', userId)
      .order('updated_at', { ascending: false })

    if (error || !data) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      step_count: Array.isArray(p.steps) ? p.steps.length : 0,
      updated_at: p.updated_at,
    }))
  } catch {
    return []
  }
}

/* ================================================================== */
/*  appendStepsToProject                                               */
/* ================================================================== */

export type AppendStepsResult = {
  success: true
  totalSteps: number
}

/**
 * Appends new exported steps to an existing project.
 * Verifies the user is the project author, finds the current max step_order,
 * and inserts new steps starting from max_step_order + 1.
 */
export async function appendStepsToProject(
  projectId: string,
  userId: string,
  newSteps: { title: string; prompt_text: string; context_mode: string; output_summary: string; tips?: string }[]
): Promise<AppendStepsResult> {
  const supabase = await createClient()

  // 1. Verify ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, author_id')
    .eq('id', projectId)
    .single()

  if (projectError || !project) {
    throw new Error('Project not found')
  }

  if (project.author_id !== userId) {
    throw new Error('Not authorized')
  }

  // 2. Get current max step_order
  const { data: existingSteps } = await supabase
    .from('prompt_steps')
    .select('step_order')
    .eq('project_id', projectId)
    .order('step_order', { ascending: false })
    .limit(1)

  const maxOrder = existingSteps?.[0]?.step_order ?? 0

  // 3. Insert new steps
  const stepRows = newSteps.map((s, i) => ({
    project_id: projectId,
    step_order: maxOrder + i + 1,
    title: s.title,
    prompt_text: s.prompt_text,
    context_mode: s.context_mode,
    output_notes: s.output_summary || null,
    tips: s.tips || null,
    fork_note: null,
  }))

  const { error: insertError } = await supabase
    .from('prompt_steps')
    .insert(stepRows)

  if (insertError) {
    throw new Error('Failed to insert steps')
  }

  // 4. Touch the updated_at timestamp
  await supabase
    .from('projects')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', projectId)

  // 5. Get new total
  const { count } = await supabase
    .from('prompt_steps')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)

  return { success: true, totalSteps: count ?? maxOrder + newSteps.length }
}

/* ================================================================== */
/*  Internal helpers                                                   */
/* ================================================================== */

/**
 * Fetches the title, slug, and author username for a project reference
 * (used for forked_from and inspired_by links).
 */
async function fetchProjectReference(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  projectId: string | null
): Promise<ProjectReference | null> {
  if (!projectId) return null

  try {
    const { data } = await supabase
      .from('projects')
      .select('title, slug, author:profiles!author_id(username)')
      .eq('id', projectId)
      .single()

    if (!data) return null

    return {
      title: data.title,
      slug: data.slug,
      author_username: data.author?.username ?? 'unknown',
    }
  } catch {
    return null
  }
}

/**
 * Transforms raw Supabase card-level rows into typed ProjectWithDetails[].
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformCardProjects(data: any[] | null): ProjectWithDetails[] {
  if (!data) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((p: any) => {
    const { prompt_steps, ...rest } = p
    return {
      ...rest,
      author: p.author ?? { username: 'unknown', avatar_url: null },
      tags: p.tags ?? [],
      step_count: Array.isArray(prompt_steps) ? prompt_steps.length : 0,
    }
  })
}
