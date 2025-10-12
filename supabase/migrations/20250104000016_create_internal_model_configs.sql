-- Migration: Create internal_model_configs table
-- Purpose: Store configuration for internal models used in evaluation (input guardrail, output guardrail, judge)

CREATE TABLE internal_model_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Configuration type: 'input_guardrail', 'output_guardrail', 'judge_model'
  config_type TEXT NOT NULL CHECK (config_type IN ('input_guardrail', 'output_guardrail', 'judge_model')),

  -- Model details
  provider TEXT NOT NULL, -- e.g., 'openai', 'anthropic', 'azure'
  model TEXT NOT NULL,    -- e.g., 'gpt-4o-mini', 'claude-3-sonnet'

  -- API key reference (encrypted in vault or api_keys table)
  api_key_encrypted TEXT, -- Encrypted API key

  -- Additional configuration
  config JSONB DEFAULT '{}'::jsonb, -- Temperature, max_tokens, etc.

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure only one active config per type
CREATE UNIQUE INDEX idx_internal_model_configs_active_type
ON internal_model_configs(config_type)
WHERE is_active = true;

-- Indexes
CREATE INDEX idx_internal_model_configs_type ON internal_model_configs(config_type);
CREATE INDEX idx_internal_model_configs_provider ON internal_model_configs(provider);

-- Comments
COMMENT ON TABLE internal_model_configs IS 'Configuration for internal models used in evaluation system';
COMMENT ON COLUMN internal_model_configs.config_type IS 'Type of model: input_guardrail, output_guardrail, or judge_model';
COMMENT ON COLUMN internal_model_configs.api_key_encrypted IS 'Encrypted API key for the model provider';

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_internal_model_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_internal_model_configs_updated_at
BEFORE UPDATE ON internal_model_configs
FOR EACH ROW
EXECUTE FUNCTION update_internal_model_configs_updated_at();
