-- Simplify guardrails schema
-- Migration: 20250104000003_simplify_guardrails_schema

-- Add category column
ALTER TABLE guardrails
ADD COLUMN IF NOT EXISTS category TEXT;

-- Remove config column (not needed)
ALTER TABLE guardrails
DROP COLUMN IF EXISTS config;

-- Update the index
CREATE INDEX IF NOT EXISTS idx_guardrails_category ON guardrails(category);

-- Add comment to clarify policies structure
COMMENT ON COLUMN guardrails.policies IS 'Array of policy objects with: description, allowedBehavior, disallowedBehavior';
