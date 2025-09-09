import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { TablePattern } from '@/components/patterns'
import { accessTokenColumns, accessTokenStorageConfig } from './lib/access-token-config'
import { AccessTokenStorage } from './lib/access-token-storage'
import { APIKeyCreateSheet, APIKeyEditSheet } from './components'
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

  const handleDataChange = (data: any[]) => {
    console.log('Data changed:', data)
  }

  const handleAPIKeyCreated = async (provider: TableRow, name: string, apiKey: string) => {
    console.log('API key created for provider:', provider.provider, 'Name:', name, 'Key:', apiKey)
    
    // Save the API key to storage
    await customStorage.addAPIKey(provider.provider, name, apiKey)
    
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
    <>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-base font-450 text-gray-900 tracking-tight">Access Token & API Keys</h1>
      </div>

      {/* Access Token Section */}
      <div className="px-3 py-4">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="space-y-2">
            <h3 className="text-sm font-450 text-gray-900">Your DynamoAI Access Token</h3>
            <p className="text-xs text-gray-600 leading-5">
              Access tokens authenticate your identity and grant authorization when interacting with Dynamo AI via the API or SDK. Only one access token can remain valid at a given time. 
              Generating a new access token will automatically revoke the existing token.
            </p>
            <Button variant="default" size="default" className="bg-blue-600 hover:bg-blue-700 text-white">
              Generate New Token
            </Button>
          </div>
        </div>
      </div>

      {/* API Providers Table */}
      <div className="flex-1 px-3 pb-2">
        <div className="overflow-x-auto">
          <TablePattern
            key={refreshTrigger} // Force re-render when API keys change
            mode="view"
            columns={accessTokenColumns}
            storageConfig={accessTokenStorageConfig}
            customStorage={customStorage}
            onDataChange={handleDataChange}
            onCellAction={handleCellAction}
            className="border-0 rounded-lg min-w-full"
            emptyMessage="No API providers configured"
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
    </>
  )
}
