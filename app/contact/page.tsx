import type { Metadata } from 'next'
import { Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact | PromptStack',
}

const ContactPage = () => {
  return (
    <main className="max-w-2xl mx-auto px-4 py-20">
      {/* Heading */}
      <h1 className="font-mono text-3xl font-bold text-[#e8e8ed] mb-3">
        Contact
      </h1>
      <p className="text-[#e8e8ed]/40 text-sm leading-relaxed mb-10">
        Got questions, feedback, or want to contribute? Reach out.
      </p>

      {/* Email card */}
      <a
        href="mailto:abhiprolinked@gmail.com"
        className="group flex items-center gap-4 bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-5 hover:border-[#2a2a35] transition-colors"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-md bg-[#3ddc84]/10">
          <Mail size={18} className="text-[#3ddc84]" />
        </div>
        <div>
          <p className="font-mono text-xs text-[#e8e8ed]/40 mb-0.5">Email</p>
          <p className="font-mono text-sm text-[#e8e8ed] group-hover:text-[#3ddc84] transition-colors">
            abhiprolinked@gmail.com
          </p>
        </div>
      </a>

      {/* Response note */}
      <p className="font-mono text-xs text-[#e8e8ed]/30 mt-6">
        We typically respond within 24 hours.
      </p>

      {/* Coming soon note */}
      <p className="font-mono text-xs text-[#e8e8ed]/20 mt-4">
        Twitter and GitHub coming soon.
      </p>
    </main>
  )
}

export default ContactPage
