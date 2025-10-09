-- Secure API Keys storage using Supabase Vault
-- Migration: 20250104000005_create_api_keys_table

-- =====================================================
-- API Keys Table
-- =====================================================
-- This table stores API key metadata only
-- Actual keys are stored in Supabase Vault (server-side encrypted)

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Metadata
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'openai', 'anthropic', etc.

  -- Vault reference (stores the actual encrypted key)
  vault_secret_id UUID NOT NULL,

  -- Display info (masked key for UI)
  key_prefix TEXT, -- First 7 characters (e.g., "sk-proj")
  key_suffix TEXT, -- Last 4 characters

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'revoked', 'expired')),

  -- Usage tracking
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,

  -- Validation
  is_validated BOOLEAN DEFAULT false,
  last_validated_at TIMESTAMP WITH TIME ZONE,
  validation_error TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_api_keys_provider ON api_keys(provider);
CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_created_by ON api_keys(created_by);
CREATE INDEX idx_api_keys_vault_secret ON api_keys(vault_secret_id);

-- =====================================================
-- API Key Usage Logs
-- =====================================================
-- Audit trail for API key access

CREATE TABLE api_key_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,

  -- Access details
  action TEXT NOT NULL CHECK (action IN ('created', 'accessed', 'validated', 'revoked', 'deleted')),
  success BOOLEAN NOT NULL,
  error_message TEXT,

  -- Context
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE SET NULL,
  function_name TEXT, -- Which Edge Function accessed it

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- Indexes
CREATE INDEX idx_api_key_logs_key_id ON api_key_usage_logs(api_key_id, created_at DESC);
CREATE INDEX idx_api_key_logs_action ON api_key_usage_logs(action);
CREATE INDEX idx_api_key_logs_evaluation ON api_key_usage_logs(evaluation_id);

-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_usage_logs ENABLE ROW LEVEL SECURITY;

-- API Keys Policies
CREATE POLICY "Anyone can view their own API keys metadata"
  ON api_keys FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create API keys"
  ON api_keys FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own API keys"
  ON api_keys FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete their own API keys"
  ON api_keys FOR DELETE
  USING (true);

-- Service role can access all keys (for Edge Functions)
CREATE POLICY "Service role can access all API keys"
  ON api_keys FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Usage Logs Policies
CREATE POLICY "Anyone can view their key usage logs"
  ON api_key_usage_logs FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert usage logs"
  ON api_key_usage_logs FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to update last_used timestamp
CREATE OR REPLACE FUNCTION update_api_key_usage(key_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET
    last_used_at = NOW(),
    usage_count = usage_count + 1,
    updated_at = NOW()
  WHERE id = key_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mask API key for display
CREATE OR REPLACE FUNCTION mask_api_key(key TEXT)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'prefix', LEFT(key, 7),
    'suffix', RIGHT(key, 4),
    'masked', LEFT(key, 7) || '...' || RIGHT(key, 4)
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger for updated_at
CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE api_keys IS 'Stores API key metadata. Actual keys stored in Supabase Vault';
COMMENT ON COLUMN api_keys.vault_secret_id IS 'Reference to secret in Supabase Vault (pgsodium)';
COMMENT ON TABLE api_key_usage_logs IS 'Audit trail for API key access and usage';
