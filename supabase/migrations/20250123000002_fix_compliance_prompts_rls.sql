-- Migration: Fix RLS policies for compliance_prompts to allow authenticated users
-- The original migration only allowed 'anon' role, but authenticated users also need access

-- Add SELECT policy for authenticated users
CREATE POLICY "Allow authenticated to select compliance prompts"
  ON compliance_prompts FOR SELECT
  TO authenticated
  USING (true);

-- Add INSERT policy for authenticated users
CREATE POLICY "Allow authenticated to insert compliance prompts"
  ON compliance_prompts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add UPDATE policy for authenticated users
CREATE POLICY "Allow authenticated to update compliance prompts"
  ON compliance_prompts FOR UPDATE
  TO authenticated
  USING (true);
