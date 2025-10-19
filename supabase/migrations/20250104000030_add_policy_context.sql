-- Add policy_context column to evaluation_prompts table
-- Migration: 20250104000030_add_policy_context

-- Add policy_context column to store policy information used during prompt generation
ALTER TABLE evaluation_prompts
ADD COLUMN IF NOT EXISTS policy_context JSONB;

-- Add index for querying by policy context (useful for analytics)
CREATE INDEX IF NOT EXISTS idx_eval_prompts_policy_context
ON evaluation_prompts USING GIN (policy_context);

-- Add comment documenting the field
COMMENT ON COLUMN evaluation_prompts.policy_context IS
'JSONB object storing the policy information used to generate this prompt. Structure: { "description": string, "allowedBehaviors": string[], "disallowedBehaviors": string[] }';
