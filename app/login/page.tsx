import { buildMetadata } from '@/lib/seo'
import { LoginContent } from '@/components/login-content'

export const metadata = buildMetadata({
  title: 'Sign In',
  description: 'Sign in to PromptStack to share, fork, and remix prompt workflows.',
  path: '/login',
  noIndex: true,
})

export default function LoginPage() {
  return <LoginContent />
}
