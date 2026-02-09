-- ============================================================================
-- PromptStack Database Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT CHECK (LENGTH(bio) <= 280),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (LENGTH(title) <= 100),
  slug TEXT UNIQUE NOT NULL,
  description TEXT CHECK (LENGTH(description) <= 2000),
  tool TEXT NOT NULL CHECK (tool IN ('cursor', 'windsurf', 'bolt', 'lovable', 'claude', 'replit', 'other')),
  category TEXT NOT NULL CHECK (category IN ('landing-page', 'dashboard', 'api', 'mobile-app', 'cli-tool', 'chrome-extension', 'full-stack-app', 'component', 'other')),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  demo_url TEXT,
  cover_image_url TEXT,
  is_published BOOLEAN DEFAULT FALSE NOT NULL,
  is_approved BOOLEAN DEFAULT FALSE NOT NULL,
  forked_from_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  inspired_by_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  import_method TEXT CHECK (import_method IN ('session_export', 'manual')),
  star_count INTEGER DEFAULT 0 NOT NULL,
  fork_count INTEGER DEFAULT 0 NOT NULL,
  comment_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PROJECT TAGS TABLE
-- ============================================================================
CREATE TABLE project_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- PROMPT STEPS TABLE
-- ============================================================================
CREATE TABLE prompt_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  context_mode TEXT CHECK (context_mode IN ('inline', 'composer', 'cursor_rule', 'terminal')),
  output_notes TEXT,
  tips TEXT,
  screenshot_url TEXT,
  fork_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (project_id, step_order)
);

-- ============================================================================
-- STARS TABLE
-- ============================================================================
CREATE TABLE stars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, project_id)
);

-- ============================================================================
-- COMMENTS TABLE
-- ============================================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- EXPORT TEMPLATES TABLE
-- ============================================================================
CREATE TABLE export_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_name TEXT UNIQUE NOT NULL,
  meta_prompt_text TEXT NOT NULL,
  instructions_markdown TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_author_id ON projects(author_id);
CREATE INDEX idx_projects_tool ON projects(tool);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_published_approved ON projects(is_published, is_approved) WHERE is_published = TRUE AND is_approved = TRUE;
CREATE INDEX idx_stars_project_id ON stars(project_id);
CREATE INDEX idx_stars_user_id ON stars(user_id);
CREATE INDEX idx_comments_project_id ON comments(project_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;
CREATE INDEX idx_project_tags_project_id ON project_tags(project_id);
CREATE INDEX idx_prompt_steps_project_id ON prompt_steps(project_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE stars ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- PROJECTS POLICIES
-- ============================================================================
CREATE POLICY "Published and approved projects are viewable by everyone"
  ON projects FOR SELECT
  USING (
    is_published = TRUE AND is_approved = TRUE
    OR author_id = auth.uid()
  );

CREATE POLICY "Authors can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================================================
-- PROJECT TAGS POLICIES
-- ============================================================================
CREATE POLICY "Tags are viewable for viewable projects"
  ON project_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND (projects.is_published = TRUE AND projects.is_approved = TRUE OR projects.author_id = auth.uid())
    )
  );

CREATE POLICY "Authors can manage tags on their projects"
  ON project_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.author_id = auth.uid()
    )
  );

-- ============================================================================
-- PROMPT STEPS POLICIES
-- ============================================================================
CREATE POLICY "Steps are viewable for viewable projects"
  ON prompt_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = prompt_steps.project_id
      AND (projects.is_published = TRUE AND projects.is_approved = TRUE OR projects.author_id = auth.uid())
    )
  );

CREATE POLICY "Authors can manage steps on their projects"
  ON prompt_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = prompt_steps.project_id
      AND projects.author_id = auth.uid()
    )
  );

-- ============================================================================
-- STARS POLICIES
-- ============================================================================
CREATE POLICY "Stars are viewable by everyone"
  ON stars FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can star projects"
  ON stars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unstar projects"
  ON stars FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS POLICIES
-- ============================================================================
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (TRUE);

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- EXPORT TEMPLATES POLICIES
-- ============================================================================
CREATE POLICY "Export templates are viewable by everyone"
  ON export_templates FOR SELECT
  USING (TRUE);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on projects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'preferred_username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update star_count when stars change
CREATE OR REPLACE FUNCTION update_project_star_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects
    SET star_count = star_count + 1
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects
    SET star_count = star_count - 1
    WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_star_count
  AFTER INSERT OR DELETE ON stars
  FOR EACH ROW
  EXECUTE FUNCTION update_project_star_count();

-- Update comment_count when comments change
CREATE OR REPLACE FUNCTION update_project_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE projects
    SET comment_count = comment_count + 1
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE projects
    SET comment_count = comment_count - 1
    WHERE id = OLD.project_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_project_comment_count();

-- Update fork_count when projects are forked
CREATE OR REPLACE FUNCTION update_project_fork_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.forked_from_id IS NOT NULL THEN
    UPDATE projects
    SET fork_count = fork_count + 1
    WHERE id = NEW.forked_from_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fork_count
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_project_fork_count();
