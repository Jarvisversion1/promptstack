import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/project-card'
import { Reveal } from '@/components/reveal'
import { buildMetadata } from '@/lib/seo'
import type { ProjectWithDetails } from '@/types/project'

export const metadata = buildMetadata({
  title: 'PromptStack — Fork the Prompts Behind Real Projects',
  description:
    'The open community where vibe coders share, fork, and remix the complete prompt workflows behind real software.',
  path: '/',
  ogImage: null, // uses app/opengraph-image.tsx
})

/* ------------------------------------------------------------------ */
/*  Data helpers                                                       */
/* ------------------------------------------------------------------ */

const PROJECT_SELECT = `
  *,
  author:profiles!author_id(username, avatar_url),
  tags:project_tags(tag_name),
  prompt_steps(id)
`

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformProjects(data: any[] | null): ProjectWithDetails[] {
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

/* ------------------------------------------------------------------ */
/*  Shared sub-components                                              */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ label }: { label: string }) => (
  <Reveal>
    <h2 className="font-mono text-sm text-[#3ddc84] mb-8">{label}</h2>
  </Reveal>
)

const ProjectGrid = ({
  projects,
  cols = 3,
}: {
  projects: ProjectWithDetails[]
  cols?: 2 | 3
}) => {
  if (projects.length === 0) {
    return (
      <Reveal>
        <div className="text-center py-16 border border-dashed border-[#1c1c25] rounded-lg">
          <p className="font-mono text-sm text-[#e8e8ed]/30 mb-4">
            No projects yet. Be the first to share your prompt workflow.
          </p>
          <Link
            href="/new"
            className="inline-block font-mono text-sm px-4 py-2 bg-[#3ddc84] text-[#09090b] rounded-md hover:bg-[#3ddc84]/90 transition-colors font-semibold"
          >
            Share a Project
          </Link>
        </div>
      </Reveal>
    )
  }

  return (
    <div
      className={
        cols === 3
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
          : 'grid grid-cols-1 md:grid-cols-2 gap-5'
      }
    >
      {projects.map((project, i) => (
        <Reveal key={project.id} delay={i * 80}>
          <ProjectCard project={project} />
        </Reveal>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tools list for Section 6                                           */
/* ------------------------------------------------------------------ */

const TOOLS = [
  'Cursor',
  'Windsurf',
  'Bolt',
  'Lovable',
  'Claude',
  'Replit Agent',
  'v0',
  'Copilot',
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

async function fetchProjectData(): Promise<{
  trending: ProjectWithDetails[]
  justShipped: ProjectWithDetails[]
  staffPicks: ProjectWithDetails[]
}> {
  const empty = { trending: [], justShipped: [], staffPicks: [] }

  try {
    const supabase = await createClient()
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString()

    const [trendingRes, justShippedRes, staffPicksRes] = await Promise.all([
      // Trending — last 7 days, sorted by engagement
      supabase
        .from('projects')
        .select(PROJECT_SELECT)
        .eq('is_published', true)
        .eq('is_approved', true)
        .gte('created_at', sevenDaysAgo)
        .order('star_count', { ascending: false })
        .limit(20),

      // Just Shipped — most recent
      supabase
        .from('projects')
        .select(PROJECT_SELECT)
        .eq('is_published', true)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(6),

      // Staff Picks — top starred (curate later)
      supabase
        .from('projects')
        .select(PROJECT_SELECT)
        .eq('is_published', true)
        .eq('is_approved', true)
        .order('star_count', { ascending: false })
        .limit(3),
    ])

    let trending: ProjectWithDetails[] = []
    if (trendingRes.data) {
      const sorted = [...trendingRes.data]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) =>
          (b.star_count + b.fork_count) - (a.star_count + a.fork_count)
        )
        .slice(0, 6)
      trending = transformProjects(sorted)
    }

    return {
      trending,
      justShipped: transformProjects(justShippedRes.data),
      staffPicks: transformProjects(staffPicksRes.data),
    }
  } catch {
    return empty
  }
}

export default async function Home() {
  const { trending, justShipped, staffPicks } = await fetchProjectData()

  return (
    <>
      {/* ============================================================ */}
      {/*  Section 1 — Hero                                            */}
      {/* ============================================================ */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 hero-grid" />

        <div className="relative max-w-3xl mx-auto px-4 py-24 text-center flex flex-col items-center">
          {/* Terminal tag */}
          <Reveal>
            <div className="inline-flex items-center gap-2 font-mono text-sm text-[#e8e8ed]/60 border border-[#1c1c25] rounded-full px-4 py-1.5 mb-8">
              <span className="text-[#3ddc84] animate-blink">▋</span>
              git clone your next project&apos;s prompts
            </div>
          </Reveal>

          {/* Headline */}
          <Reveal delay={100}>
            <h1 className="font-mono text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
              Fork the{' '}
              <span className="text-[#3ddc84]">prompts</span>{' '}
              behind real projects
            </h1>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={200}>
            <p className="text-lg md:text-xl text-[#e8e8ed]/50 max-w-2xl mb-10 leading-relaxed">
              The open community where builders share, fork, and remix the
              complete prompt workflows behind real software.
            </p>
          </Reveal>

          {/* Buttons */}
          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              <Link
                href="/explore"
                className="font-mono text-sm font-semibold px-6 py-3 bg-[#3ddc84] text-[#09090b] rounded-md hover:bg-[#3ddc84]/90 transition-colors"
              >
                Explore Projects
              </Link>
              <Link
                href="/export"
                className="font-mono text-sm px-6 py-3 border border-[#1c1c25] text-[#e8e8ed]/70 rounded-md hover:bg-[#1c1c25] hover:text-[#e8e8ed] transition-colors"
              >
                Export Your Session →
              </Link>
            </div>
          </Reveal>

          {/* Sub-text */}
          <Reveal delay={400}>
            <p className="font-mono text-xs text-[#e8e8ed]/30">
              open source · free forever · community-driven
            </p>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Section 2 — Trending This Week                              */}
      {/* ============================================================ */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader label="// Trending This Week" />
          <ProjectGrid projects={trending} />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Section 3 — Just Shipped                                    */}
      {/* ============================================================ */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader label="// Just Shipped" />
          <ProjectGrid projects={justShipped} />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Section 4 — Staff Picks                                     */}
      {/* ============================================================ */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeader label="// Staff Picks" />
          <ProjectGrid projects={staffPicks} />
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Section 5 — Export CTA Banner                               */}
      {/* ============================================================ */}
      <section className="py-20 md:py-24 relative overflow-hidden">
        {/* Background with green glow */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[#0c0c0f]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#3ddc84]/[0.06] rounded-full blur-[120px]" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <Reveal>
            <p className="font-mono text-sm text-[#3ddc84] mb-4">
              {'// Start Contributing'}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h2 className="font-mono text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Publish your workflow in 5 minutes
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-[#e8e8ed]/50 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
              Paste one prompt at the end of your Cursor session. We&apos;ll
              extract every step automatically.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <Link
              href="/export"
              className="inline-block font-mono text-sm font-semibold px-6 py-3 bg-[#3ddc84] text-[#09090b] rounded-md hover:bg-[#3ddc84]/90 transition-colors"
            >
              Try Session Export →
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Section 6 — Tools Supported                                 */}
      {/* ============================================================ */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Reveal>
            <p className="font-mono text-xs text-[#e8e8ed]/40 uppercase tracking-wider mb-6">
              works with every ai coding tool
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div className="flex flex-wrap justify-center gap-3">
              {TOOLS.map((tool) => (
                <span
                  key={tool}
                  className="font-mono text-sm px-4 py-2 border border-[#1c1c25] rounded-md text-[#e8e8ed]/50 hover:text-[#e8e8ed]/80 hover:border-[#2a2a35] transition-colors cursor-default"
                >
                  {tool}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
