'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Compass } from 'lucide-react'
import { ProjectCard } from '@/components/project-card'
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
  projects,
  remixes,
  starred,
}: ProfileTabsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

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
              {/* Active indicator */}
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
}: {
  projects: ProjectWithDetails[]
  isOwnProfile: boolean
  username: string
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
        <div key={project.id} className="relative">
          <ProjectCard project={project} />
          {/* Draft / pending badge for own profile */}
          {isOwnProfile && !project.is_published && (
            <StatusBadge label="Draft" color="#f59e0b" />
          )}
          {isOwnProfile &&
            project.is_published &&
            !project.is_approved && (
              <StatusBadge label="Pending" color="#3b82f6" />
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

const StatusBadge = ({ label, color }: { label: string; color: string }) => (
  <span
    className="absolute top-3 right-3 z-10 font-mono text-[10px] font-semibold px-2 py-0.5 rounded"
    style={{ backgroundColor: `${color}18`, color }}
  >
    {label}
  </span>
)

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
