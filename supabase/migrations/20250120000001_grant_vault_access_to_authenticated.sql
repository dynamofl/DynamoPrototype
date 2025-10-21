-- Grant authenticated users permission to store and retrieve their own secrets
-- This is needed so the frontend can store API keys in the vault when creating AI systems

GRANT EXECUTE ON FUNCTION vault_store_secret(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION vault_get_secret(UUID) TO authenticated;

-- Note: vault_delete_secret remains service_role only for security
-- Deletion should only happen through controlled Edge Functions

COMMENT ON FUNCTION vault_store_secret IS 'Store a secret in the vault (service_role and authenticated)';
COMMENT ON FUNCTION vault_get_secret IS 'Retrieve a secret from the vault (service_role and authenticated)';
