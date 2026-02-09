import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

export type CommentAuthor = {
  username: string
  display_name: string | null
  avatar_url: string | null
}

export type Comment = {
  id: string
  project_id: string
  user_id: string
  parent_comment_id: string | null
  body: string
  is_pinned: boolean
  created_at: string
  author: CommentAuthor
}

/* ================================================================== */
/*  Supabase select                                                    */
/* ================================================================== */

const COMMENT_SELECT = `
  id,
  project_id,
  user_id,
  parent_comment_id,
  body,
  is_pinned,
  created_at,
  author:profiles!user_id(username, display_name, avatar_url)
`

/* ================================================================== */
/*  getCommentsByProject                                               */
/* ================================================================== */

/**
 * Fetches all comments for a project, flat (frontend handles nesting).
 * Ordered by created_at asc so the conversation reads top-to-bottom.
 */
export async function getCommentsByProject(
  projectId: string
): Promise<Comment[]> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('comments')
      .select(COMMENT_SELECT)
      .eq('project_id', projectId)
      .order('created_at', { ascending: true })

    if (error || !data) return []

    return transformComments(data)
  } catch {
    return []
  }
}

/* ================================================================== */
/*  addComment                                                         */
/* ================================================================== */

/**
 * Inserts a new comment and returns it with author info.
 * The DB trigger handles incrementing comment_count on the project.
 */
export async function addComment(
  projectId: string,
  userId: string,
  body: string,
  parentCommentId: string | null
): Promise<Comment> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('comments')
    .insert({
      project_id: projectId,
      user_id: userId,
      body,
      parent_comment_id: parentCommentId,
    })
    .select(COMMENT_SELECT)
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to add comment')
  }

  return transformComment(data)
}

/* ================================================================== */
/*  deleteComment                                                      */
/* ================================================================== */

/**
 * Deletes a comment and syncs the project's comment_count.
 *
 * The FK constraint cascades deletes to replies, but the DB trigger only
 * fires for the explicitly deleted row. We use the admin client to
 * recount and correct the comment_count after deletion.
 */
export async function deleteComment(
  commentId: string,
  userId: string
): Promise<{ projectId: string }> {
  const supabase = await createClient()

  // Fetch comment to verify ownership and get project_id
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('id, user_id, project_id')
    .eq('id', commentId)
    .single()

  if (fetchError || !comment) {
    throw new Error('Comment not found')
  }

  if (comment.user_id !== userId) {
    throw new Error('You can only delete your own comments')
  }

  const projectId = comment.project_id

  // Delete the comment (FK CASCADE removes replies too)
  const { error: deleteError } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  // Recount and sync comment_count (handles cascade-deleted replies)
  await syncCommentCount(projectId)

  return { projectId }
}

/* ================================================================== */
/*  pinComment                                                         */
/* ================================================================== */

/**
 * Pins a comment on a project. Only the project author can pin.
 * Unpins any previously pinned comment first (one pin per project).
 * Uses the admin client to bypass RLS (project author != comment author).
 */
export async function pinComment(
  commentId: string,
  projectId: string,
  userId: string,
  projectAuthorId: string
): Promise<void> {
  if (userId !== projectAuthorId) {
    throw new Error('Only the project author can pin comments')
  }

  const admin = createAdminClient()

  // Verify the comment exists and belongs to this project
  const { data: comment, error: fetchError } = await admin
    .from('comments')
    .select('id')
    .eq('id', commentId)
    .eq('project_id', projectId)
    .single()

  if (fetchError || !comment) {
    throw new Error('Comment not found')
  }

  // Unpin all currently pinned comments on this project
  await admin
    .from('comments')
    .update({ is_pinned: false })
    .eq('project_id', projectId)
    .eq('is_pinned', true)

  // Pin the target comment
  const { error: pinError } = await admin
    .from('comments')
    .update({ is_pinned: true })
    .eq('id', commentId)

  if (pinError) {
    throw new Error(pinError.message)
  }
}

/**
 * Unpins a comment. Only the project author can unpin.
 */
export async function unpinComment(
  commentId: string,
  userId: string,
  projectAuthorId: string
): Promise<void> {
  if (userId !== projectAuthorId) {
    throw new Error('Only the project author can unpin comments')
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('comments')
    .update({ is_pinned: false })
    .eq('id', commentId)

  if (error) {
    throw new Error(error.message)
  }
}

/* ================================================================== */
/*  Internal helpers                                                   */
/* ================================================================== */

/**
 * Recount actual comments and update the project's comment_count.
 * Uses the admin client to bypass RLS on the projects table.
 */
async function syncCommentCount(projectId: string): Promise<void> {
  try {
    const admin = createAdminClient()

    const { count } = await admin
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', projectId)

    await admin
      .from('projects')
      .update({ comment_count: count ?? 0 })
      .eq('id', projectId)
  } catch {
    // Non-critical — the count will be slightly off until next sync
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformComment(raw: any): Comment {
  return {
    ...raw,
    author: raw.author ?? {
      username: 'unknown',
      display_name: null,
      avatar_url: null,
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformComments(data: any[]): Comment[] {
  return data.map(transformComment)
}
