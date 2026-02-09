'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Pin, Trash2, Reply, Loader2, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/toast'
import type { Comment } from '@/lib/queries/comments'
import type { User } from '@supabase/supabase-js'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type CommentsSectionProps = {
  projectId: string
  projectAuthorId: string
  initialComments: Comment[]
}

type CommentNode = Comment & {
  replies: Comment[]
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function formatRelativeTime(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  )
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

/** Build a tree: top-level comments with nested replies. */
function buildTree(comments: Comment[]): CommentNode[] {
  const topLevel: CommentNode[] = []
  const replyMap = new Map<string, Comment[]>()

  for (const c of comments) {
    if (c.parent_comment_id) {
      const existing = replyMap.get(c.parent_comment_id) ?? []
      existing.push(c)
      replyMap.set(c.parent_comment_id, existing)
    }
  }

  // Pinned first, then chronological
  const sorted = [...comments].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  })

  for (const c of sorted) {
    if (!c.parent_comment_id) {
      topLevel.push({ ...c, replies: replyMap.get(c.id) ?? [] })
    }
  }

  return topLevel
}

/* ================================================================== */
/*  Main Component                                                     */
/* ================================================================== */

export const CommentsSection = ({
  projectId,
  projectAuthorId,
  initialComments,
}: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [user, setUser] = useState<User | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoadingUser(false)
    })
  }, [])

  const tree = buildTree(comments)
  const totalCount = comments.length

  /* ---- Add comment optimistically -------------------------------- */
  const handleAddComment = useCallback(
    async (body: string, parentCommentId: string | null) => {
      if (!user) return

      // Optimistic comment
      const optimistic: Comment = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        user_id: user.id,
        parent_comment_id: parentCommentId,
        body,
        is_pinned: false,
        created_at: new Date().toISOString(),
        author: {
          username:
            user.user_metadata.user_name ??
            user.user_metadata.preferred_username ??
            'you',
          display_name: user.user_metadata.full_name ?? null,
          avatar_url: user.user_metadata.avatar_url ?? null,
        },
      }

      setComments((prev) => [...prev, optimistic])

      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, body, parentCommentId }),
        })

        if (!res.ok) throw new Error('Failed')

        const real = await res.json()
        // Replace optimistic with real
        setComments((prev) =>
          prev.map((c) => (c.id === optimistic.id ? real : c))
        )
        toast('Comment posted', 'success')
      } catch {
        // Rollback
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id))
        toast('Failed to post comment', 'error')
      }
    },
    [user, projectId, toast]
  )

  /* ---- Delete comment -------------------------------------------- */
  const handleDelete = useCallback(
    async (commentId: string) => {
      // Optimistic: remove comment and its replies
      const backup = comments
      setComments((prev) =>
        prev.filter(
          (c) => c.id !== commentId && c.parent_comment_id !== commentId
        )
      )

      try {
        const res = await fetch('/api/comments', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commentId }),
        })

        if (!res.ok) throw new Error('Failed')
        toast('Comment deleted', 'success')
      } catch {
        setComments(backup)
        toast('Failed to delete comment', 'error')
      }
    },
    [comments, toast]
  )

  /* ---- Pin / Unpin ----------------------------------------------- */
  const handlePin = useCallback(
    async (commentId: string, action: 'pin' | 'unpin') => {
      // Optimistic
      setComments((prev) =>
        prev.map((c) => {
          if (action === 'pin') {
            // Unpin all, pin the target
            if (c.id === commentId) return { ...c, is_pinned: true }
            if (c.is_pinned) return { ...c, is_pinned: false }
            return c
          }
          // Unpin
          if (c.id === commentId) return { ...c, is_pinned: false }
          return c
        })
      )

      try {
        const res = await fetch('/api/comments/pin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commentId, projectId, action }),
        })

        if (!res.ok) throw new Error('Failed')
      } catch {
        // Refetch on error
        setComments(initialComments)
        toast('Failed to update pin', 'error')
      }
    },
    [projectId, initialComments, toast]
  )

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <section>
      <h2 className="font-mono text-sm text-[#3ddc84] mb-6">
        {'// Comments'}{' '}
        <span className="text-[#e8e8ed]/30">({totalCount})</span>
      </h2>

      {/* Comment form */}
      {loadingUser ? (
        <div className="h-20 bg-[#0c0c0f] border border-[#1c1c25] rounded-lg animate-pulse mb-6" />
      ) : user ? (
        <CommentForm
          user={user}
          onSubmit={(body) => handleAddComment(body, null)}
          placeholder="Share your experience with this workflow..."
        />
      ) : (
        <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg px-5 py-4 mb-6">
          <p className="font-mono text-xs text-[#e8e8ed]/30">
            <Link
              href="/login"
              className="text-[#3ddc84]/70 hover:text-[#3ddc84] transition-colors"
            >
              Sign in
            </Link>{' '}
            to join the conversation.
          </p>
        </div>
      )}

      {/* Comments list */}
      {tree.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center">
          <MessageSquare size={24} className="text-[#e8e8ed]/10 mb-3" />
          <p className="font-mono text-xs text-[#e8e8ed]/25">
            No comments yet. Be the first to share your thoughts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tree.map((node) => (
            <div key={node.id}>
              <CommentCard
                comment={node}
                currentUserId={user?.id ?? null}
                projectAuthorId={projectAuthorId}
                onDelete={handleDelete}
                onPin={handlePin}
                onReply={(body) => handleAddComment(body, node.id)}
              />

              {/* Replies */}
              {node.replies.length > 0 && (
                <div className="ml-6 md:ml-10 border-l-2 border-[#1c1c25] pl-4 mt-2 space-y-2">
                  {node.replies.map((reply) => (
                    <CommentCard
                      key={reply.id}
                      comment={reply}
                      currentUserId={user?.id ?? null}
                      projectAuthorId={projectAuthorId}
                      onDelete={handleDelete}
                      onPin={handlePin}
                      isReply
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* ================================================================== */
/*  CommentForm                                                        */
/* ================================================================== */

const CommentForm = ({
  user,
  onSubmit,
  placeholder,
  compact,
  onCancel,
}: {
  user: User
  onSubmit: (body: string) => Promise<void>
  placeholder: string
  compact?: boolean
  onCancel?: () => void
}) => {
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!body.trim() || submitting) return
    setSubmitting(true)
    await onSubmit(body.trim())
    setBody('')
    setSubmitting(false)
  }

  const avatarUrl = user.user_metadata.avatar_url
  const username =
    user.user_metadata.user_name ??
    user.user_metadata.preferred_username ??
    'U'

  return (
    <div className={`flex gap-3 ${compact ? 'mb-2' : 'mb-6'}`}>
      {/* Avatar */}
      {!compact && (
        <div className="shrink-0 pt-1">
          {avatarUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={avatarUrl}
              alt={username}
              width={28}
              height={28}
              className="w-7 h-7 rounded-full"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#3ddc84] flex items-center justify-center">
              <span className="font-mono text-[#09090b] text-[10px] font-bold">
                {username[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={compact ? 2 : 3}
          maxLength={2000}
          placeholder={placeholder}
          className={`w-full font-mono bg-[#0c0c0f] border border-[#1c1c25] rounded-lg px-4 py-3 text-[#e8e8ed]/80 placeholder:text-[#e8e8ed]/20 focus:outline-none focus:border-[#3ddc84]/40 focus:ring-1 focus:ring-[#3ddc84]/20 transition-colors resize-none ${
            compact ? 'text-xs' : 'text-[13px]'
          }`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-[10px] text-[#e8e8ed]/15">
            Cmd+Enter to submit
          </span>
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="font-mono text-[11px] px-2.5 py-1 text-[#e8e8ed]/30 hover:text-[#e8e8ed]/60 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              disabled={!body.trim() || submitting}
              onClick={handleSubmit}
              className="flex items-center gap-1 font-mono text-[11px] px-3 py-1.5 rounded-md bg-[#3ddc84] text-[#09090b] font-semibold hover:bg-[#3ddc84]/90 transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              {submitting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Send size={11} />
              )}
              {compact ? 'Reply' : 'Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  CommentCard                                                        */
/* ================================================================== */

const CommentCard = ({
  comment,
  currentUserId,
  projectAuthorId,
  onDelete,
  onPin,
  onReply,
  isReply,
}: {
  comment: Comment
  currentUserId: string | null
  projectAuthorId: string
  onDelete: (id: string) => Promise<void>
  onPin: (id: string, action: 'pin' | 'unpin') => Promise<void>
  onReply?: (body: string) => Promise<void>
  isReply?: boolean
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const isOwn = currentUserId === comment.user_id
  const isProjectAuthor = currentUserId === projectAuthorId
  const timeAgo = formatRelativeTime(comment.created_at)

  // Fetch user object for reply form
  useEffect(() => {
    if (showReplyForm && !user) {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }
  }, [showReplyForm, user])

  return (
    <div
      className={`bg-[#0c0c0f] border border-[#1c1c25] rounded-lg ${
        isReply ? 'px-4 py-3' : 'px-5 py-4'
      } ${comment.is_pinned ? 'border-[#3ddc84]/15' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {/* Avatar */}
        {comment.author.avatar_url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={comment.author.avatar_url}
            alt={comment.author.username}
            width={isReply ? 22 : 28}
            height={isReply ? 22 : 28}
            className={`rounded-full shrink-0 ${isReply ? 'w-[22px] h-[22px]' : 'w-7 h-7'}`}
          />
        ) : (
          <div
            className={`rounded-full bg-[#3ddc84] flex items-center justify-center shrink-0 ${
              isReply ? 'w-[22px] h-[22px]' : 'w-7 h-7'
            }`}
          >
            <span
              className={`font-mono text-[#09090b] font-bold ${
                isReply ? 'text-[9px]' : 'text-[10px]'
              }`}
            >
              {comment.author.username[0]?.toUpperCase()}
            </span>
          </div>
        )}

        <Link
          href={`/@${comment.author.username}`}
          className="font-mono text-xs text-[#e8e8ed]/50 hover:text-[#3ddc84] transition-colors"
        >
          @{comment.author.username}
        </Link>

        {comment.user_id === projectAuthorId && (
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#3ddc84]/10 text-[#3ddc84]/60">
            author
          </span>
        )}

        <span className="font-mono text-[10px] text-[#e8e8ed]/20">
          {timeAgo}
        </span>

        {comment.is_pinned && (
          <span className="flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded bg-[#3ddc84]/10 text-[#3ddc84]/60 ml-auto">
            <Pin size={9} />
            Pinned
          </span>
        )}
      </div>

      {/* Body */}
      <div
        className={`font-mono leading-relaxed text-[#e8e8ed]/70 whitespace-pre-wrap ${
          isReply ? 'text-xs' : 'text-[13px]'
        }`}
      >
        {comment.body}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-3">
        {/* Reply — only on top-level comments */}
        {!isReply && onReply && currentUserId && (
          <button
            type="button"
            onClick={() => setShowReplyForm((p) => !p)}
            className="flex items-center gap-1 font-mono text-[10px] text-[#e8e8ed]/25 hover:text-[#e8e8ed]/60 transition-colors"
          >
            <Reply size={11} />
            Reply
          </button>
        )}

        {/* Delete — comment author only */}
        {isOwn && !confirmDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1 font-mono text-[10px] text-[#e8e8ed]/25 hover:text-red-400 transition-colors"
          >
            <Trash2 size={11} />
            Delete
          </button>
        )}

        {isOwn && confirmDelete && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-[#e8e8ed]/30">
              Delete this comment?
            </span>
            <button
              type="button"
              onClick={() => {
                onDelete(comment.id)
                setConfirmDelete(false)
              }}
              className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="font-mono text-[10px] text-[#e8e8ed]/30 hover:text-[#e8e8ed]/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Pin/Unpin — project author only */}
        {isProjectAuthor && !isOwn && (
          <button
            type="button"
            onClick={() =>
              onPin(comment.id, comment.is_pinned ? 'unpin' : 'pin')
            }
            className="flex items-center gap-1 font-mono text-[10px] text-[#e8e8ed]/25 hover:text-[#3ddc84]/70 transition-colors"
          >
            <Pin size={11} />
            {comment.is_pinned ? 'Unpin' : 'Pin'}
          </button>
        )}
      </div>

      {/* Inline reply form */}
      {showReplyForm && onReply && user && (
        <div className="mt-3 pt-3 border-t border-[#1c1c25]">
          <CommentForm
            user={user}
            onSubmit={async (body) => {
              await onReply(body)
              setShowReplyForm(false)
            }}
            placeholder="Write a reply..."
            compact
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}
    </div>
  )
}
