-- Add violation details columns to evaluation_prompts table
-- Migration: 20250104000017_add_violation_details

ALTER TABLE evaluation_prompts
ADD COLUMN input_guardrail_violations JSONB,
ADD COLUMN output_guardrail_violations JSONB;

-- Add comments to explain the structure
COMMENT ON COLUMN evaluation_prompts.input_guardrail_violations IS 'Array of {phrase: string, violatedBehaviors: string[]} showing which phrases in the prompt violated which behaviors';
COMMENT ON COLUMN evaluation_prompts.output_guardrail_violations IS 'Array of {phrase: string, violatedBehaviors: string[]} showing which phrases in the response violated which behaviors';

-- Create index for querying violations
CREATE INDEX idx_eval_prompts_input_violations ON evaluation_prompts USING GIN (input_guardrail_violations);
CREATE INDEX idx_eval_prompts_output_violations ON evaluation_prompts USING GIN (output_guardrail_violations);
