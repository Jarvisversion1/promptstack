import Link from "next/link"
import { AuthButton } from "@/components/auth-button"

export const Nav = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#09090b]/80 backdrop-blur-md border-b border-[#1c1c25]">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-[#3ddc84] rounded flex items-center justify-center">
            <span className="font-mono text-[#09090b] text-xs font-bold">PS</span>
          </div>
          <span className="font-mono text-sm font-semibold tracking-tight">
            promptstack
          </span>
        </Link>

        {/* Right side links */}
        <div className="flex items-center gap-6">
          {/* Desktop links */}
          <Link
            href="/explore"
            className="hidden md:inline-block font-mono text-sm text-[#e8e8ed]/70 hover:text-[#e8e8ed] transition-colors"
          >
            explore
          </Link>
          <Link
            href="/guide"
            className="hidden md:inline-block font-mono text-sm text-[#e8e8ed]/70 hover:text-[#e8e8ed] transition-colors"
          >
            guide
          </Link>
          <Link
            href="/export"
            className="hidden md:inline-block font-mono text-sm text-[#e8e8ed]/70 hover:text-[#e8e8ed] transition-colors"
          >
            export
          </Link>

          {/* Auth */}
          <AuthButton />
        </div>
      </div>
    </nav>
  )
}
