import Link from "next/link"

export const Footer = () => {
  return (
    <footer className="border-t border-[#1c1c25] bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="font-mono text-sm text-[#e8e8ed]/50">
            © 2025 PromptStack
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <span className="font-mono text-sm text-[#e8e8ed]/20 cursor-default select-none">
              twitter <span className="text-[10px]">(coming soon)</span>
            </span>
            <span className="font-mono text-sm text-[#e8e8ed]/20 cursor-default select-none">
              github <span className="text-[10px]">(coming soon)</span>
            </span>
            <Link
              href="/contact"
              className="font-mono text-sm text-[#e8e8ed]/50 hover:text-[#e8e8ed] transition-colors"
            >
              contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
