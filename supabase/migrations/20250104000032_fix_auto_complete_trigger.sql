-- Fix auto_complete_evaluation trigger to NOT interfere with topic_analysis
-- Migration: 20250104000032_fix_auto_complete_trigger

-- The issue: The trigger marks evaluations as 'completed' before run-evaluation
-- can call finalizeEvaluation(), which calculates topic_analysis.

-- Solution: Remove the auto-complete trigger and let run-evaluation handle finalization

-- Drop the trigger
DROP TRIGGER IF EXISTS trigger_auto_complete_evaluation ON evaluations;

-- Drop the function
DROP FUNCTION IF EXISTS auto_complete_evaluation();

-- Add comment explaining the change
COMMENT ON TABLE evaluations IS
  'Evaluations table. Finalization (including topic_analysis calculation) is handled by the run-evaluation edge function when all prompts are completed. Auto-complete trigger removed to prevent race conditions.';
