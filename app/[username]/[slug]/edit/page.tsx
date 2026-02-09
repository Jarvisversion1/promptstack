import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { buildMetadata } from '@/lib/seo'
import { getProjectBySlug } from '@/lib/queries/projects'
import { ProjectEditor } from '@/components/project-editor'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type PageProps = {
  params: Promise<{ username: string; slug: string }>
}

/* ================================================================== */
/*  Metadata                                                           */
/* ================================================================== */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username: raw, slug } = await params
  const username = decodeURIComponent(raw).replace(/^@/, '')
  const project = await getProjectBySlug(username, slug)

  if (!project) {
    return { title: 'Not Found | PromptStack' }
  }

  return buildMetadata({
    title: `Edit: ${project.title}`,
    description: `Editing ${project.title} on PromptStack.`,
    path: `/@${username}/${slug}/edit`,
    noIndex: true,
  })
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default async function EditProjectPage({ params }: PageProps) {
  const { username: raw, slug } = await params
  const username = decodeURIComponent(raw).replace(/^@/, '')

  /* ---- Fetch project -------------------------------------------- */
  const project = await getProjectBySlug(username, slug)
  if (!project) notFound()

  /* ---- Auth: verify current user is the author ------------------- */
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.id !== project.author_id) {
    redirect(`/@${username}/${slug}`)
  }

  /* ---- Fetch forked_from info for the banner -------------------- */
  let forkOrigin: { title: string; slug: string; authorUsername: string } | null =
    null

  if (project.forked_from) {
    forkOrigin = {
      title: project.forked_from.title,
      slug: project.forked_from.slug,
      authorUsername: project.forked_from.author_username,
    }
  }

  /* ---- Render --------------------------------------------------- */
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
      <ProjectEditor
        projectId={project.id}
        slug={project.slug}
        authorUsername={username}
        initialData={{
          title: project.title,
          description: project.description ?? '',
          tool: project.tool,
          category: project.category,
          difficulty: project.difficulty,
          demo_url: project.demo_url ?? '',
          tags: project.tags,
          steps: project.steps.map((s) => ({
            step_order: s.step_order,
            title: s.title,
            prompt_text: s.prompt_text,
            context_mode: s.context_mode,
            output_notes: s.output_notes ?? '',
            tips: s.tips ?? '',
            fork_note: s.fork_note ?? '',
          })),
          is_published: project.is_published,
        }}
        forkedFromId={project.forked_from_id}
        forkOrigin={forkOrigin}
      />
    </div>
  )
}
