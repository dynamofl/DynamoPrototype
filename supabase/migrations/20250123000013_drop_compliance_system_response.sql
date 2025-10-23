-- Migration: Drop system_response column from compliance_prompts
-- Using only ai_system_response for consistency with jailbreak_prompts

-- Drop system_response column (no longer needed, using ai_system_response)
DO $$
BEGIN
  -- Check if system_response column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'compliance_prompts'
    AND column_name = 'system_response'
  ) THEN
    -- Drop the column
    ALTER TABLE compliance_prompts
    DROP COLUMN system_response;

    RAISE NOTICE 'Successfully dropped system_response column from compliance_prompts';
  ELSE
    RAISE NOTICE 'Column system_response does not exist in compliance_prompts, skipping';
  END IF;
END $$;

-- Drop related indexes if they exist
DROP INDEX IF EXISTS idx_compliance_prompts_system_response_gin;
DROP INDEX IF EXISTS idx_compliance_prompts_judgement;
DROP INDEX IF EXISTS idx_compliance_prompts_confidence;

-- Drop constraint if it exists
ALTER TABLE compliance_prompts
DROP CONSTRAINT IF EXISTS check_system_response_structure;

-- Add comment to ai_system_response column for clarity
COMMENT ON COLUMN compliance_prompts.ai_system_response IS
'AI system response with compliance evaluation and metrics in JSONB format: {reason, content, judgement, latencyMs, outputTokens, answerPhrases[{phrase, reasoning}], confidenceScore}. This is the only response field - consistent with jailbreak_prompts.ai_system_response.';
