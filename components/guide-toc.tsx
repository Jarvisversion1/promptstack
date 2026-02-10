'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type TOCItem = {
  id: string
  label: string
  indicator?: '🔴' | '🟢'
}

const TOC_ITEMS: TOCItem[] = [
  { id: 'why-promptstack', label: 'Why PromptStack' },
  { id: 'what-it-is', label: 'What It Is (and Isn\'t)' },
  { id: 'who-its-for', label: 'Who It\'s For' },
  { id: 'prompts-arent-code', label: '"Prompts Aren\'t Code"' },
  { id: 'how-to-export', label: 'How to Export' },
  { id: 'single-window-tools', label: 'Single-Window Tools', indicator: '🔴' },
  { id: 'multi-chat-tools', label: 'Multi-Chat Tools', indicator: '🟢' },
  { id: 'when-to-export', label: 'When to Export' },
  { id: 'token-problem', label: 'The Token Problem' },
  { id: 'forking-remixing', label: 'Forking & Remixing' },
  { id: 'great-project', label: 'What Makes a Great Project' },
]

export const GuideTOC = () => {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-100px 0px -66% 0px',
        threshold: 0,
      }
    )

    TOC_ITEMS.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const yOffset = -80
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Mobile: Collapsible dropdown */}
      <div className="lg:hidden mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between font-mono text-sm px-4 py-3 bg-[#0c0c0f] border border-[#1c1c25] rounded-md text-[#e8e8ed]/70 hover:text-[#e8e8ed] transition-colors"
        >
          <span>On this page</span>
          <span className="text-[#3ddc84]">{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && (
          <div className="mt-2 bg-[#0c0c0f] border border-[#1c1c25] rounded-md p-4">
            <nav className="flex flex-col gap-2">
              {TOC_ITEMS.map(({ id, label, indicator }) => {
                const isActive = activeId === id
                return (
                  <button
                    key={id}
                    onClick={() => handleClick(id)}
                    className={`font-mono text-xs text-left px-3 py-2 rounded transition-colors ${
                      isActive
                        ? 'text-[#3ddc84] bg-[#3ddc84]/5'
                        : 'text-[#e8e8ed]/40 hover:text-[#e8e8ed]/70'
                    }`}
                  >
                    {indicator && <span className="mr-2">{indicator}</span>}
                    {label}
                  </button>
                )
              })}
            </nav>
          </div>
        )}
      </div>

      {/* Desktop: Sticky sidebar */}
      <aside className="hidden lg:block w-[250px] shrink-0">
        <div className="sticky top-[72px] bg-[#0c0c0f] border border-[#1c1c25] rounded-md p-6">
          <h3 className="font-mono text-xs text-[#e8e8ed]/40 uppercase tracking-wider mb-4">
            On This Page
          </h3>
          <nav className="flex flex-col gap-1">
            {TOC_ITEMS.map(({ id, label, indicator }) => {
              const isActive = activeId === id
              return (
                <button
                  key={id}
                  onClick={() => handleClick(id)}
                  className={`font-mono text-xs text-left px-3 py-2 rounded transition-colors relative ${
                    isActive
                      ? 'text-[#3ddc84] bg-[#3ddc84]/5 border-l-2 border-[#3ddc84]'
                      : 'text-[#e8e8ed]/40 hover:text-[#e8e8ed]/70 border-l-2 border-transparent'
                  }`}
                >
                  {indicator && <span className="mr-2">{indicator}</span>}
                  {label}
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
