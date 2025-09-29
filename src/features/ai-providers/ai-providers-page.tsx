import { useState, useEffect, useMemo } from 'react'
import { APIKeyStorage } from '@/lib/storage/secure-storage'
import type { TableRow } from '@/types/table'
import type { AIProvider } from './types'
import {
  AIProvidersStats,
  ProviderCreateDialog,
  ProviderViewSheet,
  ProviderEditSheet
} from './components'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  createDefaultProvider,
  fetchModelsForProvider,
  AIProvidersTableStorage,
  aiProvidersStorageConfig,
  aiProvidersColumns,
  aiProvidersExpandableConfig,
  aiProvidersPaginationConfig
} from './lib'
import { TablePattern } from '@/components/patterns'
import { ModelsListSlot } from '@/components/patterns/slot'

/**
 * AI Providers page - Main component using modular components
 */

export function AIProviders() {
  // Dialog and sheet states
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [isViewingProvider, setIsViewingProvider] = useState(false)
  const [isEditingProvider, setIsEditingProvider] = useState(false)
  const [viewingProvider, setViewingProvider] = useState<TableRow | null>(null)
  const [editingProvider, setEditingProvider] = useState<TableRow | null>(null)
  
  // Create custom storage instance for AI providers
  const customStorage = useMemo(() => {
    return new AIProvidersTableStorage(aiProvidersStorageConfig)
  }, [])
  
  // Initialize default provider if none exist
  useEffect(() => {
    const storedProviders = APIKeyStorage.loadProviders()
    if (storedProviders.length === 0) {
      const defaultProvider = createDefaultProvider()
      APIKeyStorage.saveProviders([defaultProvider])
    }
  }, [])

  // Handle cell actions from TablePattern
  const handleCellAction = (action: string, row: TableRow) => {
    switch (action) {
      case 'view':
        setViewingProvider(row)
        setIsViewingProvider(true)
        break
      case 'edit':
        setEditingProvider(row)
        setIsEditingProvider(true)
        break
      case 'fetch':
        handleFetchModels(row.id)
        break
      case 'delete':
        handleDeleteProvider(row.id)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  // Handle row expansion
  const handleRowExpand = (rowId: string, expanded: boolean) => {
    console.log('Row expanded:', rowId, expanded)
  }


  // Handle data changes from TablePattern
  const handleDataChange = (data: TableRow[]) => {
    console.log('Data changed:', data.length, 'providers')
  }

  // Handle provider creation
  const handleProviderCreated = (provider: AIProvider) => {
    const existingProviders = APIKeyStorage.loadProviders()
    const updatedProviders = [...existingProviders, provider]
    APIKeyStorage.saveProviders(updatedProviders)
  }

  // Handle provider update
  const handleProviderUpdated = (provider: AIProvider) => {
    const existingProviders = APIKeyStorage.loadProviders()
    const updatedProviders = existingProviders.map((p: any) => {
      if (p.id === provider.id) {
        return provider
      }
      return p
    })
    APIKeyStorage.saveProviders(updatedProviders)
  }

  // Handle fetch models
  const handleFetchModels = async (providerId: string) => {
    try {
      const storedProviders = APIKeyStorage.loadProviders()
      const provider = storedProviders.find((p: any) => p.id === providerId)
      if (!provider) return

      const models = await fetchModelsForProvider(provider)
      const updatedProviders = storedProviders.map((p: any) => {
        if (p.id === providerId) {
          return {
            ...p,
            models,
            modelsLastFetched: new Date().toLocaleString(),
            isExpanded: true
          }
        }
        return p
      })
      
      APIKeyStorage.saveProviders(updatedProviders)
    } catch (error) {
      console.error('Failed to fetch models for provider:', error)
    }
  }

  // Handle delete provider
  const handleDeleteProvider = (id: string) => {
    APIKeyStorage.deleteProvider(id)
  }

  // Handle edit provider
  const handleEditProvider = (provider: TableRow) => {
    setEditingProvider(provider)
    setIsEditingProvider(true)
  }

  // Custom expandable content renderer
  const renderExpandableContent = (row: TableRow) => {
    const models = row.models || []
    
    return (
      <ModelsListSlot
        models={models}
        lastFetched={row.modelsLastFetched}
        emptyMessage="No text models fetched yet"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-0">
      <main className="mx-auto">
        <div className="space-y-4">
          {/* Page Header */}
          <div className="px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-450 tracking-tight">AI Providers</h1>
              <Button
                onClick={() => setIsAddingProvider(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Provider
              </Button>
            </div>
            
            {/* Stats Cards */}
            <AIProvidersStats />
          </div>

          {/* Provider Table */}
          <div className="px-6">
            <div className="bg-gray-0 rounded-lg border border-gray-200">
              <TablePattern
              mode="view"
              columns={aiProvidersColumns}
              storageConfig={aiProvidersStorageConfig}
              customStorage={customStorage}
              pagination={aiProvidersPaginationConfig}
              expandable={{
                ...aiProvidersExpandableConfig,
                renderContent: renderExpandableContent
              }}
              onDataChange={handleDataChange}
              onCellAction={handleCellAction}
              onRowExpand={handleRowExpand}
              className=""
              emptyMessage="No AI providers configured. Add your first provider to get started."
            />
            </div>
          </div>

          {/* View Provider Sheet */}
          <ProviderViewSheet
            open={isViewingProvider}
            onOpenChange={setIsViewingProvider}
            provider={viewingProvider as AIProvider | null}
            onEdit={handleEditProvider}
          />

          {/* Edit Provider Sheet */}
          <ProviderEditSheet
            open={isEditingProvider}
            onOpenChange={setIsEditingProvider}
            provider={editingProvider as AIProvider | null}
            onProviderUpdated={handleProviderUpdated}
          />

          {/* Create Provider Dialog */}
          <ProviderCreateDialog
            open={isAddingProvider}
            onOpenChange={setIsAddingProvider}
            onProviderCreated={handleProviderCreated}
          />
        </div>
      </main>
    </div>
  )
}
