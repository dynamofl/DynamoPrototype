-- Drop summary_metrics column from evaluations table
-- Migration: 20250104000026_drop_summary_metrics

-- This will remove the summary_metrics column completely
-- WARNING: This will delete all existing summary data

-- Drop the column
ALTER TABLE evaluations
DROP COLUMN IF EXISTS summary_metrics;

-- Drop the helper function as well
DROP FUNCTION IF EXISTS recalculate_summary_metrics_with_guardrails(UUID);

-- Add comment
COMMENT ON TABLE evaluations IS 'Evaluations table - summary_metrics column removed';
