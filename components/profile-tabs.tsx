'use client'

import { useCallback, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Compass, Pencil, Trash2, Loader2 } from 'lucide-react'
import { ProjectCard } from '@/components/project-card'
import { useToast } from '@/components/toast'
import type { ProjectWithDetails } from '@/types/project'
import type { ForkedProject } from '@/lib/queries/profiles'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type TabId = 'projects' | 'remixes' | 'starred'

type ProfileTabsProps = {
  username: string
  isOwnProfile: boolean
  projects: ProjectWithDetails[]
  remixes: ForkedProject[]
  starred: ProjectWithDetails[]
}

/* ================================================================== */
/*  Tab config                                                         */
/* ================================================================== */

function getTabs(
  projectCount: number,
  remixCount: number,
  starredCount: number
): { id: TabId; label: string; count: number }[] {
  return [
    { id: 'projects', label: 'Projects', count: projectCount },
    { id: 'remixes', label: 'Remixes', count: remixCount },
    { id: 'starred', label: 'Starred', count: starredCount },
  ]
}

const VALID_TABS = new Set<string>(['projects', 'remixes', 'starred'])

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export const ProfileTabs = ({
  username,
  isOwnProfile,
  projects: initialProjects,
  remixes,
  starred,
}: ProfileTabsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [projects, setProjects] = useState(initialProjects)

  const rawTab = searchParams.get('tab')
  const activeTab: TabId =
    rawTab && VALID_TABS.has(rawTab) ? (rawTab as TabId) : 'projects'

  const tabs = getTabs(projects.length, remixes.length, starred.length)

  const setTab = useCallback(
    (tab: TabId) => {
      const params = new URLSearchParams(searchParams.toString())
      if (tab === 'projects') {
        params.delete('tab')
      } else {
        params.set('tab', tab)
      }
      const qs = params.toString()
      startTransition(() => {
        router.push(`/@${username}${qs ? `?${qs}` : ''}`, { scroll: false })
      })
    },
    [router, searchParams, username, startTransition]
  )

  const handleDelete = useCallback(
    (projectId: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== projectId))
    },
    []
  )

  return (
    <div>
      {/* Tab bar */}
      <div className="border-b border-[#1c1c25] mb-6">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`relative pb-3 font-mono text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-[#e8e8ed]'
                  : 'text-[#e8e8ed]/35 hover:text-[#e8e8ed]/60'
              }`}
            >
              {tab.label}
              <span
                className={`ml-1.5 font-mono text-[11px] ${
                  activeTab === tab.id
                    ? 'text-[#e8e8ed]/60'
                    : 'text-[#e8e8ed]/20'
                }`}
              >
                ({tab.count})
              </span>
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#3ddc84] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'projects' && (
        <ProjectsTab
          projects={projects}
          isOwnProfile={isOwnProfile}
          username={username}
          onDelete={handleDelete}
        />
      )}
      {activeTab === 'remixes' && <RemixesTab remixes={remixes} />}
      {activeTab === 'starred' && <StarredTab starred={starred} />}
    </div>
  )
}

/* ================================================================== */
/*  Projects tab                                                       */
/* ================================================================== */

