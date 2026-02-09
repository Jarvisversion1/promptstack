/* ================================================================== */
/*  Enums                                                              */
/* ================================================================== */

export type ProjectTool =
  | 'cursor'
  | 'windsurf'
  | 'bolt'
  | 'lovable'
  | 'claude'
  | 'replit'
  | 'other'

export type ProjectCategory =
  | 'landing-page'
  | 'dashboard'
  | 'api'
  | 'mobile-app'
  | 'cli-tool'
  | 'chrome-extension'
  | 'full-stack-app'
  | 'component'
  | 'other'

export type ProjectDifficulty = 'beginner' | 'intermediate' | 'advanced'

/* ================================================================== */
/*  Base project — maps 1:1 to the projects table                      */
/* ================================================================== */

export type Project = {
  id: string
  author_id: string
  title: string
  slug: string
  description: string | null
  tool: ProjectTool
  category: ProjectCategory
  difficulty: ProjectDifficulty | null
  demo_url: string | null
  cover_image_url: string | null
  is_published: boolean
  is_approved: boolean
  forked_from_id: string | null
  inspired_by_id: string | null
  import_method: 'session_export' | 'manual' | null
  star_count: number
  fork_count: number
  comment_count: number
  created_at: string
  updated_at: string
}

/* ================================================================== */
/*  Shared sub-types                                                   */
/* ================================================================== */

export type ProjectAuthor = {
  username: string
  display_name?: string | null
  avatar_url: string | null
}

export type ProjectTag = {
  tag_name: string
}

export type PromptStep = {
  id: string
  project_id: string
  step_order: number
  title: string
  prompt_text: string
  context_mode: string | null
  output_notes: string | null
  tips: string | null
  screenshot_url: string | null
  fork_note: string | null
  created_at: string
}

export type ProjectReference = {
  title: string
  slug: string
  author_username: string
}

/* ================================================================== */
/*  Composite types                                                    */
/* ================================================================== */

/** Card-level type used in listings (homepage, explore, related) */
export type ProjectWithDetails = Project & {
  author: ProjectAuthor
  tags: ProjectTag[]
  step_count: number
}

/** Full detail type used on the project page */
export type ProjectDetail = Project & {
  author: ProjectAuthor
  steps: PromptStep[]
  tags: string[]
  forked_from: ProjectReference | null
  inspired_by: ProjectReference | null
}
