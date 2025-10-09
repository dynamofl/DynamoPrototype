-- Add 'testing' status for test API keys
-- Migration: 20250104000008_add_testing_status

-- Drop the old constraint
ALTER TABLE api_keys DROP CONSTRAINT IF EXISTS api_keys_status_check;

-- Add new constraint with 'testing' status
ALTER TABLE api_keys ADD CONSTRAINT api_keys_status_check
  CHECK (status IN ('active', 'inactive', 'revoked', 'expired', 'testing'));
