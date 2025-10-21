import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { AccessTokenStorage } from './lib/access-token-storage'
import { SecureAPIKeyService } from '@/lib/supabase/secure-api-key-service'
import { APIKeyCreateSheet, APIKeyEditSheet, TokenDialog, AccessTokenTable } from './components'
import type { TableRow } from '@/types/table'

export function AccessTokenContent() {
  // Sheet states
  const [isAddingAPIKey, setIsAddingAPIKey] = useState(false)
  const [isManagingAPIKey, setIsManagingAPIKey] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<TableRow | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Create custom storage instance
  const customStorage = useMemo(() => {
    return new AccessTokenStorage()
  }, [])

  const handleCellAction = (action: string, row: any) => {
    console.log('Cell action:', action, row)

    if (action === 'add') {
      setSelectedProvider(row)
      setIsAddingAPIKey(true)
    } else if (action === 'manage') {
      setSelectedProvider(row)
      setIsManagingAPIKey(true)
    }
  }

  const handleAPIKeyCreated = async (provider: TableRow, name: string, apiKey: string) => {
    console.log('API key created for provider:', provider.provider, 'Name:', name)

    try {
      // Map provider names to lowercase for consistency
      // The store-api-key function expects lowercase provider names
      const providerTypeMap: Record<string, string> = {
        'OpenAI': 'openai',
        'Anthropic': 'anthropic',
        'Mistral': 'mistral',
        'Cohere': 'cohere',
        'Google': 'google'
      };

      const providerType = providerTypeMap[provider.provider] || provider.provider.toLowerCase();

      // Store in Supabase Vault
      const storedKey = await SecureAPIKeyService.storeAPIKey({
        name,
        provider: providerType as any,
        apiKey
      });

      console.log('✅ API key successfully stored in Supabase Vault with ID:', storedKey.id);

      // Also save metadata to localStorage for display purposes (without the actual key)
      await customStorage.addAPIKey(provider.provider, name, `vault:${storedKey.id}`);

    } catch (error) {
      console.error('Failed to store API key in vault:', error);
      // Don't fallback to localStorage - it's better to fail than to store insecurely
      throw error;
    }

    // Trigger refresh to update the table
    setRefreshTrigger(prev => prev + 1)
  }

  const handleAPIKeyUpdated = async (provider: TableRow, apiKey: string) => {
    console.log('API key updated for provider:', provider.provider, 'Key:', apiKey)
    
    // Update the API key in storage (this would need the key ID in real implementation)
    // For now, we'll just trigger a refresh
    setRefreshTrigger(prev => prev + 1)
  }

  const handleAPIKeyDeleted = async (provider: TableRow) => {
    console.log('API key deleted for provider:', provider.provider)
    
    // Remove the API key from storage (this would need the key ID in real implementation)
    // For now, we'll just trigger a refresh
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className="space-y-3 py-3">
      {/* Header */}
      <div className="px-4">
        <h1 className="text-base font-450 text-gray-900 tracking-tight">Access Token & API Keys</h1>
      </div>

      {/* Access Token Section */}
      <div className="px-4">
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="space-y-2">
            <h3 className="text-[0.8125rem]  font-450 text-gray-900">Your DynamoAI Access Token</h3>
            <p className="text-xs text-gray-600 leading-5">
              Access tokens authenticate your identity and grant authorization when interacting with Dynamo AI via the API or SDK. Only one access token can remain valid at a given time.
              Generating a new access token will automatically revoke the existing token.
            </p>
            <TokenDialog>
              <Button variant="default" size="default">
                Generate New Token
              </Button>
            </TokenDialog>
          </div>
        </div>
      </div>

      {/* API Providers Table */}
      <div className="px-4">
        <div className="overflow-x-auto">
          <AccessTokenTable
            refreshTrigger={refreshTrigger}
            onCellAction={handleCellAction}
          />
        </div>
      </div>

      {/* API Key Create Sheet */}
      <APIKeyCreateSheet
        open={isAddingAPIKey}
        onOpenChange={setIsAddingAPIKey}
        provider={selectedProvider}
        onAPIKeyCreated={handleAPIKeyCreated}
      />

      {/* API Key Edit Sheet */}
      <APIKeyEditSheet
        open={isManagingAPIKey}
        onOpenChange={setIsManagingAPIKey}
        provider={selectedProvider}
        storage={customStorage}
        onAPIKeyUpdated={handleAPIKeyUpdated}
        onAPIKeyDeleted={handleAPIKeyDeleted}
      />
    </div>
  )
}
