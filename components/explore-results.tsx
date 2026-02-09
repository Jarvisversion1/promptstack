'use client'

import { useCallback, useTransition } from 'react'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutGrid,
  List,
  Star,
  GitFork,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { ProjectCard } from '@/components/project-card'
import type { ProjectWithDetails } from '@/types/project'

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  bolt: 'Bolt',
  lovable: 'Lovable',
  claude: 'Claude',
  replit: 'Replit',
  other: 'Other',
}

/* ================================================================== */
/*  Props                                                              */
/* ================================================================== */

type ExploreResultsProps = {
  projects: ProjectWithDetails[]
  totalCount: number
  page: number
  perPage: number
  hasFilters: boolean
}

/* ================================================================== */
/*  Component                                                          */
/* ================================================================== */

export const ExploreResults = ({
  projects,
  totalCount,
  page,
  perPage,
  hasFilters,
}: ExploreResultsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage))

  /* ---- Pagination handler ----------------------------------------- */
  const goToPage = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString())
      if (newPage <= 1) {
        params.delete('page')
      } else {
        params.set('page', String(newPage))
      }
      startTransition(() => {
        router.push(`/explore?${params.toString()}`, { scroll: true })
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    [router, searchParams, startTransition]
  )

  /* ================================================================ */
  /*  Empty states                                                     */
  /* ================================================================ */

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-[#1c1c25] flex items-center justify-center mb-5">
          <Layers size={24} className="text-[#e8e8ed]/20" />
        </div>

        {hasFilters ? (
          <>
            <p className="font-mono text-sm text-[#e8e8ed]/50 mb-1">
              No projects found
            </p>
            <p className="font-mono text-xs text-[#e8e8ed]/30">
              Try adjusting your filters.
            </p>
          </>
        ) : (
          <>
            <p className="font-mono text-sm text-[#e8e8ed]/50 mb-1">
              No projects yet
            </p>
            <p className="font-mono text-xs text-[#e8e8ed]/30 mb-5">
              Be the first to share a prompt workflow.
            </p>
            <Link
              href="/new"
              className="font-mono text-xs px-4 py-2 rounded-md bg-[#3ddc84] text-[#09090b] font-semibold hover:bg-[#3ddc84]/90 transition-colors"
            >
              Share a project
            </Link>
          </>
        )}
      </div>
    )
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div>
      {/* ------------------------------------------------------------ */}
      {/*  Results header                                               */}
      {/* ------------------------------------------------------------ */}
      <div className="flex items-center justify-between mb-5">
        <p className="font-mono text-xs text-[#e8e8ed]/30">
          Showing{' '}
          <span className="text-[#e8e8ed]/50">{totalCount}</span>{' '}
          {totalCount === 1 ? 'project' : 'projects'}
        </p>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[#0c0c0f] border border-[#1c1c25] rounded-md p-0.5">
          <button
            type="button"
            onClick={() => setView('grid')}
            className={`p-1.5 rounded transition-colors ${
              view === 'grid'
                ? 'bg-[#1c1c25] text-[#e8e8ed]/70'
                : 'text-[#e8e8ed]/25 hover:text-[#e8e8ed]/50'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            className={`p-1.5 rounded transition-colors ${
              view === 'list'
                ? 'bg-[#1c1c25] text-[#e8e8ed]/70'
                : 'text-[#e8e8ed]/25 hover:text-[#e8e8ed]/50'
            }`}
            aria-label="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  Grid view                                                    */}
      {/* ------------------------------------------------------------ */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/*  List view                                                    */}
      {/* ------------------------------------------------------------ */}
      {view === 'list' && (
        <div className="border border-[#1c1c25] rounded-lg overflow-hidden divide-y divide-[#1c1c25]">
          {projects.map((project) => (
            <ListRow key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------ */}
      {/*  Pagination                                                   */}
      {/* ------------------------------------------------------------ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-[#1c1c25]">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
            className="flex items-center gap-1 font-mono text-xs px-3 py-2 rounded-md border border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70 transition-colors disabled:opacity-25 disabled:pointer-events-none"
          >
            <ChevronLeft size={13} />
            Previous
          </button>

          <span className="font-mono text-xs text-[#e8e8ed]/30">
            Page{' '}
            <span className="text-[#e8e8ed]/60">{page}</span>
            {' '}of{' '}
            <span className="text-[#e8e8ed]/60">{totalPages}</span>
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
            className="flex items-center gap-1 font-mono text-xs px-3 py-2 rounded-md border border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70 transition-colors disabled:opacity-25 disabled:pointer-events-none"
          >
            Next
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

/* ================================================================== */
/*  ListRow                                                            */
/* ================================================================== */

const ListRow = ({ project }: { project: ProjectWithDetails }) => {
  const {
    author,
    title,
    slug,
    description,
    tool,
    star_count,
    fork_count,
    step_count,
  } = project

  return (
    <Link
      href={`/@${author.username}/${slug}`}
      className="flex items-center gap-4 px-5 py-4 hover:bg-[#0c0c0f] transition-colors group"
    >
      {/* Left: info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-mono text-sm font-semibold truncate group-hover:text-[#3ddc84] transition-colors">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-xs text-[#e8e8ed]/40 shrink-0">
            @{author.username}
          </span>
          {description && (
            <>
              <span className="text-[#e8e8ed]/15 shrink-0">·</span>
              <p className="font-mono text-xs text-[#e8e8ed]/30 truncate">
                {description}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Right: meta */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#3ddc84]/10 text-[#3ddc84]/80">
          {TOOL_LABELS[tool] ?? tool}
        </span>
        <span className="flex items-center gap-1 font-mono text-xs text-[#e8e8ed]/35">
          <Star size={11} />
          {star_count}
        </span>
        <span className="flex items-center gap-1 font-mono text-xs text-[#e8e8ed]/35">
          <GitFork size={11} />
          {fork_count}
        </span>
        <span className="hidden sm:flex items-center gap-1 font-mono text-xs text-[#e8e8ed]/35">
          <Layers size={11} />
          {step_count}
        </span>
      </div>
    </Link>
  )
}
