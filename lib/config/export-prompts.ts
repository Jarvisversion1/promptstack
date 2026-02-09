export type ExportToolSlug =
  | 'cursor'
  | 'windsurf'
  | 'bolt'
  | 'lovable'
  | 'claude'
  | 'replit'
  | 'other'

export type ExportToolConfig = {
  name: string
  slug: ExportToolSlug
  metaPrompt: string
  instructions: string
}

/* ------------------------------------------------------------------ */
/*  Base prompt template — only the context_mode line varies per tool  */
/* ------------------------------------------------------------------ */

const basePrompt = (contextModeLine: string): string =>
  `Review our entire conversation from the beginning. Extract every prompt I gave you, in sequential order. For each prompt, provide:

"step_order": Sequential number starting from 1
"title": A short 3-6 word title describing what the prompt does
"prompt_text": The exact prompt I wrote (full text, preserve formatting)
"context_mode": ${contextModeLine}
"output_summary": One sentence describing what you produced in response
"tips": Any issues I hit or corrections I made after this prompt (empty string if none)

Return ONLY a valid JSON array with no markdown formatting, no backticks, no explanation. Just the raw JSON array starting with [ and ending with ]`

/* ------------------------------------------------------------------ */
/*  Per-tool configuration                                             */
/* ------------------------------------------------------------------ */

export const EXPORT_PROMPTS: Record<ExportToolSlug, ExportToolConfig> = {
  cursor: {
    name: 'Cursor',
    slug: 'cursor',
    metaPrompt: basePrompt(
      'One of "inline", "composer", "cursor_rule", or "terminal"'
    ),
    instructions:
      'Paste this in the same Composer thread where you built your project. Works best at the end of a session.',
  },
  windsurf: {
    name: 'Windsurf',
    slug: 'windsurf',
    metaPrompt: basePrompt('"cascade"'),
    instructions:
      'Paste this in the Cascade panel in the same session where you built your project.',
  },
  claude: {
    name: 'Claude',
    slug: 'claude',
    metaPrompt: basePrompt('"chat"'),
    instructions:
      'Paste this at the end of your conversation. Claude will review the full chat history.',
  },
  bolt: {
    name: 'Bolt',
    slug: 'bolt',
    metaPrompt: basePrompt('"chat"'),
    instructions:
      'Paste this at the end of your Bolt chat session to extract the workflow.',
  },
  lovable: {
    name: 'Lovable',
    slug: 'lovable',
    metaPrompt: basePrompt('"chat"'),
    instructions:
      'Paste this at the end of your Lovable session to extract every prompt you used.',
  },
  replit: {
    name: 'Replit Agent',
    slug: 'replit',
    metaPrompt: basePrompt('"chat"'),
    instructions:
      'Paste this in your Replit Agent chat at the end of your session.',
  },
  other: {
    name: 'Other',
    slug: 'other',
    metaPrompt: basePrompt('"chat"'),
    instructions:
      'Paste this at the end of your AI conversation. Works with most AI coding tools.',
  },
}

export const EXPORT_TOOL_SLUGS = Object.keys(EXPORT_PROMPTS) as ExportToolSlug[]
