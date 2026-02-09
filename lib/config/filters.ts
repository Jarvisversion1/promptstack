export type FilterOption = {
  label: string
  value: string
}

export type SortValue = 'newest' | 'stars' | 'forks' | 'discussed'

/* ================================================================== */
/*  Tools                                                              */
/* ================================================================== */

export const TOOLS: FilterOption[] = [
  { label: 'Cursor', value: 'cursor' },
  { label: 'Windsurf', value: 'windsurf' },
  { label: 'Bolt', value: 'bolt' },
  { label: 'Lovable', value: 'lovable' },
  { label: 'Claude', value: 'claude' },
  { label: 'Replit Agent', value: 'replit' },
  { label: 'Other', value: 'other' },
]

/* ================================================================== */
/*  Categories                                                         */
/* ================================================================== */

export const CATEGORIES: FilterOption[] = [
  { label: 'Landing Page', value: 'landing-page' },
  { label: 'Dashboard', value: 'dashboard' },
  { label: 'API', value: 'api' },
  { label: 'Mobile App', value: 'mobile-app' },
  { label: 'CLI Tool', value: 'cli-tool' },
  { label: 'Chrome Extension', value: 'chrome-extension' },
  { label: 'Full Stack App', value: 'full-stack-app' },
  { label: 'Component', value: 'component' },
  { label: 'Other', value: 'other' },
]

/* ================================================================== */
/*  Difficulties                                                       */
/* ================================================================== */

export const DIFFICULTIES: FilterOption[] = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
]

/* ================================================================== */
/*  Sort options                                                       */
/* ================================================================== */

export const SORT_OPTIONS: FilterOption[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Stars', value: 'stars' },
  { label: 'Most Forks', value: 'forks' },
  { label: 'Most Discussed', value: 'discussed' },
]
