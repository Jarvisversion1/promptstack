import { createClient } from '@/lib/supabase/server'
import type { ProjectWithDetails } from '@/types/project'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export type ForkedProject = ProjectWithDetails & {
  original_title: string | null
  original_author_username: string | null
}

export type UserStats = {
  totalProjects: number
  totalStars: number
  totalForks: number
}

/* ================================================================== */
/*  Supabase select strings                                            */
/* ================================================================== */

/** Card-level select for profile listings (same shape as projects.ts) */
const CARD_SELECT = `
  *,
  author:profiles!author_id(username, avatar_url),
  tags:project_tags(tag_name),
  prompt_steps(id)
`

/** Card-level select that also grabs the forked_from project info */
const FORKED_CARD_SELECT = `
  *,
  author:profiles!author_id(username, avatar_url),
  tags:project_tags(tag_name),
  prompt_steps(id),
  forked_from:projects!forked_from_id(title, author:profiles!author_id(username))
`

/** Select for starred projects (join through stars table) */
const STARRED_SELECT = `
  project:projects!project_id(
    *,
    author:profiles!author_id(username, avatar_url),
    tags:project_tags(tag_name),
    prompt_steps(id)
  )
`

/* ================================================================== */
/*  getProfileByUsername                                                */
/* ================================================================== */

/**
 * Fetches a single profile by username.
 * Returns null if not found.
 */
export async function getProfileByUsername(
  username: string
): Promise<Profile | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, bio, created_at')
      .eq('username', username)
      .single()

    if (error || !data) return null
    return data as Profile
  } catch {
    return null
  }
}

/* ================================================================== */
/*  getProjectsByAuthor                                                */
/* ================================================================== */

/**
 * Fetches all projects by an author.
 * - Own profile: returns everything (drafts, unapproved)
 * - Others: returns only published + approved
 */
export async function getProjectsByAuthor(
  authorId: string,
  viewerId: string | null
): Promise<ProjectWithDetails[]> {
  try {
    const supabase = await createClient()
    const isOwnProfile = viewerId === authorId

    let query = supabase
      .from('projects')
      .select(CARD_SELECT)
      .eq('author_id', authorId)

    if (!isOwnProfile) {
      query = query.eq('is_published', true).eq('is_approved', true)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error || !data) return []
    return transformCardProjects(data)
  } catch {
    return []
  }
}

/* ================================================================== */
/*  getForkedProjectsByUser                                            */
/* ================================================================== */

/**
 * Fetches published projects by a user that are forks of another project.
 * Includes the original project's title and author username.
 */
export async function getForkedProjectsByUser(
  userId: string
): Promise<ForkedProject[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select(FORKED_CARD_SELECT)
      .eq('author_id', userId)
      .eq('is_published', true)
      .eq('is_approved', true)
      .not('forked_from_id', 'is', null)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((p: any) => {
      const { prompt_steps, forked_from, ...rest } = p
      return {
        ...rest,
        author: p.author ?? { username: 'unknown', avatar_url: null },
        tags: p.tags ?? [],
        step_count: Array.isArray(prompt_steps) ? prompt_steps.length : 0,
        original_title: forked_from?.title ?? null,
        original_author_username: forked_from?.author?.username ?? null,
      }
    })
  } catch {
    return []
  }
}

/* ================================================================== */
/*  getStarredProjectsByUser                                           */
/* ================================================================== */

/**
 * Fetches all projects a user has starred, ordered by most recently starred.
 * Joins through the stars table → projects with author, tags, step count.
 */
export async function getStarredProjectsByUser(
  userId: string
): Promise<ProjectWithDetails[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('stars')
      .select(STARRED_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    // Each row is { project: { ... } } — unwrap and transform
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((row: any) => row.project)
      .filter(Boolean)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((p: any) => {
        const { prompt_steps, ...rest } = p
        return {
          ...rest,
          author: p.author ?? { username: 'unknown', avatar_url: null },
          tags: p.tags ?? [],
          step_count: Array.isArray(prompt_steps) ? prompt_steps.length : 0,
        }
      })
  } catch {
    return []
  }
}

/* ================================================================== */
/*  getUserStats                                                       */
/* ================================================================== */

/**
 * Returns aggregate stats for a user's published projects.
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('projects')
      .select('star_count, fork_count')
      .eq('author_id', userId)
      .eq('is_published', true)
      .eq('is_approved', true)

    if (error || !data) {
      return { totalProjects: 0, totalStars: 0, totalForks: 0 }
    }

    return {
      totalProjects: data.length,
      totalStars: data.reduce((sum, p) => sum + (p.star_count ?? 0), 0),
      totalForks: data.reduce((sum, p) => sum + (p.fork_count ?? 0), 0),
    }
  } catch {
    return { totalProjects: 0, totalStars: 0, totalForks: 0 }
  }
}

/* ================================================================== */
/*  Internal helpers                                                   */
/* ================================================================== */

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
