import { Suspense } from 'react'
import { getProjects } from '@/lib/queries/projects'
import { ExploreFilters } from '@/components/explore-filters'
import { ExploreResults } from '@/components/explore-results'
import { buildMetadata } from '@/lib/seo'
import type { SortValue } from '@/lib/config/filters'

/* ================================================================== */
/*  Metadata                                                           */
/* ================================================================== */

export const metadata = buildMetadata({
  title: 'Explore Prompt Projects',
  description:
    'Browse community prompt workflows built with Cursor, Windsurf, Bolt, and more. Filter by tool, stack, and difficulty.',
  path: '/explore',
})

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type PageProps = {
  searchParams: Promise<{
    tool?: string
    category?: string
    difficulty?: string
    search?: string
    sort?: string
    page?: string
  }>
}

/* ================================================================== */
/*  Valid sort values                                                   */
/* ================================================================== */

const VALID_SORTS = new Set<string>(['newest', 'stars', 'forks', 'discussed'])

function parseSortParam(raw?: string): SortValue {
  if (raw && VALID_SORTS.has(raw)) return raw as SortValue
  return 'newest'
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams

  const tool = params.tool ?? null
  const category = params.category ?? null
  const difficulty = params.difficulty ?? null
  const search = params.search ?? null
  const sort = parseSortParam(params.sort)
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1)
  const perPage = 12

  const { projects, totalCount } = await getProjects({
    tool,
    category,
    difficulty,
    search,
    sort,
    page,
    perPage,
  })

  const hasFilters = !!(tool || category || difficulty || search)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-mono text-xl md:text-2xl font-bold tracking-tight mb-2">
          {'// Explore'}
        </h1>
        <p className="font-mono text-sm text-[#e8e8ed]/40">
          Discover prompt workflows from the community
        </p>
      </div>

      {/* Filters — wrapped in Suspense for useSearchParams */}
      <Suspense fallback={<FilterSkeleton />}>
        <ExploreFilters />
      </Suspense>

      {/* Results */}
      <Suspense fallback={<ResultsSkeleton />}>
        <ExploreResults
          projects={projects}
          totalCount={totalCount}
          page={page}
          perPage={perPage}
          hasFilters={hasFilters}
        />
      </Suspense>
    </div>
  )
}

/* ================================================================== */
/*  Skeletons                                                          */
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
