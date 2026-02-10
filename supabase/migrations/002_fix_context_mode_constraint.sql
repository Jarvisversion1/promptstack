-- ============================================================================
-- Fix: Update context_mode CHECK constraint to include 'chat' and 'cascade'
-- The original constraint only allowed Cursor-specific modes.
-- This adds support for Windsurf (cascade) and Claude/Bolt/Lovable/Replit (chat).
-- ============================================================================

-- Drop the existing constraint and add the updated one
ALTER TABLE prompt_steps
  DROP CONSTRAINT IF EXISTS prompt_steps_context_mode_check;

ALTER TABLE prompt_steps
  ADD CONSTRAINT prompt_steps_context_mode_check
  CHECK (context_mode IN ('inline', 'composer', 'cursor_rule', 'terminal', 'chat', 'cascade'));
