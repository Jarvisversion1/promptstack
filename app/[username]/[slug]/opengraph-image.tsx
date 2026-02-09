import { ImageResponse } from 'next/og'
import { createClient } from '@supabase/supabase-js'

/* ================================================================== */
/*  OG image config                                                    */
/* ================================================================== */

export const runtime = 'edge'
export const alt = 'PromptStack project'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

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

const BG = '#09090b'
const GREEN = '#3ddc84'
const MUTED = '#7a7a85'
const BORDER = '#1c1c25'

/* ================================================================== */
/*  Fetch project data (edge-compatible, no cookies needed)            */
/* ================================================================== */

async function getProject(username: string, slug: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) return null

  const supabase = createClient(url, key)

  const { data, error } = await supabase
    .from('projects')
    .select(
      `
      title,
      tool,
      star_count,
      fork_count,
      author:profiles!author_id(username),
      steps:prompt_steps(id)
    `
    )
    .eq('slug', slug)
    .eq('is_published', true)
    .eq('is_approved', true)
    .single()

  if (error || !data) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = data as any
  if (raw.author?.username !== username) return null

  return {
    title: raw.title as string,
    tool: raw.tool as string,
    username: raw.author.username as string,
    starCount: (raw.star_count ?? 0) as number,
    forkCount: (raw.fork_count ?? 0) as number,
    stepCount: Array.isArray(raw.steps) ? raw.steps.length : 0,
  }
}

/* ================================================================== */
/*  Truncate helper                                                    */
/* ================================================================== */

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max - 1)}…`
}

/* ================================================================== */
/*  SVG grid pattern (inline, edge-safe)                               */
/* ================================================================== */

function GridPattern() {
  return (
    <svg
      width="1200"
      height="630"
      viewBox="0 0 1200 630"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      {/* Vertical lines */}
      {Array.from({ length: 13 }).map((_, i) => (
        <line
          key={`v${i}`}
          x1={i * 100}
          y1={0}
          x2={i * 100}
          y2={630}
          stroke={BORDER}
          strokeWidth={1}
          opacity={0.4}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          y1={i * 90}
          x2={1200}
          y2={i * 90}
          stroke={BORDER}
          strokeWidth={1}
          opacity={0.4}
        />
      ))}
    </svg>
  )
}

/* ================================================================== */
/*  Default fallback image                                             */
/* ================================================================== */

function DefaultImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: BG,
          position: 'relative',
        }}
      >
        <GridPattern />

        {/* Green accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: GREEN,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: GREEN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 700,
              color: BG,
            }}
          >
            PS
          </div>
          <span
            style={{ fontSize: 36, fontWeight: 700, color: '#e8e8ed' }}
          >
            PromptStack
          </span>
        </div>

        <span style={{ fontSize: 22, color: MUTED }}>
          Fork the prompts behind real projects
        </span>
      </div>
    ),
    { ...size }
  )
}

/* ================================================================== */
/*  Image handler                                                      */
/* ================================================================== */

export default async function OGImage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>
}) {
  const { username: rawUsername, slug } = await params
  const username = decodeURIComponent(rawUsername).replace(/^@/, '')

  const project = await getProject(username, slug)

  if (!project) {
    return DefaultImage()
  }

  const toolLabel = TOOL_LABELS[project.tool] ?? project.tool

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: BG,
          position: 'relative',
          padding: '0 72px',
        }}
      >
        <GridPattern />

        {/* Green accent line at top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: GREEN,
          }}
        />

        {/* Header: Logo + branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 52,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: GREEN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: BG,
            }}
          >
            PS
          </div>
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: MUTED,
              letterSpacing: '-0.02em',
            }}
          >
            promptstack
          </span>
        </div>

        {/* Center: Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flex: 1,
            gap: 20,
            marginTop: -16,
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: '#e8e8ed',
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              maxWidth: 1000,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {truncate(project.title, 80)}
          </div>

          {/* Author + tool badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <span
              style={{
                fontSize: 24,
                color: MUTED,
                letterSpacing: '-0.01em',
              }}
            >
              @{project.username}
            </span>

            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: GREEN,
                backgroundColor: `${GREEN}18`,
                padding: '6px 16px',
                borderRadius: 6,
                border: `1px solid ${GREEN}40`,
              }}
            >
              {toolLabel}
            </div>
          </div>
        </div>

        {/* Bottom stats row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            paddingBottom: 52,
          }}
        >
          <StatPill label={`${project.stepCount} prompt${project.stepCount !== 1 ? 's' : ''}`} />
          <StatPill label={`${project.starCount} star${project.starCount !== 1 ? 's' : ''}`} />
          <StatPill label={`${project.forkCount} fork${project.forkCount !== 1 ? 's' : ''}`} />
        </div>
      </div>
    ),
    { ...size }
  )
}

/* ================================================================== */
/*  Stat pill component                                                */
/* ================================================================== */

function StatPill({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 18,
        color: MUTED,
        backgroundColor: `${BORDER}`,
        padding: '8px 18px',
        borderRadius: 8,
      }}
    >
      {label}
    </div>
  )
}
