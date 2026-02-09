import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Star,
  GitFork,
  ExternalLink,
  Calendar,
  Layers,
  MessageSquare,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildMetadata } from '@/lib/seo'
import {
  getProjectBySlug,
  getRelatedProjects,
  isStarredByUser,
} from '@/lib/queries/projects'
import { getCommentsByProject } from '@/lib/queries/comments'
import { CopyButton } from '@/components/copy-button'
import { StarButton } from '@/components/star-button'
import { ForkButton } from '@/components/fork-button'
import { ShareButton } from '@/components/share-button'
import { CommentsSection } from '@/components/comments-section'
import { Reveal } from '@/components/reveal'
import type { PromptStep, ProjectWithDetails } from '@/types/project'

/* ================================================================== */
/*  Cached data fetcher (shared by generateMetadata & page)            */
/* ================================================================== */

const getCachedProject = cache(
  (username: string, slug: string) => getProjectBySlug(username, slug)
)

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const STEP_COLORS = ['#3ddc84', '#f59e0b', '#3b82f6', '#a855f7']

const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  bolt: 'Bolt',
  lovable: 'Lovable',
  claude: 'Claude',
  replit: 'Replit',
  other: 'Other',
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
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

function buildAllPromptsText(steps: PromptStep[]): string {
  return steps
    .map((s) => `## Step ${s.step_order}: ${s.title}\n\n${s.prompt_text}`)
    .join('\n\n---\n\n')
}

/* ================================================================== */
/*  Metadata                                                           */
/* ================================================================== */