const ProjectsTab = ({
  projects,
  isOwnProfile,
  username,
  onDelete,
}: {
  projects: ProjectWithDetails[]
  isOwnProfile: boolean
  username: string
  onDelete: (id: string) => void
}) => {
  if (projects.length === 0) {
    return (
      <EmptyState
        message="No projects yet"
        cta={
          isOwnProfile
            ? { label: 'Share your first prompt workflow', href: '/new' }
            : undefined
        }
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <div key={project.id} className="flex flex-col">
          <ProjectCard project={project} />
          {/* Management bar — only on own profile */}
          {isOwnProfile && (
            <ProjectManageBar
              project={project}
              username={username}
              onDelete={onDelete}
            />
          )}
        </div>
      ))}
      {/* Quick-add card for own profile */}
      {isOwnProfile && (
        <Link
          href="/new"
          className="flex flex-col items-center justify-center h-full min-h-[180px] border border-dashed border-[#1c1c25] rounded-lg hover:border-[#3ddc84]/30 hover:bg-[#3ddc84]/[0.02] transition-colors group"
        >
          <Plus
            size={24}
            className="text-[#e8e8ed]/15 group-hover:text-[#3ddc84]/50 transition-colors mb-2"
          />
          <span className="font-mono text-xs text-[#e8e8ed]/20 group-hover:text-[#3ddc84]/50 transition-colors">
            New project
          </span>
        </Link>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Project manage bar — status + edit + delete                        */
/* ================================================================== */

const ProjectManageBar = ({
  project,
  username,
  onDelete,
}: {
  project: ProjectWithDetails
  username: string
  onDelete: (id: string) => void
}) => {
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const status = !project.is_published
    ? { label: 'Draft', color: '#f59e0b' }
    : !project.is_approved
      ? { label: 'Needs re-publish', color: '#3b82f6' }
      : null

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Failed to delete')
      }
      toast('Project deleted', 'success')
      onDelete(project.id)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to delete', 'error')
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2 mt-1.5 px-1">
      {/* Status badge */}
      {status && (
        <span
          className="font-mono text-[10px] font-semibold px-2 py-0.5 rounded"
          style={{ backgroundColor: `${status.color}18`, color: status.color }}
        >
          {status.label}
        </span>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Edit */}
      <Link
        href={`/@${username}/${project.slug}/edit`}
        className="flex items-center gap-1 font-mono text-[10px] text-[#e8e8ed]/25 hover:text-[#3ddc84]/70 transition-colors px-1.5 py-0.5 rounded hover:bg-[#3ddc84]/[0.05]"
      >
        <Pencil size={10} />
        Edit
      </Link>

      {/* Delete */}
      {confirmDelete ? (
        <div className="flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 font-mono text-[10px] text-red-400 hover:text-red-300 transition-colors px-1.5 py-0.5 rounded bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50"
          >
            {deleting ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
            {deleting ? 'Deleting...' : 'Confirm'}
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="font-mono text-[10px] text-[#e8e8ed]/25 hover:text-[#e8e8ed]/50 transition-colors px-1.5 py-0.5"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-1 font-mono text-[10px] text-[#e8e8ed]/25 hover:text-red-400 transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/[0.05]"
        >
          <Trash2 size={10} />
          Delete
        </button>
      )}
    </div>
  )
}

/* ================================================================== */
/*  Remixes tab                                                        */
/* ================================================================== */

const RemixesTab = ({ remixes }: { remixes: ForkedProject[] }) => {
  if (remixes.length === 0) {
    return (
      <EmptyState
        message="No remixes yet"
        cta={{ label: 'Fork a project to get started', href: '/explore' }}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {remixes.map((project) => (
        <div key={project.id} className="flex flex-col">
          <ProjectCard project={project} />
          {project.original_author_username && (
            <Link
              href={`/@${project.original_author_username}`}
              className="mt-1.5 px-1 font-mono text-[11px] text-[#e8e8ed]/25 hover:text-[#3ddc84]/60 transition-colors truncate"
            >
              Forked from @{project.original_author_username}
              {project.original_title ? ` / ${project.original_title}` : ''}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

/* ================================================================== */
/*  Starred tab                                                        */
/* ================================================================== */

const StarredTab = ({ starred }: { starred: ProjectWithDetails[] }) => {
  if (starred.length === 0) {
    return (
      <EmptyState
        message="No starred projects"
        cta={{
          label: 'Explore projects to find ones you like',
          href: '/explore',
        }}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {starred.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}

/* ================================================================== */
/*  Shared helpers                                                     */
/* ================================================================== */

const EmptyState = ({
  message,
  cta,
}: {
  message: string
  cta?: { label: string; href: string }
}) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Compass size={28} className="text-[#e8e8ed]/15 mb-4" />
    <p className="font-mono text-sm text-[#e8e8ed]/40 mb-1">{message}</p>
    {cta && (
      <Link
        href={cta.href}
        className="mt-3 font-mono text-xs px-4 py-2 rounded-md bg-[#3ddc84] text-[#09090b] font-semibold hover:bg-[#3ddc84]/90 transition-colors"
      >
        {cta.label}
      </Link>
    )}
  </div>
)
