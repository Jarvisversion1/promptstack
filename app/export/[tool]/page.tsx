import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Code, ClipboardPaste, Rocket } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { SessionExport } from '@/components/session-export'
import { buildMetadata } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'
import { getProjectsByUser } from '@/lib/queries/projects'
import {
  EXPORT_PROMPTS,
  EXPORT_TOOL_SLUGS,
  type ExportToolSlug,
} from '@/lib/config/export-prompts'

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export function generateStaticParams() {
  return EXPORT_TOOL_SLUGS.map((tool) => ({ tool }))
}

/* ------------------------------------------------------------------ */
/*  Dynamic metadata                                                   */
/* ------------------------------------------------------------------ */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tool: string }>
}): Promise<Metadata> {
  const { tool } = await params
  const config = EXPORT_PROMPTS[tool as ExportToolSlug]

  if (!config) {
    return { title: 'Export Your Session | PromptStack' }
  }

  return buildMetadata({
    title: `Export Your ${config.name} Prompts`,
    description: `Extract your entire ${config.name} coding workflow with one prompt. Paste, export, and publish your prompt project to PromptStack.`,
    path: `/export/${tool}`,
  })
}

/* ------------------------------------------------------------------ */
/*  3-step guide data                                                  */
/* ------------------------------------------------------------------ */

const STEPS = [
  { number: 1, label: 'Build something', icon: Code },
  { number: 2, label: 'Paste the export prompt', icon: ClipboardPaste },
  { number: 3, label: 'Publish to PromptStack', icon: Rocket },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default async function ExportToolPage({
  params,
}: {
  params: Promise<{ tool: string }>
}) {
  const { tool } = await params

  if (!EXPORT_TOOL_SLUGS.includes(tool as ExportToolSlug)) {
    notFound()
  }

  // Fetch user's projects if logged in
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const userProjects = user ? await getProjectsByUser(user.id) : []

  let username = ''
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    username = profile?.username ?? ''
  }

  return (
    <>
      {/* Hero -------------------------------------------------------- */}
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Reveal>
            <h1 className="font-mono text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-5">
              Export Your Session
            </h1>
          </Reveal>

          <Reveal delay={80}>
            <p className="text-lg text-[#e8e8ed]/50 max-w-2xl mx-auto mb-14 leading-relaxed">
              Finish building something? Paste one prompt into your AI tool. Get
              your entire workflow back as a publishable Prompt Project.
            </p>
          </Reveal>

          {/* 3-step guide */}
          <Reveal delay={160}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0">
              {STEPS.map((step, i) => (
                <div key={step.number} className="flex items-center gap-4 sm:gap-0">
                  <div className="flex flex-col items-center gap-3 w-44">
                    <div className="w-12 h-12 rounded-lg bg-[#3ddc84]/10 border border-[#3ddc84]/20 flex items-center justify-center">
                      <step.icon size={20} className="text-[#3ddc84]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-[#3ddc84] font-semibold">
                        {step.number}.
                      </span>
                      <span className="font-mono text-sm text-[#e8e8ed]/60">
                        {step.label}
                      </span>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="hidden sm:block w-12 h-px bg-[#1c1c25] mx-2" />
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Interactive session export ---------------------------------- */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-3xl mx-auto px-4">
          <SessionExport
            defaultTool={tool as ExportToolSlug}
            userProjects={userProjects}
            username={username}
          />
        </div>
      </section>
    </>
  )
}
