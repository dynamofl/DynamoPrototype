-- Fix missing SELECT policy for ai_systems table
-- This was causing the AI systems list to not load from Supabase

-- Drop existing policy if exists and recreate
DROP POLICY IF EXISTS "Anyone can view AI systems" ON ai_systems;
CREATE POLICY "Anyone can view AI systems"
  ON ai_systems FOR SELECT
  USING (true);

-- Also ensure guardrails has SELECT policy
DROP POLICY IF EXISTS "Anyone can view guardrails" ON guardrails;
CREATE POLICY "Anyone can view guardrails"
  ON guardrails FOR SELECT
  USING (true);