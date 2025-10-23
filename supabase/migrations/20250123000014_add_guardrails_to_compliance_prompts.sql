-- Migration: Add input_guardrail and output_guardrail columns to compliance_prompts
-- This makes compliance_prompts consistent with jailbreak_prompts structure

-- Add input_guardrail column
ALTER TABLE compliance_prompts
ADD COLUMN IF NOT EXISTS input_guardrail JSONB;

-- Add output_guardrail column
ALTER TABLE compliance_prompts
ADD COLUMN IF NOT EXISTS output_guardrail JSONB;

-- Add comments explaining the structure
COMMENT ON COLUMN compliance_prompts.input_guardrail IS
'Input guardrail evaluation with metrics: {judgement, reason, latencyMs, confidenceScore, details[{guardrailId, guardrailName, judgement, reason, violations, latencyMs, confidenceScore}]}. Consistent with jailbreak_prompts.input_guardrail.';

COMMENT ON COLUMN compliance_prompts.output_guardrail IS
'Output guardrail evaluation with metrics: {judgement, reason, latencyMs, confidenceScore, details[{guardrailId, guardrailName, judgement, reason, violations, latencyMs, confidenceScore}]}. Consistent with jailbreak_prompts.output_guardrail.';

-- Create GIN indexes for efficient JSONB querying
CREATE INDEX IF NOT EXISTS idx_compliance_prompts_input_guardrail_gin
  ON compliance_prompts USING GIN (input_guardrail);

CREATE INDEX IF NOT EXISTS idx_compliance_prompts_output_guardrail_gin
  ON compliance_prompts USING GIN (output_guardrail);

-- Create functional indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_compliance_prompts_input_guardrail_judgement
  ON compliance_prompts((input_guardrail->>'judgement'));

CREATE INDEX IF NOT EXISTS idx_compliance_prompts_output_guardrail_judgement
  ON compliance_prompts((output_guardrail->>'judgement'));

CREATE INDEX IF NOT EXISTS idx_compliance_prompts_input_guardrail_confidence
  ON compliance_prompts((input_guardrail->>'confidenceScore'));

CREATE INDEX IF NOT EXISTS idx_compliance_prompts_output_guardrail_confidence
  ON compliance_prompts((output_guardrail->>'confidenceScore'));
