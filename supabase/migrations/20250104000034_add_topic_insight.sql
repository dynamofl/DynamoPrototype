-- Add topic_insight column to evaluations table
-- Migration: 20250104000034_add_topic_insight

-- This column stores AI-generated insights about topic-level statistics
-- analyzing correlations, patterns, and compliance risks

ALTER TABLE evaluations
  ADD COLUMN IF NOT EXISTS topic_insight TEXT;

-- Add index for faster querying
CREATE INDEX IF NOT EXISTS idx_evaluations_topic_insight
  ON evaluations(id) WHERE topic_insight IS NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN evaluations.topic_insight IS 'AI-generated insights analyzing topic statistics, correlations between success rates, confidence, runtime, and output tokens. Summarizes performance patterns, model behavior, and compliance risk signals in 3-5 sentences.';
