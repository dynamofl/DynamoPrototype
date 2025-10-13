-- Consolidate guardrail columns into structured JSONB
-- Migration: 20250104000019_consolidate_guardrail_columns

-- Step 1: Add new consolidated columns
ALTER TABLE evaluation_prompts
ADD COLUMN input_guardrail JSONB,
ADD COLUMN output_guardrail JSONB;

-- Step 2: Migrate existing data to new structure
UPDATE evaluation_prompts
SET input_guardrail = jsonb_build_object(
  'judgement', input_guardrail_judgement,
  'reason', input_guardrail_reason,
  'details', COALESCE(input_guardrail_details, '[]'::jsonb)
)
WHERE input_guardrail_judgement IS NOT NULL
   OR input_guardrail_reason IS NOT NULL
   OR input_guardrail_details IS NOT NULL;

UPDATE evaluation_prompts
SET output_guardrail = jsonb_build_object(
  'judgement', output_guardrail_judgement,
  'reason', output_guardrail_reason,
  'details', COALESCE(output_guardrail_details, '[]'::jsonb)
)
WHERE output_guardrail_judgement IS NOT NULL
   OR output_guardrail_reason IS NOT NULL
   OR output_guardrail_details IS NOT NULL;

-- Step 3: Add comments explaining the structure
COMMENT ON COLUMN evaluation_prompts.input_guardrail IS
'Consolidated input guardrail evaluation: {judgement: "Blocked"|"Allowed", reason: string, details: [{guardrailId, guardrailName, judgement, reason, violations}]}';

COMMENT ON COLUMN evaluation_prompts.output_guardrail IS
'Consolidated output guardrail evaluation: {judgement: "Blocked"|"Allowed", reason: string, details: [{guardrailId, guardrailName, judgement, reason, violations}]}';

-- Step 4: Drop old indexes first (before dropping columns)
DROP INDEX IF EXISTS idx_eval_prompts_input_guardrail;
DROP INDEX IF EXISTS idx_eval_prompts_output_guardrail;
DROP INDEX IF EXISTS idx_eval_prompts_input_violations;
DROP INDEX IF EXISTS idx_eval_prompts_output_violations;
DROP INDEX IF EXISTS idx_eval_prompts_input_details;
DROP INDEX IF EXISTS idx_eval_prompts_output_details;

-- Step 5: Drop old columns (keeping only the consolidated ones)
-- Note: Dropping input_guardrail_violations as it's no longer used
ALTER TABLE evaluation_prompts
DROP COLUMN IF EXISTS input_guardrail_judgement,
DROP COLUMN IF EXISTS input_guardrail_reason,
DROP COLUMN IF EXISTS input_guardrail_violations,
DROP COLUMN IF EXISTS input_guardrail_details,
DROP COLUMN IF EXISTS output_guardrail_judgement,
DROP COLUMN IF EXISTS output_guardrail_reason,
DROP COLUMN IF EXISTS output_guardrail_violations,
DROP COLUMN IF EXISTS output_guardrail_details;

-- Step 6: Create new indexes for the consolidated columns
CREATE INDEX idx_eval_prompts_input_guardrail_json
  ON evaluation_prompts USING GIN (input_guardrail);

CREATE INDEX idx_eval_prompts_output_guardrail_json
  ON evaluation_prompts USING GIN (output_guardrail);

CREATE INDEX idx_eval_prompts_input_guardrail_judgement
  ON evaluation_prompts(evaluation_id, (input_guardrail->>'judgement'));

CREATE INDEX idx_eval_prompts_output_guardrail_judgement
  ON evaluation_prompts(evaluation_id, (output_guardrail->>'judgement'));

-- Example queries enabled by this structure:
--
-- 1. Get all prompts with blocked input guardrails:
--    SELECT * FROM evaluation_prompts
--    WHERE input_guardrail->>'judgement' = 'Blocked';
--
-- 2. Find evaluations where specific guardrail blocked:
--    SELECT * FROM evaluation_prompts
--    WHERE input_guardrail->'details' @> '[{"guardrailId": "uuid-123", "judgement": "Blocked"}]';
--
-- 3. Get guardrail reason:
--    SELECT input_guardrail->>'reason' FROM evaluation_prompts WHERE id = '...';
--
-- 4. Count blocks per guardrail:
--    SELECT
--      detail->>'guardrailName' as guardrail_name,
--      COUNT(*) as blocked_count
--    FROM evaluation_prompts,
--    LATERAL jsonb_array_elements(input_guardrail->'details') AS detail
--    WHERE detail->>'judgement' = 'Blocked'
--    GROUP BY detail->>'guardrailName'
--    ORDER BY blocked_count DESC;
--
-- 5. Get all violation details for a prompt:
--    SELECT
--      detail->>'guardrailName' as guardrail,
--      detail->'violations' as violations
--    FROM evaluation_prompts,
--    LATERAL jsonb_array_elements(input_guardrail->'details') AS detail
--    WHERE id = '...' AND detail->'violations' IS NOT NULL;