type PageProps = { params: Promise<{ username: string; slug: string }> }

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username: raw, slug } = await params
  const username = decodeURIComponent(raw).replace(/^@/, '')
  const project = await getCachedProject(username, slug)

  if (!project) {
    return { title: 'Not Found | PromptStack' }
  }

  const toolName = TOOL_LABELS[project.tool] ?? project.tool
  const description =
    project.description ??
    `A ${toolName} prompt workflow by @${project.author.username}`

  return buildMetadata({
    title: `${project.title} — ${toolName} Prompt Workflow`,
    description,
    path: `/@${project.author.username}/${project.slug}`,
    ogType: 'article',
    ogAuthors: [project.author.username],
    ogImage: null, // uses app/[username]/[slug]/opengraph-image.tsx
  })
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default async function ProjectPage({ params }: PageProps) {
  const { username: raw, slug } = await params
  const username = decodeURIComponent(raw).replace(/^@/, '')
  const project = await getCachedProject(username, slug)

  if (!project) notFound()

  /* Parallel data fetching ----------------------------------------- */
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [related, starred, comments] = await Promise.all([
    getRelatedProjects(project.id, project.tool, project.category),
    user ? isStarredByUser(project.id, user.id) : Promise.resolve(false),
    getCommentsByProject(project.id),
  ])

  const publishedAgo = formatRelativeTime(project.created_at)
  const allPromptsText = buildAllPromptsText(project.steps)

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      {/* ------------------------------------------------------------ */}
      {/*  Breadcrumb + action buttons                                  */}
      {/* ------------------------------------------------------------ */}
      <Reveal>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <nav className="flex items-center gap-1.5 font-mono text-sm text-[#e8e8ed]/40 min-w-0">
            <Link
              href="/"
              className="hover:text-[#e8e8ed]/70 transition-colors shrink-0"
            >
              PromptStack
            </Link>
            <span className="shrink-0">/</span>
            <Link
              href={`/@${project.author.username}`}
              className="hover:text-[#e8e8ed]/70 transition-colors shrink-0"
            >
              @{project.author.username}
            </Link>
            <span className="shrink-0">/</span>
            <span className="text-[#e8e8ed]/60 truncate">
              {project.title}
            </span>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <StarButton
              projectId={project.id}
              initialStarred={starred}
              initialCount={project.star_count}
            />
            <ForkButton
              projectId={project.id}
              projectSlug={project.slug}
              authorUsername={project.author.username}
              forkCount={project.fork_count}
            />
            <ShareButton
              projectTitle={project.title}
              projectUrl={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/@${project.author.username}/${project.slug}`}
              authorUsername={project.author.username}
              tool={project.tool}
            />
          </div>
        </div>
      </Reveal>

      {/* ------------------------------------------------------------ */}
      {/*  2-column layout                                              */}
      {/* ------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
        {/* ========================================================== */}
        {/*  Main column                                                */}
        {/* ========================================================== */}
        <main className="min-w-0">
          {/* Project header ---------------------------------------- */}
          <Reveal>
            <div className="mb-10">
              {/* Title */}
              <h1 className="font-mono text-2xl md:text-3xl font-bold tracking-tight mb-4">
                {project.title}
              </h1>

              {/* Author row */}
              <div className="flex items-center gap-3 mb-4">
                <Link
                  href={`/@${project.author.username}`}
                  className="flex items-center gap-2 group"
                >
                  {project.author.avatar_url ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={project.author.avatar_url}
                      alt={project.author.username}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#3ddc84] flex items-center justify-center">
                      <span className="font-mono text-[#09090b] text-xs font-bold">
                        {project.author.username[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="font-mono text-sm text-[#e8e8ed]/60 group-hover:text-[#3ddc84] transition-colors">
                    @{project.author.username}
                  </span>
                </Link>
                <span className="text-[#e8e8ed]/20">·</span>
                <span className="font-mono text-xs text-[#e8e8ed]/30">
                  {publishedAgo}
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#3ddc84]/10 text-[#3ddc84]/80 font-semibold uppercase tracking-wider">
                  {TOOL_LABELS[project.tool] ?? project.tool}
                </span>
                {project.difficulty && (
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#1c1c25] text-[#e8e8ed]/50">
                    {DIFFICULTY_LABELS[project.difficulty] ?? project.difficulty}
                  </span>
                )}
                {project.category && project.category !== 'other' && (
                  <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#1c1c25] text-[#e8e8ed]/40">
                    {project.category}
                  </span>
                )}
              </div>

              {/* Description */}
              {project.description && (
                <p className="text-[#e8e8ed]/50 leading-relaxed mb-5 max-w-2xl">
                  {project.description}
                </p>
              )}

              {/* Tags */}
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#1c1c25] text-[#e8e8ed]/40"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Demo URL */}
              {project.demo_url && (
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-sm text-[#3ddc84]/70 hover:text-[#3ddc84] transition-colors mb-5"
                >
                  <ExternalLink size={14} />
                  View demo →
                </a>
              )}

              {/* Fork / Inspiration info */}
              {project.forked_from && (
                <div className="text-sm text-[#e8e8ed]/30 mb-2">
                  Forked from{' '}
                  <Link
                    href={`/@${project.forked_from.author_username}/${project.forked_from.slug}`}
                    className="text-[#3ddc84]/60 hover:text-[#3ddc84] transition-colors"
                  >
                    @{project.forked_from.author_username}/{project.forked_from.title}
                  </Link>
                </div>
              )}
              {project.inspired_by && (
                <div className="text-sm text-[#e8e8ed]/30">
                  Inspired by{' '}
                  <Link
                    href={`/@${project.inspired_by.author_username}/${project.inspired_by.slug}`}
                    className="text-[#3ddc84]/60 hover:text-[#3ddc84] transition-colors"
                  >
                    @{project.inspired_by.author_username}/{project.inspired_by.title}
                  </Link>
                </div>
              )}
            </div>
          </Reveal>

          {/* Prompt Steps ------------------------------------------ */}
          <div className="mb-10">
            <Reveal>
              <h2 className="font-mono text-sm text-[#3ddc84] mb-6">
                {'// Prompt Steps'}
              </h2>
            </Reveal>

            <div className="space-y-5">
              {project.steps.map((step, index) => (
                <Reveal key={step.id} delay={index * 60}>
                  <StepCard
                    step={step}
                    color={STEP_COLORS[index % STEP_COLORS.length]}
                  />
                </Reveal>
              ))}
            </div>
          </div>

          {/* Copy All ----------------------------------------------- */}
          {project.steps.length > 0 && (
            <Reveal>
              <div className="border-t border-[#1c1c25] pt-6">
                <CopyButton
                  text={allPromptsText}
                  label="Copy All Prompts"
                  className="!px-4 !py-2.5 !text-sm bg-[#0c0c0f] border border-[#1c1c25] hover:!bg-[#1c1c25] rounded-md"
                />
              </div>
            </Reveal>
          )}
        </main>

        {/* ========================================================== */}
        {/*  Sidebar                                                    */}
        {/* ========================================================== */}
        <aside className="space-y-5">
          {/* Stats card */}
          <Reveal>
            <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-5">
              <h3 className="font-mono text-[10px] text-[#e8e8ed]/30 uppercase tracking-widest mb-4">
                Stats
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-3">
                <StatItem icon={Star} label="Stars" value={project.star_count} />
                <StatItem icon={GitFork} label="Forks" value={project.fork_count} />
                <StatItem icon={Layers} label="Steps" value={project.steps.length} />
                <StatItem icon={MessageSquare} label="Comments" value={project.comment_count} />
              </div>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#1c1c25] text-xs text-[#e8e8ed]/30">
                <Calendar size={12} />
                <span className="font-mono">Published {publishedAgo}</span>
              </div>
            </div>
          </Reveal>

          {/* Author card */}
          <Reveal delay={60}>
            <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-5">
              <h3 className="font-mono text-[10px] text-[#e8e8ed]/30 uppercase tracking-widest mb-4">
                Author
              </h3>
              <Link
                href={`/@${project.author.username}`}
                className="flex items-center gap-3 group"
              >
                {project.author.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={project.author.avatar_url}
                    alt={project.author.username}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-full"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#3ddc84] flex items-center justify-center">
                    <span className="font-mono text-[#09090b] text-sm font-bold">
                      {project.author.username[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-mono text-sm font-semibold group-hover:text-[#3ddc84] transition-colors">
                    {project.author.display_name ?? project.author.username}
                  </p>
                  <p className="font-mono text-xs text-[#e8e8ed]/40">
                    @{project.author.username}
                  </p>
                </div>
              </Link>
            </div>
          </Reveal>

          {/* Related projects */}
          {related.length > 0 && (
            <Reveal delay={120}>
              <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-5">
                <h3 className="font-mono text-[10px] text-[#e8e8ed]/30 uppercase tracking-widest mb-4">
                  Related Projects
                </h3>
                <div className="space-y-4">
                  {related.map((p) => (
                    <RelatedCard key={p.id} project={p} />
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </aside>
      </div>

      {/* ------------------------------------------------------------ */}
      {/*  Comments section — full width below grid                     */}
      {/* ------------------------------------------------------------ */}
      <Reveal>
        <div className="mt-12 pt-10 border-t border-[#1c1c25]">
          <CommentsSection
            projectId={project.id}
            projectAuthorId={project.author_id}
            initialComments={comments}
          />
        </div>
      </Reveal>
    </div>
  )
}

/* ================================================================== */
/*  StepCard                                                           */
/* ================================================================== */

function StepCard({ step, color }: { step: PromptStep; color: string }) {
  return (
    <div
      className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg overflow-hidden"
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
    >
      {/* Header: step number + title + context badge */}
      <div className="flex items-start gap-3 px-5 pt-5 pb-0">
        <div
          className="w-7 h-7 rounded flex items-center justify-center shrink-0 font-mono text-xs font-bold"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {step.step_order}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-mono text-sm font-semibold leading-snug pt-0.5">
              {step.title}
            </h3>
            {step.context_mode && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1c1c25] text-[#e8e8ed]/40 shrink-0">
                {step.context_mode}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 pt-3 space-y-3">
        {/* Prompt code block */}
        {step.prompt_text && (
          <div className="relative group/code">
            <pre
              className="bg-[#09090b] border border-[#1c1c25] rounded-md p-4 pr-12 font-mono text-[13px] text-[#e8e8ed]/70 whitespace-pre-wrap leading-relaxed overflow-x-auto"
              style={{ borderLeftColor: color, borderLeftWidth: '2px' }}
            >
              {step.prompt_text}
            </pre>
            <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
              <CopyButton text={step.prompt_text} />
            </div>
          </div>
        )}

        {/* Output notes */}
        {step.output_notes && (
          <p className="text-sm text-[#e8e8ed]/40 leading-relaxed">
            <span className="text-[#e8e8ed]/50 font-medium">Output: </span>
            <span className="italic">{step.output_notes}</span>
          </p>
        )}

        {/* Tips */}
        {step.tips && (
          <div className="bg-[#f59e0b]/[0.04] border border-[#f59e0b]/10 rounded-md px-3.5 py-2.5">
            <p className="text-xs text-[#f59e0b]/70 leading-relaxed">
              <span className="mr-1">{'💡'}</span>
              <span className="font-medium">Tip: </span>
              {step.tips}
            </p>
          </div>
        )}

        {/* Fork note */}
        {step.fork_note && (
          <div className="bg-[#3b82f6]/[0.04] border border-[#3b82f6]/10 rounded-md px-3.5 py-2.5">
            <p className="text-xs text-[#3b82f6]/70 leading-relaxed">
              <span className="font-medium">Why I changed this: </span>
              {step.fork_note}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================== */
/*  StatItem                                                           */
/* ================================================================== */

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-[#e8e8ed]/25" />
      <div>
        <p className="font-mono text-sm font-semibold text-[#e8e8ed]/80">
          {value}
        </p>
        <p className="font-mono text-[10px] text-[#e8e8ed]/30">{label}</p>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  RelatedCard                                                        */
/* ================================================================== */

function RelatedCard({ project }: { project: ProjectWithDetails }) {
  return (
    <Link
      href={`/@${project.author.username}/${project.slug}`}
      className="block group"
    >
      <p className="font-mono text-sm font-semibold group-hover:text-[#3ddc84] transition-colors truncate">
        {project.title}
      </p>
      <div className="flex items-center gap-2 mt-1">
        <span className="font-mono text-xs text-[#e8e8ed]/40 truncate">
          @{project.author.username}
        </span>
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#3ddc84]/10 text-[#3ddc84]/60 shrink-0">
          {TOOL_LABELS[project.tool] ?? project.tool}
        </span>
        <span className="flex items-center gap-1 font-mono text-xs text-[#e8e8ed]/30 ml-auto shrink-0">
          <Star size={10} />
          {project.star_count}
        </span>
      </div>
    </Link>
  )
}
