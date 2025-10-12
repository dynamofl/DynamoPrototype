-- Migration: Add guardrail_type column to guardrails table
-- Purpose: Distinguish between input and output guardrails

-- Add guardrail_type column with default 'input' for existing guardrails
ALTER TABLE guardrails
ADD COLUMN guardrail_type TEXT NOT NULL DEFAULT 'input'
CHECK (guardrail_type IN ('input', 'output'));

-- Create index for guardrail_type
CREATE INDEX idx_guardrails_guardrail_type ON guardrails(guardrail_type);

-- Add comment
COMMENT ON COLUMN guardrails.guardrail_type IS 'Type of guardrail: input (evaluates prompts) or output (evaluates responses)';
