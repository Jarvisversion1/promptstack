import { buildMetadata } from '@/lib/seo'
import { GuideTOC } from '@/components/guide-toc'

export const metadata = buildMetadata({
  title: 'The Guide',
  description:
    'Learn how to use PromptStack with Cursor, Lovable, Windsurf, Bolt, and every AI coding tool.',
  path: '/guide',
})

export default function GuidePage() {
  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-12">
          <GuideTOC />

          <main className="flex-1 max-w-[700px]">
            {/* Page Header */}
            <div className="mb-16">
              <h1 className="font-mono text-4xl md:text-5xl font-bold mb-4">
                The Guide
              </h1>
              <p className="text-lg text-[#e8e8ed]/50">
                Learn how to use PromptStack with Cursor, Lovable, Windsurf,
                Bolt, and every AI coding tool.
              </p>
            </div>

            {/* Why PromptStack */}
            <section id="why-promptstack" className="py-16 scroll-mt-24">
              <h2 className="font-mono text-3xl font-bold mb-6 text-[#3ddc84]">
                // Why PromptStack
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-[#e8e8ed]/70 leading-relaxed mb-4">
                  We built PromptStack with Cursor in two weeks. 38 prompts. 12
                  separate chat sessions. By the end, we had a working platform
                  — and absolutely no way to share how we built it.
                </p>
                <p className="text-[#e8e8ed]/70 leading-relaxed mb-4">
                  That&apos;s the problem every vibe coder faces. You ship
                  something cool. Someone asks &quot;what prompts did you
                  use?&quot; And you&apos;ve got nothing. The prompts are
                  buried in chat histories that expire, scattered across
                  sessions you can&apos;t find, or lost entirely when you close
                  a tab.
                </p>
                <p className="text-[#e8e8ed]/70 leading-relaxed">
                  Tutorials don&apos;t capture this. Blog posts don&apos;t
                  capture this. GitHub repos capture the output but not the
                  process. PromptStack makes it permanent.
                </p>
              </div>
            </section>

            {/* What It Is (and Isn't) */}
            <section id="what-it-is" className="py-16 scroll-mt-24">
              <h2 className="font-mono text-3xl font-bold mb-6 text-[#3ddc84]">
                // What It Is (and Isn&apos;t)
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-mono text-xl font-semibold mb-3 text-[#e8e8ed]">
                    It is:
                  </h3>
                  <ul className="space-y-2 text-[#e8e8ed]/70">
                    <li className="flex gap-3">
                      <span className="text-[#3ddc84] mt-1">→</span>
                      <span>
                        A community platform for sharing complete prompt
                        workflows
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#3ddc84] mt-1">→</span>
                      <span>
                        A place to discover how real builders ship real software
                        with AI tools
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#3ddc84] mt-1">→</span>
                      <span>
                        A fork-and-remix system where you take someone&apos;s
                        workflow and adapt it
                      </span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-mono text-xl font-semibold mb-3 text-[#e8e8ed]">
                    It is not:
                  </h3>
                  <ul className="space-y-2 text-[#e8e8ed]/70">
                    <li className="flex gap-3">
                      <span className="text-[#e8e8ed]/30 mt-1">×</span>
                      <span>
                        A single-prompt library (one prompt without context is
                        not useful)
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#e8e8ed]/30 mt-1">×</span>
                      <span>
                        A prompt engineering course (we show practice, not
                        theory)
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-[#e8e8ed]/30 mt-1">×</span>
                      <span>
                        A marketplace (everything is free, forever)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Who It's For */}
            <section id="who-its-for" className="py-16 scroll-mt-24">
              <h2 className="font-mono text-3xl font-bold mb-6 text-[#3ddc84]">
                // Who It&apos;s For
              </h2>
              <div className="grid gap-4">
                <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-6">
                  <div className="font-mono text-lg font-semibold mb-2 text-[#e8e8ed]">
                    1. Builders
                  </div>
                  <p className="text-[#e8e8ed]/60">
                    Who vibe code with Cursor, Windsurf, Bolt, Lovable, Claude,
                    or any AI coding tool
                  </p>
                </div>
                <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-6">
                  <div className="font-mono text-lg font-semibold mb-2 text-[#e8e8ed]">
                    2. Beginners
                  </div>
                  <p className="text-[#e8e8ed]/60">
                    Who learn by studying real workflows — not tutorials, but
                    actual prompts that produced working code, including the
                    ones that went wrong
                  </p>
                </div>
                <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-6">
                  <div className="font-mono text-lg font-semibold mb-2 text-[#e8e8ed]">
                    3. Developers evaluating tools
                  </div>
                  <p className="text-[#e8e8ed]/60">
                    Compare Cursor vs Windsurf workflows side by side
                  </p>
                </div>
              </div>
            </section>

            {/* "Prompts Aren't Code" */}
            <section id="prompts-arent-code" className="py-16 scroll-mt-24">
              <h2 className="font-mono text-3xl font-bold mb-6 text-[#3ddc84]">
                // &quot;Prompts Aren&apos;t Code&quot;
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-[#e8e8ed]/70 leading-relaxed mb-4">
                  Prompts don&apos;t have version control, dependency trees, or
                  merge conflicts. You can&apos;t git diff a prompt. A single
                  word change can alter everything. This is why PromptStack
                  doesn&apos;t try to be GitHub for prompts.
                </p>
                <p className="text-[#e8e8ed]/70 leading-relaxed mb-4">
                  PromptStack is a recipe network, not a code repository. The
                  value is in:
                </p>
                <ul className="space-y-2 text-[#e8e8ed]/70 mb-4">
                  <li className="flex gap-3">
                    <span className="text-[#3ddc84] mt-1">→</span>
                    <span>
                      <strong>The sequence</strong> — what order you do things
                      in matters
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#3ddc84] mt-1">→</span>
                    <span>
                      <strong>The context</strong> — &quot;I used Composer mode,
                      not inline&quot; changes everything
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#3ddc84] mt-1">→</span>
                    <span>
                      <strong>The failures</strong> — &quot;I tried TypeScript
                      first but it was messy&quot; is the most valuable info
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[#3ddc84] mt-1">→</span>
                    <span>
                      <strong>The variations</strong> — your React version, my
                      Vue version, same approach
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* How to Export */}
            <section id="how-to-export" className="py-16 scroll-mt-24">
              <h2 className="font-mono text-3xl font-bold mb-6 text-[#3ddc84]">
                // How to Export
              </h2>
              <div className="bg-[#0c0c0f] border-l-4 border-[#3ddc84] p-6 rounded-r-lg mb-6">
                <h3 className="font-mono text-xl font-semibold mb-4 text-[#e8e8ed]">
                  The 5-minute flow:
                </h3>
                <ol className="space-y-3 text-[#e8e8ed]/70">
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">1.</span>
                    <span>Build something with your AI coding tool</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">2.</span>
                    <span>Go to promptstack.sh/export</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">3.</span>
                    <span>
                      Pick your tool — we give you a ready-made export prompt
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">4.</span>
                    <span>Paste it into your AI tool</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">5.</span>
                    <span>Copy the JSON it gives back</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">6.</span>
                    <span>
                      Paste into PromptStack — we auto-fill everything
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">7.</span>
                    <span>Review, edit, publish</span>
                  </li>
                </ol>
              </div>
              <p className="text-[#e8e8ed]/70 leading-relaxed">
                But <strong>HOW</strong> you do this depends on your tool. AI
                coding tools fall into two categories.
              </p>
            </section>

            {/* Single-Window Tools */}
            <section id="single-window-tools" className="py-16 scroll-mt-24">
              <div className="border-l-4 border-orange-500 pl-6 mb-8">
                <h2 className="font-mono text-3xl font-bold mb-2 text-orange-400">
                  // Single-Window Tools 🔴
                </h2>
                <p className="font-mono text-sm text-[#e8e8ed]/50">
                  Lovable · Bolt · v0 · Replit Agent
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="font-mono text-xl font-semibold mb-3 text-[#e8e8ed]">
                    How they work:
                  </h3>
                  <p className="text-[#e8e8ed]/70 leading-relaxed">
                    One continuous conversation. Every prompt builds on the
                    last. Your entire project lives in one thread.
                  </p>
                </div>

                <div>
                  <h3 className="font-mono text-xl font-semibold mb-4 text-[#e8e8ed]">
                    Your workflow:
                  </h3>
                  <div className="bg-[#0c0c0f] border border-orange-500/30 rounded-lg p-6">
                    <div className="flex flex-col gap-3 text-[#e8e8ed]/70 font-mono text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400">▸</span>
                        <span>Start building</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400">▸</span>
                        <span>Prompts 1-8</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400">▸</span>
                        <span>Natural pause</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#3ddc84]">▸</span>
                        <span className="text-[#3ddc84]">
                          Paste export prompt
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#3ddc84]">▸</span>
                        <span className="text-[#3ddc84]">Copy JSON</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#3ddc84]">▸</span>
                        <span className="text-[#3ddc84]">
                          Save to PromptStack
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400">▸</span>
                        <span>Continue building</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400">▸</span>
                        <span>Prompts 9-16</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400">▸</span>
                        <span>Another pause</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#3ddc84]">▸</span>
                        <span className="text-[#3ddc84]">
                          Paste export prompt again
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#3ddc84]">▸</span>
                        <span className="text-[#3ddc84]">Copy JSON</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#3ddc84]">▸</span>
                        <span className="text-[#3ddc84]">
                          APPEND to same project
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400">▸</span>
                        <span>Keep going until you ship</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-xl font-semibold mb-4 text-[#e8e8ed]">
                    Key rules:
                  </h3>
                  <div className="grid gap-4">
                    <div className="bg-[#0c0c0f] border border-orange-500/30 rounded-lg p-5">
                      <div className="font-mono text-orange-400 mb-2">
                        Rule 1
                      </div>
                      <p className="text-[#e8e8ed]/70">
                        Export every 8-10 prompts. Don&apos;t wait until the
                        end.
                      </p>
                    </div>
                    <div className="bg-[#0c0c0f] border border-orange-500/30 rounded-lg p-5">
                      <div className="font-mono text-orange-400 mb-2">
                        Rule 2
                      </div>
                      <p className="text-[#e8e8ed]/70">
                        Use &quot;Append Steps&quot; on PromptStack. Select your
                        existing project. Steps add after previous ones.
                      </p>
                    </div>
                    <div className="bg-[#0c0c0f] border border-orange-500/30 rounded-lg p-5">
                      <div className="font-mono text-orange-400 mb-2">
                        Rule 3
                      </div>
                      <p className="text-[#e8e8ed]/70">
                        The export prompt is just another message in your
                        conversation. It doesn&apos;t break anything.
                      </p>
                    </div>
                    <div className="bg-[#0c0c0f] border border-orange-500/30 rounded-lg p-5">
                      <div className="font-mono text-orange-400 mb-2">
                        Rule 4
                      </div>
                      <p className="text-[#e8e8ed]/70">
                        One conversation = one Prompt Project. Simple mapping.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-xl font-semibold mb-4 text-[#e8e8ed]">
                    Example:
                  </h3>
                  <div className="bg-[#0c0c0f] border border-orange-500/30 rounded-lg p-6">
                    <h4 className="font-mono text-sm text-orange-400 mb-4">
                      Building a landing page in Lovable:
                    </h4>
                    <div className="space-y-3 text-[#e8e8ed]/70 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-orange-400 mt-1">→</span>
                        <div>
                          <strong>Prompts 1-4:</strong> Layout and hero{' '}
                          <span className="text-[#3ddc84]">
                            → Export → Create project
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-orange-400 mt-1">→</span>
                        <div>
                          <strong>Prompts 5-8:</strong> Pricing and FAQ{' '}
                          <span className="text-[#3ddc84]">→ Export → Append</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-orange-400 mt-1">→</span>
                        <div>
                          <strong>Prompts 9-12:</strong> Contact form and fixes{' '}
                          <span className="text-[#3ddc84]">→ Export → Append</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84] mt-1">✓</span>
                        <div>
                          <strong>Publish.</strong> 12-step Prompt Project.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Multi-Chat Tools */}
            <section id="multi-chat-tools" className="py-16 scroll-mt-24">
              <div className="border-l-4 border-[#3ddc84] pl-6 mb-8">
                <h2 className="font-mono text-3xl font-bold mb-2 text-[#3ddc84]">
                  // Multi-Chat Tools 🟢
                </h2>
                <p className="font-mono text-sm text-[#e8e8ed]/50">
                  Cursor · Windsurf · Claude
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="font-mono text-xl font-semibold mb-3 text-[#e8e8ed]">
                    How they work:
                  </h3>
                  <p className="text-[#e8e8ed]/70 leading-relaxed">
                    Multiple short chat sessions. Each session is separate. You
                    might use Composer for one feature, inline for a fix,
                    terminal for a command. Project spread across many
                    conversations.
                  </p>
                </div>

                <div className="bg-[#0c0c0f] border-l-4 border-[#3ddc84] p-6 rounded-r-lg">
                  <h3 className="font-mono text-xl font-semibold mb-3 text-[#3ddc84]">
                    The golden rule:
                  </h3>
                  <p className="text-lg text-[#e8e8ed] leading-relaxed">
                    &quot;One feature = one chat. Export at the end of every
                    chat. Start fresh for the next feature.&quot;
                  </p>
                </div>

                <div>
                  <h3 className="font-mono text-xl font-semibold mb-4 text-[#e8e8ed]">
                    Your workflow:
                  </h3>
                  <div className="bg-[#0c0c0f] border border-[#3ddc84]/30 rounded-lg p-6">
                    <div className="space-y-3 text-[#e8e8ed]/70 font-mono text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84]">▸</span>
                        <div>
                          <strong>Chat 1 (Setup):</strong> 3-5 prompts{' '}
                          <span className="text-[#3ddc84]">
                            → Export → Create project
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84]">▸</span>
                        <div>
                          <strong>Chat 2 (Auth):</strong> 3-5 prompts{' '}
                          <span className="text-[#3ddc84]">→ Export → Append</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84]">▸</span>
                        <div>
                          <strong>Chat 3 (Homepage):</strong> 4-6 prompts{' '}
                          <span className="text-[#3ddc84]">→ Export → Append</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84]">▸</span>
                        <div>
                          <strong>Chat 4 (API):</strong> 3-5 prompts{' '}
                          <span className="text-[#3ddc84]">→ Export → Append</span>
                        </div>
                      </div>
                      <div className="text-[#e8e8ed]/40 text-xs mt-4">
                        Each chat starts with a 3-line context preamble.
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-xl font-semibold mb-4 text-[#e8e8ed]">
                    The preamble:
                  </h3>
                  <div className="bg-black border border-[#3ddc84]/30 rounded-lg p-5 font-mono text-sm text-[#e8e8ed]/80">
                    <div>
                      I&apos;m building [project name]. Check .cursorrules for
                      context.
                    </div>
                    <div>Relevant files: [list 2-3 files].</div>
                    <div>Now build: [your actual prompt]</div>
                  </div>
                  <p className="text-[#e8e8ed]/60 text-sm mt-3 leading-relaxed">
                    This 3-line preamble replaces 20 prompts of history. The AI
                    reads your actual files instead of relying on memory.
                  </p>
                </div>

                <div>
                  <h3 className="font-mono text-xl font-semibold mb-4 text-[#e8e8ed]">
                    Key rules:
                  </h3>
                  <div className="grid gap-4">
                    <div className="bg-[#0c0c0f] border border-[#3ddc84]/30 rounded-lg p-5">
                      <div className="font-mono text-[#3ddc84] mb-2">
                        Rule 1
                      </div>
                      <p className="text-[#e8e8ed]/70">
                        One feature = one chat. Always. Auth? One chat.
                        Homepage? New chat.
                      </p>
                    </div>
                    <div className="bg-[#0c0c0f] border border-[#3ddc84]/30 rounded-lg p-5">
                      <div className="font-mono text-[#3ddc84] mb-2">
                        Rule 2
                      </div>
                      <p className="text-[#e8e8ed]/70">
                        Start every chat with the context preamble.
                      </p>
                    </div>
                    <div className="bg-[#0c0c0f] border border-[#3ddc84]/30 rounded-lg p-5">
                      <div className="font-mono text-[#3ddc84] mb-2">
                        Rule 3
                      </div>
                      <p className="text-[#e8e8ed]/70">
                        Export at the end of EVERY chat. Each chat is 3-6
                        prompts — perfect export size.
                      </p>
                    </div>
                    <div className="bg-[#0c0c0f] border border-[#3ddc84]/30 rounded-lg p-5">
                      <div className="font-mono text-[#3ddc84] mb-2">
                        Rule 4
                      </div>
                      <p className="text-[#e8e8ed]/70">
                        3-8 prompts per chat is the sweet spot.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-xl font-semibold mb-4 text-[#e8e8ed]">
                    Example:
                  </h3>
                  <div className="bg-[#0c0c0f] border border-[#3ddc84]/30 rounded-lg p-6">
                    <h4 className="font-mono text-sm text-[#3ddc84] mb-4">
                      Building a dashboard in Cursor:
                    </h4>
                    <div className="space-y-3 text-[#e8e8ed]/70 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84] mt-1">→</span>
                        <div>
                          <strong>Chat 1:</strong> Scaffold + Supabase (4
                          prompts){' '}
                          <span className="text-[#3ddc84]">
                            → Export → Create
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84] mt-1">→</span>
                        <div>
                          <strong>Chat 2:</strong> Auth with GitHub (3 prompts){' '}
                          <span className="text-[#3ddc84]">→ Export → Append</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84] mt-1">→</span>
                        <div>
                          <strong>Chat 3:</strong> Dashboard layout (5 prompts){' '}
                          <span className="text-[#3ddc84]">→ Export → Append</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84] mt-1">→</span>
                        <div>
                          <strong>Chat 4:</strong> Data + filters (4 prompts){' '}
                          <span className="text-[#3ddc84]">→ Export → Append</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84] mt-1">→</span>
                        <div>
                          <strong>Chat 5:</strong> Deploy (2 prompts){' '}
                          <span className="text-[#3ddc84]">→ Export → Append</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-[#3ddc84] mt-1">✓</span>
                        <div>
                          <strong>Publish.</strong> 18 steps across 5 sessions.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* When to Export — Quick Reference */}
            <section id="when-to-export" className="py-16 scroll-mt-24">
              <h2 className="font-mono text-3xl font-bold mb-6 text-[#3ddc84]">
                // When to Export — Quick Reference
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-[#1c1c25]">
                      <th className="text-left font-mono text-sm text-[#e8e8ed]/60 pb-3 pr-4">
                        Tool
                      </th>
                      <th className="text-left font-mono text-sm text-[#e8e8ed]/60 pb-3 pr-4">
                        Session Style
                      </th>
                      <th className="text-left font-mono text-sm text-[#e8e8ed]/60 pb-3 pr-4">
                        When to Export
                      </th>
                      <th className="text-left font-mono text-sm text-[#e8e8ed]/60 pb-3">
                        How Often
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    <tr className="border-b border-[#1c1c25]/50">
                      <td className="py-3 pr-4 text-[#e8e8ed]">Lovable</td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        Single window
                      </td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        Every 8-10 prompts
                      </td>
                      <td className="py-3 text-[#e8e8ed]/60">
                        3-5 times per project
                      </td>
                    </tr>
                    <tr className="border-b border-[#1c1c25]/50">
                      <td className="py-3 pr-4 text-[#e8e8ed]">Bolt</td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        Single window
                      </td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        Every 8-10 prompts
                      </td>
                      <td className="py-3 text-[#e8e8ed]/60">
                        3-5 times per project
                      </td>
                    </tr>
                    <tr className="border-b border-[#1c1c25]/50">
                      <td className="py-3 pr-4 text-[#e8e8ed]">v0</td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        Single window
                      </td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        Every 8-10 prompts
                      </td>
                      <td className="py-3 text-[#e8e8ed]/60">
                        3-5 times per project
                      </td>
                    </tr>
                    <tr className="border-b border-[#1c1c25]/50">
                      <td className="py-3 pr-4 text-[#e8e8ed]">
                        Replit Agent
                      </td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        Single window
                      </td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        Every 8-10 prompts
                      </td>
                      <td className="py-3 text-[#e8e8ed]/60">
                        3-5 times per project
                      </td>
                    </tr>
                    <tr className="border-b border-[#1c1c25]/50">
                      <td className="py-3 pr-4 text-[#e8e8ed]">Cursor</td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">Multi-chat</td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        End of every chat
                      </td>
                      <td className="py-3 text-[#e8e8ed]/60">
                        Every chat (3-8 prompts)
                      </td>
                    </tr>
                    <tr className="border-b border-[#1c1c25]/50">
                      <td className="py-3 pr-4 text-[#e8e8ed]">Windsurf</td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">Multi-chat</td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        End of every chat
                      </td>
                      <td className="py-3 text-[#e8e8ed]/60">
                        Every chat (3-8 prompts)
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 pr-4 text-[#e8e8ed]">Claude</td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">Multi-chat</td>
                      <td className="py-3 pr-4 text-[#e8e8ed]/60">
                        End of every chat
                      </td>
                      <td className="py-3 text-[#e8e8ed]/60">
                        Every chat (3-8 prompts)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* The Token Problem */}
            <section id="token-problem" className="py-16 scroll-mt-24">
              <h2 className="font-mono text-3xl font-bold mb-6 text-[#3ddc84]">
                // The Token Problem
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-[#e8e8ed]/70 leading-relaxed mb-4">
                  When you paste the export prompt, the AI re-reads your entire
                  conversation. Longer conversation = more tokens burned. In a
                  40-prompt session, the export alone might cost as much as 5
                  regular prompts.
                </p>
                <p className="text-[#e8e8ed]/70 leading-relaxed mb-4">
                  Worse — long conversations produce bad exports. The AI
                  summarizes early prompts instead of extracting them exactly.
                  It skips steps. It merges prompts.
                </p>
                <div className="bg-[#0c0c0f] border-l-4 border-[#3ddc84] p-6 rounded-r-lg">
                  <p className="text-[#e8e8ed] font-semibold leading-relaxed">
                    Frequent exports fix both problems. 8 prompts is easy to
                    re-read accurately and costs almost nothing.
                  </p>
                </div>
              </div>
            </section>

            {/* Forking & Remixing */}
            <section id="forking-remixing" className="py-16 scroll-mt-24">
              <h2 className="font-mono text-3xl font-bold mb-6 text-[#3ddc84]">
                // Forking & Remixing
              </h2>
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-[#e8e8ed]/70 leading-relaxed">
                  Found a prompt project for React but you use Vue? Fork it.
                </p>
              </div>
              <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-6">
                <ol className="space-y-3 text-[#e8e8ed]/70">
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">1.</span>
                    <span>Click Fork on any project</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">2.</span>
                    <span>Get a complete copy in your account</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">3.</span>
                    <span>Edit prompts for your stack</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">4.</span>
                    <span>
                      Add notes explaining why you changed each step
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-mono text-[#3ddc84]">5.</span>
                    <span>Publish your remix</span>
                  </li>
                </ol>
              </div>
              <p className="text-[#e8e8ed]/60 text-sm mt-4">
                Original author gets credit. Community gets a new version.
              </p>
            </section>

            {/* What Makes a Great Prompt Project */}
            <section id="great-project" className="py-16 scroll-mt-24">
              <h2 className="font-mono text-3xl font-bold mb-6 text-[#3ddc84]">
                // What Makes a Great Prompt Project
              </h2>
              <div className="grid gap-4">
                <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-6">
                  <div className="font-mono text-lg font-semibold mb-2 text-[#3ddc84]">
                    1. Real, not hypothetical
                  </div>
                  <p className="text-[#e8e8ed]/60">
                    You actually built something. Include a demo link.
                  </p>
                </div>
                <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-6">
                  <div className="font-mono text-lg font-semibold mb-2 text-[#3ddc84]">
                    2. Complete, not cherry-picked
                  </div>
                  <p className="text-[#e8e8ed]/60">
                    Include the failures and course-corrections.
                  </p>
                </div>
                <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-6">
                  <div className="font-mono text-lg font-semibold mb-2 text-[#3ddc84]">
                    3. Contextual
                  </div>
                  <p className="text-[#e8e8ed]/60">
                    What mode, what went wrong, what you&apos;d do differently.
                  </p>
                </div>
                <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-6">
                  <div className="font-mono text-lg font-semibold mb-2 text-[#3ddc84]">
                    4. Session-aware
                  </div>
                  <p className="text-[#e8e8ed]/60">
                    Mark where you started new chats or exported.
                  </p>
                </div>
                <div className="bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-6">
                  <div className="font-mono text-lg font-semibold mb-2 text-[#3ddc84]">
                    5. Reasonable length
                  </div>
                  <p className="text-[#e8e8ed]/60">
                    5-30 steps. Split into parts if 50+.
                  </p>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
