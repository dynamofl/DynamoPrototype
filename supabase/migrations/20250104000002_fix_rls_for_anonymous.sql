-- Fix RLS policies to allow anonymous users
-- Migration: 20250104000002_fix_rls_for_anonymous

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can create AI systems" ON ai_systems;
DROP POLICY IF EXISTS "Users can update their own AI systems" ON ai_systems;
DROP POLICY IF EXISTS "Users can delete their own AI systems" ON ai_systems;

DROP POLICY IF EXISTS "Users can create guardrails" ON guardrails;
DROP POLICY IF EXISTS "Users can update their own guardrails" ON guardrails;
DROP POLICY IF EXISTS "Users can delete their own guardrails" ON guardrails;

DROP POLICY IF EXISTS "Users can create evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can update their own evaluations" ON evaluations;
DROP POLICY IF EXISTS "Users can delete their own evaluations" ON evaluations;

-- AI Systems - Allow anonymous users
CREATE POLICY "Anyone can create AI systems"
  ON ai_systems FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update AI systems"
  ON ai_systems FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete AI systems"
  ON ai_systems FOR DELETE
  USING (true);

-- Guardrails - Allow anonymous users
CREATE POLICY "Anyone can create guardrails"
  ON guardrails FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update guardrails"
  ON guardrails FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete guardrails"
  ON guardrails FOR DELETE
  USING (true);

-- Evaluations - Allow anonymous users
CREATE POLICY "Anyone can view all evaluations"
  ON evaluations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create evaluations"
  ON evaluations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update evaluations"
  ON evaluations FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete evaluations"
  ON evaluations FOR DELETE
  USING (true);

-- Evaluation Prompts - Allow all
DROP POLICY IF EXISTS "Users can view prompts of their evaluations" ON evaluation_prompts;
DROP POLICY IF EXISTS "Users can insert prompts for their evaluations" ON evaluation_prompts;
DROP POLICY IF EXISTS "Users can update prompts of their evaluations" ON evaluation_prompts;

CREATE POLICY "Anyone can view prompts"
  ON evaluation_prompts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert prompts"
  ON evaluation_prompts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update prompts"
  ON evaluation_prompts FOR UPDATE
  USING (true);

-- Evaluation Logs - Already permissive
DROP POLICY IF EXISTS "Users can view logs of their evaluations" ON evaluation_logs;

CREATE POLICY "Anyone can view logs"
  ON evaluation_logs FOR SELECT
  USING (true);
