-- Consolidate AI system response and judge model evaluation
-- Migration: 20250104000020_consolidate_ai_response

-- Step 1: Add new consolidated column
ALTER TABLE evaluation_prompts
ADD COLUMN ai_system_response JSONB;

-- Step 2: Migrate existing data to new structure
UPDATE evaluation_prompts
SET ai_system_response = jsonb_build_object(
  'content', COALESCE(system_response, ''),
  'judgement', judge_model_judgement,
  'reason', judge_model_reason,
  'outputTokens', output_tokens
)
WHERE system_response IS NOT NULL
   OR judge_model_judgement IS NOT NULL
   OR judge_model_reason IS NOT NULL
   OR output_tokens IS NOT NULL;

-- Step 3: Add comment explaining the structure
COMMENT ON COLUMN evaluation_prompts.ai_system_response IS
'Consolidated AI system response with judge evaluation: {content: string, judgement: "Answered"|"Refused", reason: string, outputTokens: number}';

-- Step 4: Drop old indexes first
DROP INDEX IF EXISTS idx_eval_prompts_judge_model;

-- Step 5: Drop old columns (keeping evaluation-level metrics)
-- Note: Keeping runtime_ms, input_tokens, total_tokens as they are evaluation-level metrics
ALTER TABLE evaluation_prompts
DROP COLUMN IF EXISTS system_response,
DROP COLUMN IF EXISTS judge_model_judgement,
DROP COLUMN IF EXISTS judge_model_reason,
DROP COLUMN IF EXISTS output_tokens;

-- Step 6: Enable pg_trgm extension first (required for trigram similarity search)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 7: Create new indexes for the consolidated column
CREATE INDEX idx_eval_prompts_ai_response_json
  ON evaluation_prompts USING GIN (ai_system_response);

CREATE INDEX idx_eval_prompts_ai_response_judgement
  ON evaluation_prompts(evaluation_id, (ai_system_response->>'judgement'));

-- Create index for content search (useful for full-text search)
CREATE INDEX idx_eval_prompts_ai_response_content
  ON evaluation_prompts USING GIN ((ai_system_response->>'content') gin_trgm_ops);

-- Example queries enabled by this structure:
--
-- 1. Get all prompts where AI answered:
--    SELECT * FROM evaluation_prompts
--    WHERE ai_system_response->>'judgement' = 'Answered';
--
-- 2. Get response content:
--    SELECT ai_system_response->>'content' FROM evaluation_prompts WHERE id = '...';
--
-- 3. Search for responses containing specific text:
--    SELECT * FROM evaluation_prompts
--    WHERE ai_system_response->>'content' ILIKE '%medical advice%';
--
-- 4. Get average output tokens by judgement:
--    SELECT
--      ai_system_response->>'judgement' as judgement,
--      AVG((ai_system_response->>'outputTokens')::int) as avg_tokens
--    FROM evaluation_prompts
--    WHERE ai_system_response->>'outputTokens' IS NOT NULL
--    GROUP BY ai_system_response->>'judgement';
--
-- 5. Find prompts with long responses (high token count):
--    SELECT * FROM evaluation_prompts
--    WHERE (ai_system_response->>'outputTokens')::int > 500
--    ORDER BY (ai_system_response->>'outputTokens')::int DESC;
--
-- 6. Get judge reasoning for refused responses:
--    SELECT
--      id,
--      ai_system_response->>'content' as response,
--      ai_system_response->>'reason' as judge_reason
--    FROM evaluation_prompts
--    WHERE ai_system_response->>'judgement' = 'Refused';
