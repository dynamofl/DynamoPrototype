-- Migration: Add three-layer judgement columns to evaluation_prompts
-- Purpose: Store separate judgements from input guardrails, output guardrails, and judge model

-- Add input guardrail judgement columns
ALTER TABLE evaluation_prompts
ADD COLUMN input_guardrail_judgement TEXT,
ADD COLUMN input_guardrail_reason TEXT;

-- Add output guardrail judgement columns
ALTER TABLE evaluation_prompts
ADD COLUMN output_guardrail_judgement TEXT,
ADD COLUMN output_guardrail_reason TEXT;

-- Add judge model judgement columns
ALTER TABLE evaluation_prompts
ADD COLUMN judge_model_judgement TEXT,
ADD COLUMN judge_model_reason TEXT;

-- Add indexes for filtering
CREATE INDEX idx_eval_prompts_input_guardrail ON evaluation_prompts(evaluation_id, input_guardrail_judgement);
CREATE INDEX idx_eval_prompts_output_guardrail ON evaluation_prompts(evaluation_id, output_guardrail_judgement);
CREATE INDEX idx_eval_prompts_judge_model ON evaluation_prompts(evaluation_id, judge_model_judgement);

-- Add comments
COMMENT ON COLUMN evaluation_prompts.input_guardrail_judgement IS 'Judgement from input guardrails (evaluates prompt): Blocked or Allowed';
COMMENT ON COLUMN evaluation_prompts.output_guardrail_judgement IS 'Judgement from output guardrails (evaluates response): Blocked or Allowed';
COMMENT ON COLUMN evaluation_prompts.judge_model_judgement IS 'Judgement from judge model: Answered or Refused';

-- Note: Keeping legacy 'guardrail_judgement' and 'model_judgement' columns for backward compatibility
-- They can be deprecated in a future migration after data migration
