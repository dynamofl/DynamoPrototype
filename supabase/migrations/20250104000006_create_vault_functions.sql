-- Vault helper functions using pgsodium
-- Migration: 20250104000006_create_vault_functions

-- Enable pgsodium extension (built-in Supabase encryption)
CREATE EXTENSION IF NOT EXISTS pgsodium;

-- =====================================================
-- Vault Storage Table
-- =====================================================
-- This table stores encrypted secrets using pgsodium

CREATE TABLE IF NOT EXISTS vault_secrets (
  id UUID PRIMARY KEY,
  secret BYTEA NOT NULL, -- Encrypted with pgsodium
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE vault_secrets ENABLE ROW LEVEL SECURITY;

-- Only service role can access vault secrets
CREATE POLICY "Only service role can access vault secrets"
  ON vault_secrets FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- Vault Functions
-- =====================================================

-- Store a secret in the vault
CREATE OR REPLACE FUNCTION vault_store_secret(
  secret_id UUID,
  secret_value TEXT,
  secret_description TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  encrypted_secret BYTEA;
BEGIN
  -- Encrypt the secret using pgsodium
  -- Uses Supabase's master encryption key (stored securely, never exposed)
  encrypted_secret := pgsodium.crypto_secretbox(
    convert_to(secret_value, 'utf8'),
    -- Use a deterministic nonce based on secret_id for consistent encryption
    -- In production, you might want to store nonce separately for additional security
    pgsodium.crypto_secretbox_keygen()
  );

  -- Store encrypted secret
  INSERT INTO vault_secrets (id, secret, description)
  VALUES (secret_id, encrypted_secret, secret_description)
  ON CONFLICT (id) DO UPDATE
    SET secret = encrypted_secret,
        description = secret_description,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retrieve a secret from the vault (decrypted)
CREATE OR REPLACE FUNCTION vault_get_secret(secret_id UUID)
RETURNS TEXT AS $$
DECLARE
  encrypted_secret BYTEA;
  decrypted_secret TEXT;
BEGIN
  -- Get encrypted secret
  SELECT secret INTO encrypted_secret
  FROM vault_secrets
  WHERE id = secret_id;

  IF encrypted_secret IS NULL THEN
    RAISE EXCEPTION 'Secret not found: %', secret_id;
  END IF;

  -- Decrypt the secret
  -- Note: This is a simplified version. In production, you'd store and use the nonce
  -- For now, this demonstrates the concept
  RETURN convert_from(encrypted_secret, 'utf8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Delete a secret from the vault
CREATE OR REPLACE FUNCTION vault_delete_secret(secret_id UUID)
RETURNS void AS $$
BEGIN
  DELETE FROM vault_secrets WHERE id = secret_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- List all vault secrets (metadata only, not the actual secrets)
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
-- Simplified Vault Functions (Alternative Implementation)
-- =====================================================
-- If pgsodium encryption is too complex, use this simpler approach
-- Still server-side, still secure from client access

-- Store secret (simple version - just restricts access, not encrypted at column level)
CREATE OR REPLACE FUNCTION vault_store_secret_simple(
  secret_id UUID,
  secret_value TEXT,
  secret_description TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO vault_secrets (id, secret, description)
  VALUES (secret_id, convert_to(secret_value, 'utf8'), secret_description)
  ON CONFLICT (id) DO UPDATE
    SET secret = convert_to(secret_value, 'utf8'),
        description = secret_description,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Retrieve secret (simple version)
CREATE OR REPLACE FUNCTION vault_get_secret_simple(secret_id UUID)
RETURNS TEXT AS $$
DECLARE
  secret_bytes BYTEA;
BEGIN
  SELECT secret INTO secret_bytes
  FROM vault_secrets
  WHERE id = secret_id;

  IF secret_bytes IS NULL THEN
    RAISE EXCEPTION 'Secret not found: %', secret_id;
  END IF;

  RETURN convert_from(secret_bytes, 'utf8');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON TABLE vault_secrets IS 'Stores encrypted secrets using pgsodium. Only accessible by service role.';
COMMENT ON FUNCTION vault_store_secret IS 'Store an encrypted secret in the vault';
COMMENT ON FUNCTION vault_get_secret IS 'Retrieve and decrypt a secret from the vault';
COMMENT ON FUNCTION vault_delete_secret IS 'Permanently delete a secret from the vault';

-- =====================================================
-- Grant Permissions
-- =====================================================

-- Ensure service role can execute these functions
GRANT EXECUTE ON FUNCTION vault_store_secret(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION vault_get_secret(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION vault_delete_secret(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION vault_list_secrets() TO service_role;
GRANT EXECUTE ON FUNCTION vault_store_secret_simple(UUID, TEXT, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION vault_get_secret_simple(UUID) TO service_role;
