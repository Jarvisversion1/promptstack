# PromptStack — Product Roadmap

## The One-Liner
PromptStack is where vibe coders share, fork, and remix the prompt workflows behind real projects.

Not a prompt library. Not a chatbot wrapper. It's the recipe network for AI-coded software — end-to-end workflows that show how real things get built, with one-click export from any AI coding tool.

## Vision & Positioning

### What PromptStack Is
A community platform where builders share **Prompt Projects** — the full sequence of prompts used to build real software with tools like Cursor, Windsurf, Bolt, Lovable, and Claude. The critical innovation: a **Session Export system** that lets users extract their entire prompt workflow with a single meta-prompt, eliminating the biggest barrier to contribution.

### What It Is NOT

- Not a single-prompt snippet library (too atomic, not useful)
- Not a prompt engineering course (too educational, not practical)
- Not an AI tool marketplace (no SaaS, no subscriptions)
- Not GitHub for prompts (prompts don't have diffs, branches, or merge conflicts)

### Core Insight
When someone ships a cool vibe-coded project, everyone asks: **"What prompts did you use?"** That question has no good answer today. PromptStack is the answer — and the Session Export system makes answering that question effortless.

## The Prompt Philosophy: Cookbooks, Not Codebases

Prompts are fundamentally different from code:

- There's no "change line 42" — you rewrite the whole thing
- There's no compile/test cycle — the same prompt gives different outputs
- There's no dependency tree — prompts are self-contained blobs
- Version diffs are meaningless — a single word change alters everything

So PromptStack follows **cookbook logic, not git logic**:

- **Fork > Version** — Instead of updating a prompt, someone makes their own version. Every fork IS a version. 400 variations of "build a SaaS dashboard" is a feature, not a bug.
- **Context > Diffs** — Instead of showing what changed, show WHY someone changed it. "I switched from Composer to inline because Composer kept adding boilerplate" is 10x more valuable than a text diff.
- **Comparison > History** — Side-by-side view of original vs. fork, not a commit log.
- **"Inspired by" > "Forked from"** — Since people rewrite entire prompts, the link isn't "I modified your code" — it's "your approach taught me, here's my take."

### Target Users

- Builders who vibe code with Cursor, Windsurf, Bolt, Lovable, Claude
- Beginners who want to learn by studying how others build
- Tool-curious developers evaluating which AI coding tools to adopt

### Business Model (V1)
None. Pure community play. Visibility, SEO traffic, brand building.

## Core Concept: The Prompt Project

A **Prompt Project** is the atomic unit of PromptStack. It represents the complete prompt workflow behind a real piece of software.

### Prompt Project Structure

```
📁 Prompt Project
├── Title: "SaaS Landing Page with Stripe Integration"
├── Author: @abhishek
├── Tool: Cursor + Claude Sonnet
├── Stack: Next.js, Tailwind, Supabase, Stripe
├── Description: What this builds and why
├── Demo Link: (optional) URL to the live result
├── Screenshot/Preview: What the output looks like
│
├── 📝 Step 1: "Scaffold the project"
│   ├── Prompt text (full blob, not a diff)
│   ├── Context notes: "Used as a Cursor rule, not inline"
│   ├── What it produced (description or screenshot)
│   └── Tips: "Add 'use TypeScript strict' for better output"
│
├── 📝 Step 2: "Build the hero section"
│   └── ...
│
├── ... (5-20 steps typically)
│
├── 📝 Final Step: "Deploy to Vercel"
│
├── Tags: [landing-page, stripe, nextjs, cursor, beginner-friendly]
├── Difficulty: Beginner / Intermediate / Advanced
├── Inspired by: (optional) link to another Prompt Project
└── Stats: ⭐ 234 stars | 🍴 45 forks | 💬 12 comments
```

## V1 Feature List (Detailed)

### 1. Session Export System ⚡ (Key Differentiator)

The #1 barrier to contribution on any community platform is friction. Writing up a 12-step prompt workflow from memory is painful. **Session Export** solves this by letting users extract their entire workflow with a single meta-prompt — pasted at the end of their AI coding session.

#### How It Works:

1. User finishes building something in Cursor/Claude/Windsurf
2. User visits `promptstack.dev/export`
3. User copies a pre-written meta-prompt optimized for their tool
4. User pastes it into their AI tool's chat
5. The AI reviews the conversation and outputs a structured JSON of every prompt used, in order, with titles and context
6. User pastes the JSON into PromptStack's import form
7. PromptStack auto-parses it into a Prompt Project with all steps pre-filled
8. User reviews, edits, adds screenshots if they want, and publishes

#### The Meta-Prompts (one per tool):

Each meta-prompt is pre-written, tested, and optimized. Example for Cursor:

```
Review our entire conversation from the beginning. Extract every prompt
I gave you, in sequential order. For each prompt, provide:

1. "title": A short 3-6 word title describing what the prompt does
2. "prompt_text": The exact prompt I wrote (full text)
3. "context_mode": Whether I used "inline", "composer", "cursor_rule", or "terminal"
4. "output_summary": One sentence describing what you produced in response
5. "tips": Any issues I hit or corrections I made after this prompt (empty string if none)

Return ONLY a JSON array, no markdown, no explanation. Format:
[{"title": "...", "prompt_text": "...", "context_mode": "...", "output_summary": "...", "tips": "..."}, ...]
```

#### Export Page (`promptstack.dev/export`):

- Tool selector: Cursor | Claude | Windsurf | Bolt | Lovable | Replit | Other
- Displays the optimized meta-prompt for that tool
- "Copy to clipboard" button
- Instructions with screenshots showing where to paste
- "Import JSON" textarea below where user pastes the output
- Auto-parse into editable Prompt Project form
- Validation: checks JSON structure, flags empty fields, suggests improvements

#### Why This Is V1, Not V2:

This isn't a nice-to-have — it's the entire contribution strategy. Without it, you're asking people to manually reconstruct workflows. With it, publishing a Prompt Project takes 5 minutes instead of 30. This is the difference between 50 contributions and 500.

### 2. Prompt Project CRUD

#### Create a Prompt Project (two paths):

**Path A: Session Export (primary, recommended)**

1. Import JSON from Session Export → auto-fills all steps
2. User adds: Title, Description, Tool, Stack tags, Category, Difficulty, Demo URL, Cover image
3. User reviews/edits auto-filled steps
4. Publish or save as Draft

**Path B: Manual entry (fallback)**

- Title (required, max 100 chars)
- Description (required, markdown supported, max 2000 chars)
- Tool used (required, dropdown: Cursor, Windsurf, Bolt, Lovable, Claude, Replit Agent, Other)
- Tech stack tags (multi-select + custom: Next.js, React, Vue, Python, Supabase, Firebase, Tailwind, etc.)
- Category (required: Landing Page, Dashboard, API, Mobile App, CLI Tool, Chrome Extension, Full Stack App, Component, Other)
- Difficulty level (Beginner, Intermediate, Advanced)
- Demo URL (optional)
- Cover image/screenshot (optional, uploaded)
- Prompt steps (ordered list, minimum 3):
  - Each step has: Step title, Prompt text (full blob), Context/mode, Output notes, Optional screenshot
- Visibility: Public or Draft

#### Edit a Prompt Project

- Full edit capability for authors
- "Last edited X days ago" timestamp (no version history in V1 — see Philosophy section)

#### Delete a Prompt Project

- Soft delete with 30-day recovery

### 3. Fork & Remix

- Any user can fork a public Prompt Project to their account
- Forked project shows "Inspired by @original_author/project-name" (not "forked from" — see Philosophy)
- Fork count visible on original project
- User can modify any prompt steps, add/remove steps, change everything
- Fork network visible: "3 remixes of this project" with links
- **Comparison view**: Side-by-side display of original vs. fork showing both prompt texts with the forker's "why I changed this" notes (NOT a line-by-line diff — full prompt blobs side by side)

### 4. Browse & Discover

#### Homepage

- Hero section explaining PromptStack in 5 seconds
- Prominent "Export Your Session" CTA (drives contributions from day one)
- "Trending This Week" — top projects by stars + forks in last 7 days
- "Just Shipped" — newest projects
- "Staff Picks" — manually curated by you (editorial voice matters)
- Filter bar: by tool, by category, by difficulty
- Search bar (full-text search across titles, descriptions, prompt text, tags)

#### Explore Page

- Grid/list view of all projects
- Sort by: Most Stars, Most Forks, Newest, Most Discussed
- Filter by: Tool, Category, Stack, Difficulty
- Infinite scroll pagination

#### Individual Project Page

- Clean layout showing the full prompt workflow
- Step-by-step display with expandable prompt text
- "Copy prompt" button on each step
- "Copy all prompts" button for the full project
- Star, Fork, and Share buttons
- "Remix this" button (forks + opens editor)
- Comments section at the bottom
- Author card with link to profile
- Related projects sidebar
- If forked: "Inspired by" link to original + comparison view toggle

### 5. User System

#### Authentication

- Sign up / Sign in with GitHub (primary — this is your audience)
- Google OAuth as secondary option
- No email/password in V1 (reduces friction and abuse)

#### User Profile

- Display name, avatar (from GitHub/Google), bio (max 280 chars)
- "My Projects" tab — projects they've created
- "My Remixes" tab — projects they've forked
- "Starred" tab — projects they've starred
- Stats: total stars received, total forks, projects created
- Public profile URL: `promptstack.dev/@username`

### 6. Social & Engagement

#### Stars

- One star per user per project
- Star count visible on project cards and project page
- "Starred by" list on project page

#### Comments

- Threaded comments on each project (one level deep, no nested threads)
- Markdown support in comments
- Author can pin one comment
- Comment count visible on project cards

#### Share

- Copy link button
- Twitter/X share with pre-filled text: "Check out this prompt workflow for building [X] with [Tool] on @promptstack"
- Open Graph meta tags for rich link previews

### 7. Content & SEO

#### SEO-Optimized URLs

- `promptstack.dev/@username/project-slug`
- `promptstack.dev/explore/cursor` (tool pages)
- `promptstack.dev/explore/landing-page` (category pages)
- `promptstack.dev/trending`
- `promptstack.dev/export` (Session Export page — high-intent SEO keyword: "export cursor prompts", "save my AI coding session")

#### Meta & OG Tags

- Unique title, description, and OG image for every project page
- Tool-specific explore pages for long-tail SEO
- Structured data (JSON-LD) for search engines

#### Sitemap & Indexing

- Auto-generated sitemap
- Submit to Google Search Console on launch

### 8. Moderation & Quality

#### Submission Review (V1)

- All new projects go into a moderation queue
- You (Abhishek) manually approve/reject
- Rejection sends a notification with reason
- This keeps quality high during early growth
- Plan to move to community moderation in V2

#### Reporting

- "Report" button on projects and comments
- Report reasons: spam, low quality, copied without credit, inappropriate

#### Content Guidelines

- Published on the site: what makes a good Prompt Project
- Minimum 3 prompt steps
- Must describe what the prompts build
- No placeholder or dummy content
- Encouraged: screenshots, demo links, context notes on each step

## Tech Stack (Recommended for V1)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | SSR for SEO, React ecosystem |
| Styling | Tailwind CSS | Fast, consistent, you know it |
| Database | Supabase (Postgres) | Auth + DB + Storage in one, you have experience |
| Auth | Supabase Auth (GitHub + Google) | Integrated, free tier generous |
| Image Storage | Supabase Storage | Screenshots and cover images |
| Search | Supabase full-text search (V1), Algolia (later) | Good enough for V1 |
| JSON Parsing | Zod (schema validation) | Validates Session Export JSON reliably |
| Hosting | Vercel | Free tier, you've deployed here before |
| Analytics | Plausible or PostHog | Privacy-friendly, free/cheap |
| Email (transactional) | Resend | Simple, developer-friendly |

## Data Model (Simplified)

**Users**
- id, github_id, google_id, username, display_name, avatar_url, bio, created_at

**Projects**
- id, author_id, title, slug, description, tool, category, difficulty, demo_url, cover_image_url, is_published, is_approved, forked_from_id, inspired_by_id, star_count, fork_count, comment_count, import_method (session_export | manual), created_at, updated_at

**Project Tags**
- id, project_id, tag_name

**Prompt Steps**
- id, project_id, step_order, title, prompt_text, context_mode (inline/composer/rule/terminal), output_notes, tips, screenshot_url, fork_note (nullable — "why I changed this" on forked steps)

**Stars**
- id, user_id, project_id, created_at

**Forks**
- id, original_project_id, forked_project_id, user_id, created_at

**Comments**
- id, project_id, user_id, parent_comment_id (nullable), body, is_pinned, created_at

**Export Templates**
- id, tool_name, meta_prompt_text, instructions_markdown, last_updated

## V1 Pages (Sitemap)

1. `/` — Homepage (hero + trending + new + staff picks + export CTA)
2. `/explore` — Browse all projects with filters/sort
3. `/explore/[tool]` — Tool-specific pages (e.g., `/explore/cursor`)
4. `/explore/[category]` — Category pages (e.g., `/explore/dashboard`)
5. `/trending` — Trending projects this week/month
6. `/export` — Session Export hub (tool selector + meta-prompts + import form)
7. `/export/[tool]` — Tool-specific export page (e.g., `/export/cursor`) — SEO play
8. `/@[username]` — User profile
9. `/@[username]/[project-slug]` — Individual project page
10. `/@[username]/[project-slug]/compare/[fork-slug]` — Side-by-side comparison view
11. `/new` — Create new project manually (auth required)
12. `/@[username]/[project-slug]/edit` — Edit project (author only)
13. `/@[username]/[project-slug]/fork` — Fork/remix flow (auth required)
14. `/login` — Auth page
15. `/about` — What is PromptStack, content guidelines, prompt philosophy
16. `/settings` — User settings (display name, bio)

## Launch Plan

### Pre-Launch (Week before)

- Seed 30-50 prompt projects yourself using Session Export on your real Cursor workflows
- Test meta-prompts across all major tools, refine for accuracy
- Recruit 10-15 builders from Twitter/Discord — give them the export flow and have them publish projects at launch
- Create a "launch tweet thread" showing the Session Export flow in action (screen recording)
- Prepare Show HN post
- Set up analytics

### Launch Day

- Post on Twitter/X with demo video (screen recording of: build something → paste meta-prompt → JSON appears → import to PromptStack → published in 3 minutes)
- Submit to Hacker News (Show HN)
- Post in r/cursor, r/ChatGPTPro, r/SideProject, r/webdev
- Share in relevant Discord servers (Cursor, Windsurf, indie hackers)
- Direct outreach to 20-30 vibe coding Twitter accounts
- Key message: "It takes 5 minutes to publish your entire Cursor session as a shareable workflow"

### Post-Launch (Weeks 1-4)

- "Prompt Project of the Week" tweet every Monday
- Engage with every comment and submission personally
- Track: visitors, signups, projects submitted (via export vs. manual), stars, forks
- Iterate meta-prompts based on quality of exported projects
- A/B test meta-prompt variations for each tool

## Success Metrics (V1, first 90 days)

| Metric | Target |
|--------|--------|
| Prompt Projects published | 200+ |
| % published via Session Export | > 60% |
| Registered users | 500+ |
| Monthly visitors | 10,000+ |
| Stars given | 2,000+ |
| Forks/remixes created | 100+ |
| Average session duration | > 3 minutes |
| Twitter followers for @promptstack | 1,000+ |
| Google-indexed pages | 300+ |
| Export page visits | 5,000+ (leading indicator of contribution intent) |

## V2 Roadmap (Months 3-6)

### Session Export 2.0

- Browser extension that watches Cursor/Windsurf sessions in real-time and auto-captures prompts in the background — no meta-prompt needed, one-click publish
- CLI tool: `promptstack export` that reads local AI tool chat logs and pushes to PromptStack
- API endpoint: third-party tools can push prompt sessions directly to a user's PromptStack account
- Smart parsing: AI-powered cleanup that improves titles, groups related prompts, and suggests better context notes from raw exports

### Prompt Project Evolution (Not Versioning)

- **Revisions**: Authors can publish a new revision of their project with a changelog note ("Added a step for error handling after user feedback"). Not a diff — a new snapshot with a note.
- **Comparison view 2.0**: Compare any two projects side-by-side (not just fork vs. original). Useful for comparing different approaches to the same problem.
- **"Inspired by" chains**: Visual graph showing how a project evolved across forks — Project A → 3 forks → Fork B got 2 forks of its own. Recipe family tree.

### Community & Engagement

- Collections/playlists curated by users ("My favorite Next.js workflows", "Best beginner projects")
- Weekly newsletter (auto-generated from trending + staff picks)
- Contributor leaderboard — ranked by stars received, quality score, and contribution streak
- "Request a Prompt Project" — community requests ("Someone please publish a workflow for building a Chrome extension with Cursor")
- Community moderation — trusted reviewers who can approve/reject submissions
- Contributor badges — "Early Builder", "Top 10 Contributor", "100 Stars Club"

### Content & Distribution

- Embeddable widgets — bloggers and tutorial creators can embed a Prompt Project card on their site
- Twitter bot — auto-posts Prompt Project of the Day
- RSS feed for new and trending projects
- Prompt Project templates — pre-structured starting points for common builds ("SaaS Starter", "Chrome Extension", "API Backend")

### Platform Integrations

- Cursor Marketplace integration — if Cursor opens a plugin/extension marketplace, PromptStack is first in line
- VS Code extension — browse and import Prompt Projects directly from the editor
- Raycast/Alfred extension — quick search PromptStack from desktop

## What Is NOT on the Roadmap (By Design)

- **Git-style versioning** — prompts don't have meaningful diffs. Fork > version.
- **Line-level diff view** — a word change in a prompt changes everything. Side-by-side comparison with context notes instead.
- **Merge conflicts** — doesn't apply. Every fork is independent.
- **Branches** — no concept of branches. A fork is a branch that never merges back.
- **AI-generated prompts** — keep it human-curated. PromptStack surfaces what real builders actually used, not what an AI thinks might work.
- **Monetization (V1-V2)** — no premium tiers, no ads, no paid features. Community trust first.
- **Mobile app** — responsive web is sufficient.
- **Forums or chat** — don't compete with Discord. Link to community Discord instead.

## Key Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Cold start — no content at launch | Seed 50 projects yourself using Session Export before launch |
| Contribution friction too high | Session Export reduces publish time from 30 min to 5 min |
| Low quality submissions from Session Export | AI outputs raw JSON; user still reviews/edits before publishing. Moderation queue catches the rest. |
| Meta-prompts produce inconsistent results across tools | Test extensively pre-launch; maintain tool-specific versions; iterate based on user feedback |
| People submit single prompts, not workflows | UX enforces minimum 3 steps; Session Export naturally captures full sessions; guidelines emphasize workflows |
| GitHub awesome-lists as competition | Differentiate with Session Export (they have no contribution flow), fork/remix, and rich project pages |
| You lose momentum (Eudia + Coreloop priorities) | Block 4 hrs/week minimum for curation + meta-prompt optimization; automate what you can |
| SEO takes months to kick in | Supplement with Twitter distribution, community posting, and export page SEO targeting high-intent keywords |
| Session Export JSON format breaks with tool updates | Version the meta-prompts; monitor output quality; maintain fallback manual entry path |

---

**Cookbooks, not codebases. Ship the prompts, not just the code.**
