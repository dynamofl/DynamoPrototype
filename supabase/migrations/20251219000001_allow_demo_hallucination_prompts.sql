-- Allow viewing hallucination prompts for demo/test evaluations (where created_by is NULL)
-- This enables users to view manually inserted test data

CREATE POLICY "Users can view demo hallucination prompts"
  ON hallucination_prompts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM evaluations e
      WHERE e.id = hallucination_prompts.evaluation_id
      AND e.created_by IS NULL
    )
  );
