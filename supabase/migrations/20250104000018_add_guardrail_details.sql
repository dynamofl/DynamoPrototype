-- Add per-guardrail detail columns to evaluation_prompts table
-- Migration: 20250104000018_add_guardrail_details

ALTER TABLE evaluation_prompts
ADD COLUMN input_guardrail_details JSONB,
ADD COLUMN output_guardrail_details JSONB;

-- Add comments explaining the structure
COMMENT ON COLUMN evaluation_prompts.input_guardrail_details IS
'Array of per-guardrail evaluation results: [{guardrailId, guardrailName, judgement, reason, violations}]. Provides detailed breakdown when multiple input guardrails are attached.';

COMMENT ON COLUMN evaluation_prompts.output_guardrail_details IS
'Array of per-guardrail evaluation results: [{guardrailId, guardrailName, judgement, reason, violations}]. Provides detailed breakdown when multiple output guardrails are attached.';

-- Create GIN indexes for efficient querying
CREATE INDEX idx_eval_prompts_input_details
  ON evaluation_prompts USING GIN (input_guardrail_details);

CREATE INDEX idx_eval_prompts_output_details
  ON evaluation_prompts USING GIN (output_guardrail_details);

-- Example queries enabled by these indexes:
--
-- 1. Find evaluations where specific guardrail blocked:
--    SELECT * FROM evaluation_prompts
--    WHERE input_guardrail_details @> '[{"guardrailId": "uuid-123", "judgement": "Blocked"}]';
--
-- 2. Find evaluations where "Medical Policy" blocked:
--    SELECT * FROM evaluation_prompts
--    WHERE input_guardrail_details @> '[{"guardrailName": "Medical Policy", "judgement": "Blocked"}]';
--
-- 3. Count how many times each guardrail blocked:
--    SELECT
--      detail->>'guardrailName' as guardrail_name,
--      COUNT(*) as blocked_count
--    FROM evaluation_prompts,
--    LATERAL jsonb_array_elements(input_guardrail_details) AS detail
--    WHERE detail->>'judgement' = 'Blocked'
--    GROUP BY detail->>'guardrailName'
--    ORDER BY blocked_count DESC;
--
-- 4. Analyze guardrail redundancy (prompts blocked by multiple guardrails):
--    SELECT
--      id,
--      jsonb_array_length(input_guardrail_details) as total_guardrails,
--      (
--        SELECT COUNT(*)
--        FROM jsonb_array_elements(input_guardrail_details) AS detail
--        WHERE detail->>'judgement' = 'Blocked'
--      ) as blocked_count
--    FROM evaluation_prompts
--    WHERE input_guardrail_details IS NOT NULL
--    HAVING blocked_count > 1;
