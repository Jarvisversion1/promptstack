import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getProjects } from '@/lib/queries/projects'
import { ExploreFilters } from '@/components/explore-filters'
import { ExploreResults } from '@/components/explore-results'
import { buildMetadata } from '@/lib/seo'
import { TOOLS, CATEGORIES, type SortValue } from '@/lib/config/filters'

/* ================================================================== */
/*  Resolve filter param to tool or category                           */
/* ================================================================== */

type FilterKind =
  | { type: 'tool'; value: string; label: string }
  | { type: 'category'; value: string; label: string }

function resolveFilter(slug: string): FilterKind | null {
  const tool = TOOLS.find((t) => t.value === slug)
  if (tool) return { type: 'tool', value: tool.value, label: tool.label }

  const cat = CATEGORIES.find((c) => c.value === slug)
  if (cat) return { type: 'category', value: cat.value, label: cat.label }

  return null
}

/* ================================================================== */
/*  Static params                                                      */
/* ================================================================== */

export async function generateStaticParams() {
  const all = [...TOOLS, ...CATEGORIES]
  return all.map((opt) => ({ filter: opt.value }))
}

/* ================================================================== */
/*  Metadata                                                           */
/* ================================================================== */

type PageProps = {
  params: Promise<{ filter: string }>
  searchParams: Promise<{
    difficulty?: string
    search?: string
    sort?: string
    page?: string
  }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { filter: slug } = await params
  const resolved = resolveFilter(slug)

  if (!resolved) {
    return { title: 'Not Found | PromptStack' }
  }

  if (resolved.type === 'tool') {
    return buildMetadata({
      title: `Best ${resolved.label} Prompt Projects`,
      description: `Browse community prompt workflows built with ${resolved.label}. Fork and remix for your own projects.`,
      path: `/explore/${slug}`,
    })
  }

  return buildMetadata({
    title: `${resolved.label} Prompt Projects`,
    description: `Explore prompt workflows for building ${resolved.label.toLowerCase()} projects. See how builders ship ${resolved.label.toLowerCase()} projects with AI coding tools.`,
    path: `/explore/${slug}`,
  })
}

/* ================================================================== */
/*  Sort helper                                                        */
/* ================================================================== */

const VALID_SORTS = new Set<string>(['newest', 'stars', 'forks', 'discussed'])

function parseSortParam(raw?: string): SortValue {
  if (raw && VALID_SORTS.has(raw)) return raw as SortValue
  return 'newest'
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default async function ExploreFilterPage({
  params,
  searchParams,
}: PageProps) {
  const { filter: slug } = await params
  const resolved = resolveFilter(slug)
  if (!resolved) notFound()

  const sp = await searchParams

  const difficulty = sp.difficulty ?? null
  const search = sp.search ?? null
  const sort = parseSortParam(sp.sort)
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)
  const perPage = 12

  const { projects, totalCount } = await getProjects({
    tool: resolved.type === 'tool' ? resolved.value : null,
    category: resolved.type === 'category' ? resolved.value : null,
    difficulty,
    search,
    sort,
    page,
    perPage,
  })

  const hasFilters = !!(difficulty || search)

  /* ---- Heading text ----------------------------------------------- */
  const heading =
    resolved.type === 'tool'
      ? `// ${resolved.label} Projects`
      : `// ${resolved.label} Projects`

  const subtitle =
    resolved.type === 'tool'
      ? `Prompt workflows built with ${resolved.label}`
      : `Prompt workflows for ${resolved.label.toLowerCase()} projects`

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-mono text-xl md:text-2xl font-bold tracking-tight mb-2">
          {heading}
        </h1>
        <p className="font-mono text-sm text-[#e8e8ed]/40">{subtitle}</p>
      </div>

      {/* Filters — pre-select the route filter */}
      <Suspense fallback={<FilterSkeleton />}>
        <ExploreFilters
          presetTool={resolved.type === 'tool' ? resolved.value : null}
          presetCategory={
            resolved.type === 'category' ? resolved.value : null
          }
        />
      </Suspense>

      {/* Results */}
      <Suspense fallback={<ResultsSkeleton />}>
        <ExploreResults
          projects={projects}
          totalCount={totalCount}
          page={page}
          perPage={perPage}
          hasFilters={hasFilters || true /* always has the route filter */}
        />
      </Suspense>
    </div>
  )
}

/* ================================================================== */
/*  Skeletons (shared shape with /explore)                             */
/* ================================================================== */

function FilterSkeleton() {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-9 sm:w-[40%] bg-[#0c0c0f] border border-[#1c1c25] rounded-md animate-pulse" />
        <div className="hidden sm:flex items-center gap-2 flex-1 justify-end">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-28 bg-[#0c0c0f] border border-[#1c1c25] rounded-md animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="h-4 w-32 bg-[#1c1c25] rounded animate-pulse" />
        <div className="h-8 w-16 bg-[#1c1c25] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-52 bg-[#0c0c0f] border border-[#1c1c25] rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
