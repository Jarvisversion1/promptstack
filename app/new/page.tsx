import { buildMetadata } from '@/lib/seo'
import { NewProjectForm } from '@/components/new-project-form'

export const metadata = buildMetadata({
  title: 'New Project',
  description:
    'Create a new Prompt Project on PromptStack. Share your AI coding workflow with the community.',
  path: '/new',
  noIndex: true,
})

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-[#09090b] pt-20 pb-24">
      <div className="mx-auto max-w-3xl px-4">
        <NewProjectForm />
      </div>
    </main>
  )
}
