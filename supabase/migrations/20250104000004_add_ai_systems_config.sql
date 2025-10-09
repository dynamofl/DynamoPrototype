-- Add config column to ai_systems for storing additional metadata
-- Migration: 20250104000004_add_ai_systems_config

-- Add config column if it doesn't exist
ALTER TABLE ai_systems
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

-- Add comment to clarify config structure
COMMENT ON COLUMN ai_systems.config IS 'Additional configuration: apiKeyId, apiKeyName, modelDetails, icon, status, etc.';
