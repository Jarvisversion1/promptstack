import { ImageResponse } from 'next/og'

/* ================================================================== */
/*  OG image config                                                    */
/* ================================================================== */

export const runtime = 'edge'
export const alt = 'PromptStack — Fork the prompts behind real projects'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const BG = '#09090b'
const GREEN = '#3ddc84'
const MUTED = '#7a7a85'
const BORDER = '#1c1c25'

/* ================================================================== */
/*  Grid pattern                                                       */
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
/*  Image handler                                                      */
/* ================================================================== */

export default function OGImage() {
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

        {/* Decorative green glow */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 500,
            height: 300,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, ${GREEN}12 0%, transparent 70%)`,
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              backgroundColor: GREEN,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 700,
              color: BG,
            }}
          >
            PS
          </div>
          <span
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: '#e8e8ed',
              letterSpacing: '-0.03em',
            }}
          >
            PromptStack
          </span>
        </div>

        {/* Tagline */}
        <span
          style={{
            fontSize: 26,
            color: MUTED,
            letterSpacing: '-0.01em',
            marginBottom: 48,
          }}
        >
          Fork the prompts behind real projects
        </span>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {['Share workflows', 'Fork & remix', 'Ship faster'].map(
            (text) => (
              <div
                key={text}
                style={{
                  fontSize: 18,
                  color: GREEN,
                  backgroundColor: `${GREEN}15`,
                  border: `1px solid ${GREEN}30`,
                  padding: '10px 24px',
                  borderRadius: 8,
                }}
              >
                {text}
              </div>
            )
          )}
        </div>

        {/* Bottom: Tool logos / names */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 16,
            color: `${MUTED}99`,
          }}
        >
          <span>Built for</span>
          {['Cursor', 'Windsurf', 'Bolt', 'Claude', 'Lovable', 'Replit'].map(
            (tool, i) => (
              <div
                key={tool}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {i > 0 && (
                  <span style={{ color: `${MUTED}40` }}>·</span>
                )}
                <span>{tool}</span>
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  )
}
