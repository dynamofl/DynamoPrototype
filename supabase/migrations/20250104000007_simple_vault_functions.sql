-- Simplified Vault Functions
-- Migration: 20250104000007_simple_vault_functions

-- Drop complex pgsodium functions if they exist
DROP FUNCTION IF EXISTS vault_store_secret(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS vault_get_secret(UUID);
DROP FUNCTION IF EXISTS vault_delete_secret(UUID);

-- Recreate vault_secrets table with simpler approach
DROP TABLE IF EXISTS vault_secrets CASCADE;

CREATE TABLE vault_secrets (
  id UUID PRIMARY KEY,
  secret TEXT NOT NULL, -- Store as TEXT (still server-side only)
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS - only service role can access
ALTER TABLE vault_secrets ENABLE ROW LEVEL SECURITY;

-- Drop old policy if exists
DROP POLICY IF EXISTS "Only service role can access vault secrets" ON vault_secrets;

CREATE POLICY "Only service role can access vault secrets"
  ON vault_secrets FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- Simple Vault Functions
-- =====================================================

-- Store a secret in the vault
CREATE OR REPLACE FUNCTION vault_store_secret(
  secret_id UUID,
  secret_value TEXT,
  secret_description TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO vault_secrets (id, secret, description)
  VALUES (secret_id, secret_value, secret_description)
  ON CONFLICT (id) DO UPDATE
    SET secret = secret_value,
        description = secret_description,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retrieve a secret from the vault
CREATE OR REPLACE FUNCTION vault_get_secret(secret_id UUID)
RETURNS TEXT AS $$
DECLARE
  secret_value TEXT;
BEGIN
  SELECT secret INTO secret_value
  FROM vault_secrets
  WHERE id = secret_id;

  IF secret_value IS NULL THEN
    RAISE EXCEPTION 'Secret not found: %', secret_id;
  END IF;

  RETURN secret_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete a secret from the vault
CREATE OR REPLACE FUNCTION vault_delete_secret(secret_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM vault_secrets WHERE id = secret_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- List all vault secrets (metadata only)
CREATE OR REPLACE FUNCTION vault_list_secrets()
RETURNS TABLE (
  id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vault_secrets.id,
    vault_secrets.description,
    vault_secrets.created_at,
    vault_secrets.updated_at
  FROM vault_secrets
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Grant Permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION vault_store_secret(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION vault_get_secret(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION vault_delete_secret(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION vault_list_secrets() TO service_role;

-- Revoke from anon and authenticated (extra safety)
REVOKE EXECUTE ON FUNCTION vault_store_secret(UUID, TEXT, TEXT) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION vault_get_secret(UUID) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION vault_delete_secret(UUID) FROM anon, authenticated;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE vault_secrets IS 'Server-side only storage for API keys. Protected by RLS - only service_role can access.';
COMMENT ON FUNCTION vault_store_secret IS 'Store a secret in the vault (service_role only)';
COMMENT ON FUNCTION vault_get_secret IS 'Retrieve a secret from the vault (service_role only)';
COMMENT ON FUNCTION vault_delete_secret IS 'Delete a secret from the vault (service_role only)';
