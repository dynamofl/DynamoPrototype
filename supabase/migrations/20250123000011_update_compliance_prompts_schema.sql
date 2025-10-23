-- Migration: Update compliance_prompts schema
-- 1. Add ai_system_response column (similar to jailbreak_prompts for consistency)
-- 2. Convert system_response from TEXT to JSONB with structured format (DEPRECATED - use ai_system_response instead)

-- ============================================================================
-- PART 1: Add ai_system_response column
-- ============================================================================

ALTER TABLE compliance_prompts
ADD COLUMN IF NOT EXISTS ai_system_response JSONB;

COMMENT ON COLUMN compliance_prompts.ai_system_response IS
'AI system response with compliance evaluation and metrics in JSONB format: {reason, content, judgement, latencyMs, outputTokens, answerPhrases[{phrase, reasoning}], confidenceScore}. Similar to jailbreak_prompts.ai_system_response for consistency.';

-- ============================================================================
-- PART 2: Convert system_response from TEXT to JSONB
-- ============================================================================

-- Structure:
-- {
--   "reason": "The AI provided a detailed step-by-step guide...",
--   "content": "Certainly! Analyzing case law...",
--   "judgement": "Answered" | "Refused",
--   "latencyMs": 6442,
--   "outputTokens": 480,
--   "answerPhrases": [
--     {
--       "phrase": "Understand the Case Context",
--       "reasoning": "This phrase introduces the initial step..."
--     }
--   ],
--   "confidenceScore": 0.8622494851455836
-- }

DO $$
BEGIN
  -- Only proceed if system_response is still TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'compliance_prompts'
    AND column_name = 'system_response'
    AND data_type = 'text'
  ) THEN

    -- Add a new JSONB column temporarily
    ALTER TABLE compliance_prompts
    ADD COLUMN IF NOT EXISTS system_response_jsonb JSONB;

    -- Migrate existing data from TEXT to JSONB
    -- For existing text responses, wrap them in a simple object with just the content
    UPDATE compliance_prompts
    SET system_response_jsonb = jsonb_build_object('content', system_response)
    WHERE system_response IS NOT NULL;

    -- Drop the old TEXT column
    ALTER TABLE compliance_prompts
    DROP COLUMN system_response;

    -- Rename the new JSONB column to the original name
    ALTER TABLE compliance_prompts
    RENAME COLUMN system_response_jsonb TO system_response;

    -- Add a comment explaining the column format
    COMMENT ON COLUMN compliance_prompts.system_response IS
    'AI system response with compliance evaluation and metrics in JSONB format: {reason, content, judgement, latencyMs, outputTokens, answerPhrases[{phrase, reasoning}], confidenceScore}';

    -- Create a GIN index for efficient JSON querying
    CREATE INDEX IF NOT EXISTS idx_compliance_prompts_system_response_gin
    ON compliance_prompts
    USING GIN (system_response);

    -- Create functional indexes for commonly queried fields
    CREATE INDEX IF NOT EXISTS idx_compliance_prompts_judgement
    ON compliance_prompts((system_response->>'judgement'));

    CREATE INDEX IF NOT EXISTS idx_compliance_prompts_confidence
    ON compliance_prompts((system_response->>'confidenceScore'));

    -- Add a check constraint to ensure valid structure
    ALTER TABLE compliance_prompts
    DROP CONSTRAINT IF EXISTS check_system_response_structure;

    ALTER TABLE compliance_prompts
    ADD CONSTRAINT check_system_response_structure CHECK (
      system_response IS NULL
      OR jsonb_typeof(system_response) = 'object'
    );

    RAISE NOTICE 'Successfully converted system_response from TEXT to JSONB';

  ELSE
    RAISE NOTICE 'Column system_response is already JSONB, skipping migration';
  END IF;
END $$;
