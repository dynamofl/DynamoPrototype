-- Migration: Fix stuck evaluations at 100%
-- Purpose: Update evaluations that reached 100% completion but never transitioned to 'completed' status
-- Created: 2025-01-04

-- Fix existing stuck evaluations
-- These are evaluations where all prompts completed but status is still 'running'
UPDATE evaluations
SET
  status = 'completed',
  current_stage = 'Completed',
  completed_at = COALESCE(completed_at, updated_at),
  updated_at = NOW()
WHERE
  status = 'running'
  AND completed_prompts >= total_prompts
  AND total_prompts > 0
  AND completed_at IS NULL;

-- Create a function to auto-complete evaluations that reach 100%
-- This acts as a safety net if the edge function fails to finalize
CREATE OR REPLACE FUNCTION auto_complete_evaluation()
RETURNS TRIGGER AS $$
BEGIN
  -- If an evaluation reaches 100% completion but status is still 'running'
  -- automatically transition it to 'completed'
  IF NEW.status = 'running'
     AND NEW.completed_prompts >= NEW.total_prompts
     AND NEW.total_prompts > 0
     AND NEW.completed_at IS NULL THEN

    NEW.status := 'completed';
    NEW.current_stage := 'Completed';
    NEW.completed_at := NOW();
    NEW.updated_at := NOW();

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-complete evaluations
DROP TRIGGER IF EXISTS trigger_auto_complete_evaluation ON evaluations;
CREATE TRIGGER trigger_auto_complete_evaluation
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_evaluation();

-- Add comment for documentation
COMMENT ON FUNCTION auto_complete_evaluation() IS
  'Automatically transitions evaluations to completed status when all prompts are processed.
   This ensures evaluations do not get stuck at 100% if the edge function fails to finalize.';
