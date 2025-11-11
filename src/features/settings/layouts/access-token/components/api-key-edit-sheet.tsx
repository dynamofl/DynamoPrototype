/**
 * APIKeyEditSheet component for managing existing API keys
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ViewEditSheet } from '@/components/patterns'
import { AISystemIcon } from '@/components/patterns/ui-patterns/ai-system-icon'
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
import { KeyRound, Loader2, CheckCircle, XCircle, Trash2, Plus } from 'lucide-react'
import type { TableRow } from '@/types/table'
import { createAndStoreAPIKey } from '@/features/ai-systems/lib/api-integration'
import { getProviderKeyPlaceholder, type ProviderType } from '@/features/ai-systems/lib/provider-validation'
import { SecureAPIKeyService } from '@/lib/supabase/secure-api-key-service'

export interface APIKeyEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: TableRow | null
  storage: any // AccessTokenStorage instance
  onAPIKeyUpdated: (provider: TableRow, apiKey: string) => void
  onAPIKeyDeleted: (provider: TableRow) => void
}


export function APIKeyEditSheet({ 
  open, 
  onOpenChange, 
  provider,
  storage,
  onAPIKeyUpdated,
  onAPIKeyDeleted
}: APIKeyEditSheetProps) {
  const [apiKeys, setApiKeys] = useState<Array<{ id: string; name: string; key: string; createdAt: string }>>([])
  const [editingKey, setEditingKey] = useState<{ id: string; name: string; key: string } | null>(null)
  const [_showKeys, _setShowKeys] = useState<Record<string, boolean>>({})
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [validationError, setValidationError] = useState('')
  const [isAddingNewKey, setIsAddingNewKey] = useState(false)
  const [newKeyForm, setNewKeyForm] = useState({ name: '', key: '' })
  const [isValidatingNewKey, setIsValidatingNewKey] = useState(false)
  const [newKeyValidationStatus, setNewKeyValidationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [newKeyValidationError, setNewKeyValidationError] = useState('')

  // Field-specific error states for new key form
  const [newKeyFieldErrors, setNewKeyFieldErrors] = useState({
    apiKeyName: '',
    apiKeyValue: '',
  })
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    open: boolean
    keyId: string | null
    keyName: string
  }>({
    open: false,
    keyId: null,
    keyName: ''
  })

  // Load API keys when provider changes
  useEffect(() => {
    if (provider) {
      const loadKeys = async () => {
        console.log('Loading API keys for provider:', provider.provider)

        try {
          // Map provider name to lowercase for Supabase
          const providerTypeMap: Record<string, string> = {
            'OpenAI': 'openai',
            'Anthropic': 'anthropic',
            'Mistral': 'mistral',
            'Cohere': 'cohere',
            'Google': 'google'
          };
          const vaultProviderType = providerTypeMap[provider.provider] || provider.provider.toLowerCase();

          // Load keys from Supabase Vault
          const vaultKeys = await SecureAPIKeyService.listAPIKeys()
          const providerKeys = vaultKeys
            .filter(key => key.provider === vaultProviderType)
            .map(key => ({
              id: key.id,
              name: key.name,
              key: key.masked, // Masked key for display
              createdAt: key.createdAt
            }))

          console.log('Loaded keys from Supabase:', providerKeys)
          setApiKeys(providerKeys)
        } catch (error) {
          console.error('Failed to load API keys:', error)
          // Fallback to empty array if there's an error
          setApiKeys([])
        }

        setEditingKey(null)
        setValidationStatus('idle')
        // Reset add new key mode when opening
        setIsAddingNewKey(false)
      }
      loadKeys()
    }
  }, [provider])

  const _toggleKeyVisibility = (keyId: string) => {
    _setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const _handleEditKey = (key: { id: string; name: string; key: string }) => {
    setEditingKey({ ...key })
    setValidationStatus('idle')
    setValidationError('')
  }

  const handleSaveKey = async () => {
    if (!editingKey || !provider) return

    if (!editingKey.name.trim()) {
      setValidationError('API key name is required')
      return
    }

    if (!editingKey.key.trim()) {
      setValidationError('API key is required')
      return
    }

    setIsValidating(true)
    setValidationStatus('idle')

    try {
      // Simulate API validation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock validation - in real implementation, validate the key
      const isValid = editingKey.key.length > 10
      
      if (isValid) {
        setValidationStatus('success')
        // Update the key in the list
        setApiKeys(prev => prev.map(k => 
          k.id === editingKey.id 
            ? { ...k, name: editingKey.name.trim(), key: editingKey.key.trim() }
            : k
        ))
        setEditingKey(null)
        onAPIKeyUpdated(provider, editingKey.key.trim())
      } else {
        setValidationStatus('error')
        setValidationError('Invalid API key. Please check your key and try again.')
      }
    } catch (error) {
      setValidationStatus('error')
      setValidationError('Failed to validate API key. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleDeleteKey = (keyId: string, keyName: string) => {
    setDeleteConfirmDialog({
      open: true,
      keyId,
      keyName
    })
  }

  const confirmDeleteKey = async () => {
    if (!provider || !deleteConfirmDialog.keyId) return

    try {
      // Delete from Supabase Vault (this will also delete from database)
      await SecureAPIKeyService.deleteAPIKey(deleteConfirmDialog.keyId)
      console.log('✅ API key deleted from Supabase Vault')

      // Also remove from localStorage for backward compatibility
      if (storage) {
        await storage.deleteAPIKey(provider.provider, deleteConfirmDialog.keyId)
      }

      // Update UI state
      setApiKeys(prev => prev.filter(k => k.id !== deleteConfirmDialog.keyId))
      if (editingKey?.id === deleteConfirmDialog.keyId) {
        setEditingKey(null)
      }
      onAPIKeyDeleted(provider)
    } catch (error) {
      console.error('Failed to delete API key:', error)
      alert('Failed to delete API key. Please try again.')
    }

    // Close the dialog
    setDeleteConfirmDialog({
      open: false,
      keyId: null,
      keyName: ''
    })
  }

  const cancelDeleteKey = () => {
    setDeleteConfirmDialog({
      open: false,
      keyId: null,
      keyName: ''
    })
  }

  const handleCancelEdit = () => {
    setEditingKey(null)
    setValidationStatus('idle')
    setValidationError('')
  }

  const handleAddNewKey = () => {
    setIsAddingNewKey(true)
    setNewKeyForm({ name: '', key: '' })
    setNewKeyValidationStatus('idle')
    setNewKeyValidationError('')
    setNewKeyFieldErrors({ apiKeyName: '', apiKeyValue: '' })
  }

  const handleCancelAddNewKey = () => {
    // Always close add mode - user can see empty state again
    setIsAddingNewKey(false)
    setNewKeyForm({ name: '', key: '' })
    setNewKeyValidationStatus('idle')
    setNewKeyValidationError('')
    setNewKeyFieldErrors({ apiKeyName: '', apiKeyValue: '' })
  }

  const handleSaveNewKey = async () => {
    if (!provider || !storage) return

    // Clear previous field errors
    setNewKeyFieldErrors({ apiKeyName: '', apiKeyValue: '' })

    // Basic validation
    if (!newKeyForm.name.trim()) {
      setNewKeyFieldErrors(prev => ({ ...prev, apiKeyName: 'API key name is required' }))
      return
    }

    if (!newKeyForm.key.trim()) {
      setNewKeyFieldErrors(prev => ({ ...prev, apiKeyValue: 'API key is required' }))
      return
    }

    // Provider-specific format validation is now handled in createAndStoreAPIKey

    setIsValidatingNewKey(true)
    setNewKeyValidationStatus('idle')

    try {
      // Use the comprehensive validation from AI Systems
      // Skip duplicate checks if there are no existing API keys
      const result = await createAndStoreAPIKey(
        provider.provider,
        newKeyForm.name.trim(),
        newKeyForm.key.trim(),
        apiKeys.length === 0 // Skip duplicate checks when no existing keys
      )

      if (result.success) {
        setNewKeyValidationStatus('success')
        // Reload keys to show the new one
        const updatedKeys = await storage.getAPIKeys(provider.provider)
        setApiKeys(updatedKeys)

        // Reset form and close add mode
        handleCancelAddNewKey()
        onAPIKeyUpdated(provider, newKeyForm.key.trim())
      } else {
        setNewKeyValidationStatus('error')
        // Handle specific error types
        const error = result.error || 'Failed to create API key'
        
        if (error.includes('already exists') && error.includes('name')) {
          setNewKeyFieldErrors(prev => ({ ...prev, apiKeyName: error }))
        } else if (error.includes('already in use') || error.includes('Invalid API key')) {
          setNewKeyFieldErrors(prev => ({ ...prev, apiKeyValue: error }))
        } else {
          setNewKeyValidationError(error)
        }
      }
    } catch (error) {
      setNewKeyValidationStatus('error')
      setNewKeyValidationError('Failed to validate API key. Please try again.')
    } finally {
      setIsValidatingNewKey(false)
    }
  }

  if (!provider) return null

  const getProviderIconType = (providerName: string) => {
    const iconMap: Record<string, any> = {
      'OpenAI': 'OpenAI',
      'Azure OpenAI': 'Azure',
      'Databricks': 'Databricks',
      'Mistral': 'Mistral',
      'AWS Bedrock': 'AWS',
      'Anthropic': 'Anthropic'
    }
    return iconMap[providerName] || 'Remote'
  }

  const maskAPIKey = (key: string) => {
    if (key.length <= 8) return key
    return key.substring(0, 4) + '••••••••' + key.substring(key.length - 4)
  }

  // Determine footer content based on current state
  const getFooterContent = () => {
    // Only show footer when actually adding a new key (not in empty state)
    if (isAddingNewKey) {
      return (
        <div className="flex gap-2">
          <Button
            onClick={handleSaveNewKey}
            disabled={isValidatingNewKey || !newKeyForm.name.trim() || !newKeyForm.key.trim()}
            className="w-fit"
          >
            {isValidatingNewKey ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              'Validate & Add'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancelAddNewKey}
            disabled={isValidatingNewKey}
          >
            Cancel
          </Button>
        </div>
      )
    }

    if (editingKey) {
      return (
        <div className="flex gap-2">
          <Button
            onClick={handleSaveKey}
            disabled={isValidating}
            className="flex-1"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isValidating}
          >
            Cancel
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Manage API Keys"
      size="lg"
      footer={getFooterContent()}
    >
      <div className="space-y-6">
        {/* Provider Info */}


        <div className="space-y-2">
          <Label htmlFor="api-key-name">API Provider</Label>

          <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
            <AISystemIcon
              type={getProviderIconType(provider.provider)}
              className="w-8 h-8"
            />
            <div>
              <p className="text-[0.8125rem]  font-450 text-gray-900">
                {provider.provider}
              </p>
            </div>
          </div>
        </div>
        

        {/* API Keys List */}
        <div className="space-y-2">

          {apiKeys.length === 0 && !isAddingNewKey ? (
            <div className="space-y-4">
              <Label htmlFor="api-key-name">API Keys</Label>
              <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                <KeyRound className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-4">No API keys configured for this provider</p>
                <Button
                  onClick={handleAddNewKey}
                  size="default"
                  variant="default"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add New Key
                </Button>
              </div>
            </div>
          ) : apiKeys.length === 0 && isAddingNewKey ? (
            <div className="space-y-4">
              <Label htmlFor="api-key-name">API Keys</Label>

              {/* Add New Key Form when no existing keys */}
              <div className="border p-3 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="py-1">
                    <KeyRound className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="space-y-2">
                      <Label htmlFor="new-key-name">API Key Name</Label>
                      <Input
                        id="new-key-name"
                        placeholder="Enter a name for this API key"
                        value={newKeyForm.name}
                        onChange={(e) => {
                          setNewKeyForm({ ...newKeyForm, name: e.target.value })
                          if (newKeyFieldErrors.apiKeyName) {
                            setNewKeyFieldErrors(prev => ({ ...prev, apiKeyName: '' }))
                          }
                        }}
                        error={newKeyFieldErrors.apiKeyName}
                        disabled={isValidatingNewKey}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new-key-value">API Key</Label>
                      <Input
                        id="new-key-value"
                        type="password"
                        placeholder="Enter your API key"
                        value={newKeyForm.key}
                        onChange={(e) => {
                          setNewKeyForm({ ...newKeyForm, key: e.target.value })
                          if (newKeyFieldErrors.apiKeyValue) {
                            setNewKeyFieldErrors(prev => ({ ...prev, apiKeyValue: '' }))
                          }
                        }}
                        error={newKeyFieldErrors.apiKeyValue}
                        disabled={isValidatingNewKey}
                      />
                      <p className="text-xs text-gray-500">
                        Your API key will be encrypted and stored securely.
                      </p>
                    </div>

                    {/* Validation Status */}
                    {newKeyValidationStatus === "success" && (
                      <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-[0.8125rem]  text-green-800">
                          API key validated successfully!
                        </span>
                      </div>
                    )}

                    {newKeyValidationStatus === "error" && newKeyValidationError && (
                      <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-[0.8125rem]  text-red-800">
                          {newKeyValidationError}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (

            <div className="space-y-3">
                        <Label htmlFor="api-key-name">API Keys</Label>

              {/* Existing API Keys */}
              {apiKeys.map((key) => (
                <div key={key.id} className="border border-gray-200 rounded-lg p-3">
                  {editingKey?.id === key.id ? (
                    // Edit Mode
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-name-${key.id}`}>API Key Name</Label>
                        <Input
                          id={`edit-name-${key.id}`}
                          value={editingKey.name}
                          onChange={(e) => setEditingKey({ ...editingKey, name: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`edit-key-${key.id}`}>API Key</Label>
                        <Input
                          id={`edit-key-${key.id}`}
                          type="password"
                          value={editingKey.key}
                          onChange={(e) => setEditingKey({ ...editingKey, key: e.target.value })}
                        />
                      </div>

                      {/* Validation Status */}
                      {validationStatus === 'success' && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-[0.8125rem]  text-green-800">API key updated successfully!</span>
                        </div>
                      )}
                      {validationStatus === 'error' && validationError && (
                        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span className="text-[0.8125rem]  text-red-800">{validationError}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    // View Mode
                    <div className="flex items-start justify-between gap-3">
                      <div className="py-1">
                      <KeyRound className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        
                        <div className="flex items-center space-x-2">
                          <div className="text-[0.8125rem]  font-400 text-gray-900">{key.name}</div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="text-[0.8125rem]  font-400">
                           {maskAPIKey(key.key)}
                          </div>

                      
                        </div>

                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="text-xs text-gray-500">
                          Created On: {new Date(key.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteKey(key.id, key.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Key Section - only show when there are existing keys */}
          {apiKeys.length > 0 && (
            <div className="space-y-4 ">
              {!isAddingNewKey ? (
                <div className="flex">
                  <Button
                    onClick={handleAddNewKey}
                    size="default"
                    variant="secondary"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add New Key
                  </Button>
                </div>
              ) : (
              <div className="border p-3 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                 
                <div className="py-1">
                      <KeyRound className="h-4 w-4 text-gray-600" />
                      </div>
                  <div className="space-y-3 flex-1">
                    <div className="space-y-2">
                      <Label htmlFor="new-key-name">API Key Name</Label>
                      <Input
                        id="new-key-name"
                        placeholder="Enter a name for this API key"
                        value={newKeyForm.name}
                        onChange={(e) => {
                          setNewKeyForm({ ...newKeyForm, name: e.target.value })
                          // Clear error when user starts typing
                          if (newKeyFieldErrors.apiKeyName) {
                            setNewKeyFieldErrors(prev => ({ ...prev, apiKeyName: '' }))
                          }
                        }}
                        error={newKeyFieldErrors.apiKeyName}
                        disabled={isValidatingNewKey}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-key-value">API Key</Label>
                      <Input
                        id="new-key-value"
                        type="password"
                        placeholder="Enter your API key"
                        value={newKeyForm.key}
                        onChange={(e) => {
                          setNewKeyForm({ ...newKeyForm, key: e.target.value })
                          // Clear error when user starts typing
                          if (newKeyFieldErrors.apiKeyValue) {
                            setNewKeyFieldErrors(prev => ({ ...prev, apiKeyValue: '' }))
                          }
                        }}
                        error={newKeyFieldErrors.apiKeyValue}
                        disabled={isValidatingNewKey}
                      />
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelAddNewKey}
                      disabled={isValidatingNewKey}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Success Status */}
                  {newKeyValidationStatus === 'success' && (
                    <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-[0.8125rem]  text-green-800">API key added successfully!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmDialog.open} onOpenChange={(open) => {
        if (!open) {
          cancelDeleteKey()
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the API key "{deleteConfirmDialog.keyName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteKey}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteKey}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ViewEditSheet>
  )
}
