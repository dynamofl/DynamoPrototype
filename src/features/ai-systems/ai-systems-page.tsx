import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AISystem } from './types'
import { toUrlSlug } from '@/lib/utils'
import {
  AISystemCreateSheet,
  AISystemEditSheet,
  AISystemViewSheet,
  AISystemsHeader,
  AISystemsStats,
  AISystemsTableDirect,
  APIKeyAssignmentDialog
} from './components'
import { useAISystemsSupabase } from './lib/useAISystemsSupabase'
import { supabase, ensureAuthenticated } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { BulkActionBar } from '@/components/patterns/ui-patterns/bulk-action-bar'
import type { BulkAction } from '@/components/patterns/ui-patterns/bulk-action-bar'
import { Key, Trash2 } from 'lucide-react'

/**
 * AI Systems page - Main component using modular components
 */

export function AISystemsPage() {
  const navigate = useNavigate()

  // Dialog and sheet states
  const [isAddingSystem, setIsAddingSystem] = useState(false)
  const [isEditingSystem, setIsEditingSystem] = useState(false)
  const [editingSystem, setEditingSystem] = useState<AISystem | null>(null)
  const [isViewingSystem, setIsViewingSystem] = useState(false)
  const [viewingSystem, setViewingSystem] = useState<AISystem | null>(null)

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [systemToDelete, setSystemToDelete] = useState<AISystem | null>(null)
  const [isBulkDelete, setIsBulkDelete] = useState(false)

  // Selection state
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // API key assignment dialog state
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  const [selectedProviderType, setSelectedProviderType] = useState<string>('')

  // Use Supabase hook for AI systems data
  const { aiSystems, loading: aiSystemsLoading, reload: reloadAISystems } = useAISystemsSupabase()

  // Log AI systems for debugging
  useEffect(() => {
    console.log('[AISystemsPage] AI System IDs from Supabase:', aiSystems.map((s: AISystem) => ({ id: s.id, name: s.name })))
  }, [aiSystems])



  // Handle system creation
  const handleSystemCreated = async (system: AISystem) => {
    console.log('[AISystemsPage] handleSystemCreated called with system:', system)

    try {
      // Ensure authenticated
      await ensureAuthenticated()
      console.log('[AISystemsPage] Authentication successful')

      // IMPORTANT: Do NOT store actual API key in config
      // The API key is already securely stored in Supabase Vault
      // We only need to store the apiKeyId reference

      // Map provider name to lowercase for consistency with Supabase
      const providerTypeMap: Record<string, string> = {
        'OpenAI': 'openai',
        'Anthropic': 'anthropic',
        'Mistral': 'mistral',
        'Mistral AI': 'mistral',  // Handle both "Mistral" and "Mistral AI"
        'Cohere': 'cohere',
        'Google': 'google',
        'Azure OpenAI': 'azure',
        'Azure': 'azure',
        'AWS Bedrock': 'aws',
        'AWS': 'aws',
        'Databricks': 'databricks',
        'Hugging Face': 'huggingface',
        'HuggingFace': 'huggingface',
        'Gemini': 'gemini',
        'Remote': 'remote',
        'Local': 'local'
      };

      // Get the proper provider name from the system
      let providerName = system.providerId;
      if (system.providerName) {
        providerName = providerTypeMap[system.providerName] || system.providerName.toLowerCase();
      } else if (system.icon) {
        // Fallback to icon type if providerName is not available
        providerName = providerTypeMap[system.icon] || system.icon.toLowerCase();
      }

      console.log('[AISystemsPage] Provider mapping:', {
        original: system.providerId,
        providerName: system.providerName,
        icon: system.icon,
        mapped: providerName
      });

      // Prepare insert data
      const insertData = {
        id: system.id,
        name: system.name,
        description: '',  // AI System type doesn't have description
        provider: providerName, // Use the mapped provider name
        model: system.selectedModel,
        config: {
          apiKeyId: system.apiKeyId, // Only store the ID reference
          apiKeyName: system.apiKeyName,
          // DO NOT store actual API key here - it's in the vault
          modelDetails: system.modelDetails,
          icon: system.icon,
          status: system.status,
          hasValidAPIKey: system.hasValidAPIKey,
          selectedApiKeyIds: (system as any).selectedAPIKeys || [system.apiKeyId]
        }
      }

      console.log('[AISystemsPage] Inserting to Supabase:', insertData)

      // Create AI system in Supabase
      const { data, error } = await supabase
        .from('ai_systems')
        .insert(insertData)
        .select()

      if (error) {
        console.error('[AISystemsPage] Supabase insert error:', error)
        throw error
      }

      console.log('[AISystemsPage] Supabase insert successful:', data)

      // Trigger reload of AI systems
      await reloadAISystems()
      console.log('[AISystemsPage] AI systems reloaded')
    } catch (error) {
      console.error('[AISystemsPage] Failed to create system:', error)
    }
  }

  // Handle system update
  const handleSystemUpdated = async (system: AISystem) => {
    try {
      // Ensure authenticated
      await ensureAuthenticated()

      // Update AI system in Supabase
      const { error } = await supabase
        .from('ai_systems')
        .update({
          name: system.name,
          description: '',  // AI System type doesn't have description
          provider: system.providerId,
          model: system.selectedModel,
          config: {
            apiKeyId: system.apiKeyId,
            apiKeyName: system.apiKeyName,
            modelDetails: system.modelDetails,
            icon: system.icon,
            status: system.status,
            hasValidAPIKey: system.hasValidAPIKey
          }
        })
        .eq('id', system.id)

      if (error) {
        console.error('Failed to update system in Supabase:', error)
        throw error
      }

      // Trigger reload of AI systems
      await reloadAISystems()
    } catch (error) {
      console.error('Failed to update system:', error)
    }
  }

  // Handle edit system from direct table
  const handleEditSystem = (system: AISystem) => {
    setEditingSystem(system)
    setIsEditingSystem(true)
  }

  // Handle delete system from direct table
  const handleDeleteSystemRequest = (system: AISystem) => {
    setSystemToDelete(system)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete system confirmation
  const handleDeleteSystemConfirm = async () => {
    try {
      if (isBulkDelete) {
        // Bulk delete: delete all selected systems
        if (selectedRows.length === 0) return

        // Ensure authenticated
        await ensureAuthenticated()

        // Delete all selected systems
        const { error } = await supabase
          .from('ai_systems')
          .delete()
          .in('id', selectedRows)

        if (error) {
          console.error('Failed to delete systems from Supabase:', error)
          throw error
        }

        // Clear selection
        setSelectedRows([])
      } else {
        // Single delete
        if (!systemToDelete) return

        // Ensure authenticated
        await ensureAuthenticated()

        // Delete AI system from Supabase
        const { error } = await supabase
          .from('ai_systems')
          .delete()
          .eq('id', systemToDelete.id)

        if (error) {
          console.error('Failed to delete system from Supabase:', error)
          throw error
        }
      }

      // Trigger reload of AI systems
      await reloadAISystems()

      // Close dialog and reset state
      setIsDeleteDialogOpen(false)
      setSystemToDelete(null)
      setIsBulkDelete(false)
    } catch (error) {
      console.error('Failed to delete system(s):', error)
      alert(`Failed to delete system(s): ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle delete dialog cancel
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setSystemToDelete(null)
    setIsBulkDelete(false)
  }

  // Handle manage evaluation
  const handleManageEvaluation = (system: AISystem) => {
    // Navigate to the evaluation page with system name in URL
    navigate(`/ai-systems/${toUrlSlug(system.name)}/evaluation`)
  }

  // Handle view info
  const handleViewInfo = (system: AISystem) => {
    setViewingSystem(system)
    setIsViewingSystem(true)
  }

  // Handle edit from view sheet
  const handleEditFromView = () => {
    if (viewingSystem) {
      setEditingSystem(viewingSystem)
      setIsEditingSystem(true)
    }
  }

  // Handle row selection
  const handleRowSelect = (id: string, selected: boolean) => {
    setSelectedRows(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(rowId => rowId !== id)
    )
  }

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedRows(selected ? aiSystems.map(system => system.id) : [])
  }

  // Bulk action handlers
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return

    // Open the delete dialog in bulk mode
    setIsBulkDelete(true)
    setIsDeleteDialogOpen(true)
  }

  const handleBulkAssignApiKey = () => {
    if (selectedRows.length === 0) return

    // Get the selected systems
    const selectedSystems = aiSystems.filter(system => selectedRows.includes(system.id))

    // Check if all selected systems have the same provider type
    const providerTypes = [...new Set(selectedSystems.map(system => system.icon))]

    if (providerTypes.length > 1) {
      // Multiple provider types selected - this shouldn't happen as the button should be disabled
      return
    }

    // Open the API key assignment dialog
    setSelectedProviderType(providerTypes[0])
    setIsApiKeyDialogOpen(true)
  }

  const handleApiKeyAssignment = async (selectedKeyIds: string[], primaryKeyId: string) => {
    try {
      // Ensure authenticated
      await ensureAuthenticated()

      // Get the primary key details from Supabase Vault
      const { SecureAPIKeyService } = await import('@/lib/supabase/secure-api-key-service')
      const primaryKey = await SecureAPIKeyService.getAPIKey(primaryKeyId)

      if (!primaryKey) {
        throw new Error('Primary API key not found')
      }

      console.log('Assigning API keys:', { primaryKeyId, selectedKeyIds, primaryKeyName: primaryKey.name })

      // Update all selected systems with the new API keys
      const updates = selectedRows.map(async (systemId) => {
        const system = aiSystems.find(s => s.id === systemId)
        if (!system) return

        // Fetch current config from Supabase
        const { data: currentData } = await supabase
          .from('ai_systems')
          .select('config')
          .eq('id', systemId)
          .single()

        const { error } = await supabase
          .from('ai_systems')
          .update({
            config: {
              ...(currentData?.config || {}),
              apiKeyId: primaryKeyId,
              apiKeyName: primaryKey.name,
              selectedApiKeyIds: selectedKeyIds,
              hasValidAPIKey: true
            }
          })
          .eq('id', systemId)

        if (error) throw error
        console.log('✅ Updated AI system with API keys:', systemId)
      })

      await Promise.all(updates)

      // Reload AI systems
      await reloadAISystems()

      // Clear selection
      setSelectedRows([])

      // Close dialog
      setIsApiKeyDialogOpen(false)
    } catch (error) {
      console.error('Failed to assign API keys:', error)
      alert(`Failed to assign API keys: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleClearSelection = () => {
    setSelectedRows([])
  }

  // Check if selected systems have different providers
  const selectedSystems = aiSystems.filter(system => selectedRows.includes(system.id))
  const providerTypes = [...new Set(selectedSystems.map(system => system.providerId))]
  const hasDifferentProviders = providerTypes.length > 1

  // Define bulk actions with conditional disable for API key assignment
  const bulkActions: BulkAction[] = [
    {
      key: 'assign-api-key',
      label: 'Manage API Keys',
      icon: <Key className="h-4 w-4" />,
      variant: 'outline',
      onClick: handleBulkAssignApiKey,
      disabled: hasDifferentProviders,
      disabledTooltip: hasDifferentProviders
        ? 'Cannot assign API keys to systems with different providers. Please select systems from the same provider.'
        : undefined
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'destructive',
      onClick: handleBulkDelete
    }
  ]

  // Show loading state while AI systems are being fetched
  if (aiSystemsLoading) {
    return (
      <div className="">
        <main className="mx-auto">
          <div className="space-y-3 py-3">
            <AISystemsHeader onAddSystem={() => setIsAddingSystem(true)} />
            <div className="px-4">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading AI Systems...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="">
      <main className="mx-auto">
        <div className="space-y-3 py-3">
          {/* Page Header */}
          <AISystemsHeader onAddSystem={() => setIsAddingSystem(true)} />

          {/* Stats Cards */}
          <div className="px-4">
            <AISystemsStats data={aiSystems} />
          </div>


          {/* Systems Table */}
          <div className="">
            <AISystemsTableDirect
              data={aiSystems}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              onEdit={handleEditSystem}
              onDelete={handleDeleteSystemRequest}
              onManageEvaluation={handleManageEvaluation}
              onViewInfo={handleViewInfo}
            />
          </div>

          {/* Create System Sheet */}
          <AISystemCreateSheet
            open={isAddingSystem}
            onOpenChange={setIsAddingSystem}
            onAISystemCreated={handleSystemCreated}
          />

          {/* View System Sheet */}
          <AISystemViewSheet
            open={isViewingSystem}
            onOpenChange={setIsViewingSystem}
            aiSystem={viewingSystem}
            onEditClick={handleEditFromView}
          />

          {/* Edit System Sheet */}
          <AISystemEditSheet
            open={isEditingSystem}
            onOpenChange={setIsEditingSystem}
            aiSystem={editingSystem}
            onAISystemUpdated={handleSystemUpdated}
          />

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isBulkDelete ? 'Delete AI Systems' : 'Delete AI System'}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {isBulkDelete
                    ? `Are you sure you want to delete ${selectedRows.length} AI system${selectedRows.length > 1 ? 's' : ''}? This action cannot be undone.`
                    : `Are you sure you want to delete "${systemToDelete?.name}"? This action cannot be undone.`
                  }
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleDeleteCancel}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSystemConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* API Key Assignment Dialog */}
          <APIKeyAssignmentDialog
            open={isApiKeyDialogOpen}
            onOpenChange={setIsApiKeyDialogOpen}
            providerType={selectedProviderType}
            selectedCount={selectedRows.length}
            selectedSystems={selectedSystems.map(system => ({
              id: system.id,
              name: system.name,
              config: {
                apiKeyId: system.apiKeyId,
                selectedApiKeyIds: (system as any).config?.selectedApiKeyIds
              }
            }))}
            onConfirm={handleApiKeyAssignment}
          />
        </div>
      </main>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedRows.length}
        onClearSelection={handleClearSelection}
        actions={bulkActions}
      />
    </div>
  )
}
