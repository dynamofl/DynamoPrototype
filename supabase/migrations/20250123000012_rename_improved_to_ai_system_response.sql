-- Migration: Rename improved column to ai_system_response for consistency with jailbreak_prompts
-- This ensures compliance_prompts uses the same column name as jailbreak_prompts

-- Check if 'improved' column exists and rename it to 'ai_system_response'
DO $$
BEGIN
  -- Only proceed if improved column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'compliance_prompts'
    AND column_name = 'improved'
  ) THEN
    -- Rename the column
    ALTER TABLE compliance_prompts
    RENAME COLUMN improved TO ai_system_response;

    -- Update the comment
    COMMENT ON COLUMN compliance_prompts.ai_system_response IS
    'AI system response with compliance evaluation and metrics in JSONB format: {reason, content, judgement, latencyMs, outputTokens, answerPhrases[{phrase, reasoning}], confidenceScore}. Consistent with jailbreak_prompts.ai_system_response.';

    RAISE NOTICE 'Successfully renamed improved column to ai_system_response';
  ELSE
    -- Check if ai_system_response already exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'compliance_prompts'
      AND column_name = 'ai_system_response'
    ) THEN
      RAISE NOTICE 'Column ai_system_response already exists, skipping migration';
    ELSE
      RAISE EXCEPTION 'Neither improved nor ai_system_response column exists';
    END IF;
  END IF;
END $$;
