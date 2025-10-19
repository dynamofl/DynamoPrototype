-- Restore auto_complete_evaluation trigger
-- Migration: 20250104000033_restore_auto_complete_trigger

-- Recreate the function to auto-complete evaluations that reach 100%
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
