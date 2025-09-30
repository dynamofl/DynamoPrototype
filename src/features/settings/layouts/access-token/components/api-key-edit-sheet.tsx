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

export interface APIKeyEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  provider: TableRow | null
  storage: any // AccessTokenStorage instance
  onAPIKeyUpdated: (provider: TableRow, apiKey: string) => void
  onAPIKeyDeleted: (provider: TableRow) => void
}

// Provider-specific format validation
const getProviderFormatError = (provider: string, apiKey: string): string | null => {
  if (provider === "OpenAI" && !apiKey.startsWith("sk-")) {
    return 'OpenAI API keys must start with "sk-"';
  } else if (provider === "Anthropic" && !apiKey.startsWith("sk-ant-")) {
    return 'Anthropic API keys must start with "sk-ant-"';
  } else if (provider === "Azure OpenAI" && apiKey.length < 20) {
    return "Azure OpenAI API keys must be at least 20 characters long";
  } else if (provider === "Mistral" && apiKey.length < 30) {
    return "Mistral API keys must be at least 30 characters long";
  } else if (provider === "AWS Bedrock" && apiKey.length < 20) {
    return "AWS Bedrock API keys must be at least 20 characters long";
  } else if (provider === "Databricks" && apiKey.length < 20) {
    return "Databricks API keys must be at least 20 characters long";
  }
  return null;
};


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
  const [isAddingNewKey, setIsAddingNewKey] = useState(false)
  const [newKeyForm, setNewKeyForm] = useState({ name: '', key: '' })
  const [isValidatingNewKey, setIsValidatingNewKey] = useState(false)
  const [newKeyValidationStatus, setNewKeyValidationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
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
    if (provider && storage) {
      const loadKeys = async () => {
        const keys = await storage.getAPIKeys(provider.provider)
        setApiKeys(keys)
        setEditingKey(null)
        setValidationStatus('idle')
      }
      loadKeys()
    }
  }, [provider, storage])

  const _toggleKeyVisibility = (keyId: string) => {
    _setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const _handleEditKey = (key: { id: string; name: string; key: string }) => {
    setEditingKey({ ...key })
    setValidationStatus('idle')
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
    if (!provider || !storage || !deleteConfirmDialog.keyId) return
    
    await storage.deleteAPIKey(provider.provider, deleteConfirmDialog.keyId)
    setApiKeys(prev => prev.filter(k => k.id !== deleteConfirmDialog.keyId))
    if (editingKey?.id === deleteConfirmDialog.keyId) {
      setEditingKey(null)
    }
    onAPIKeyDeleted(provider)

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
  }

  const handleAddNewKey = () => {
    setIsAddingNewKey(true)
    setNewKeyForm({ name: '', key: '' })
    setNewKeyValidationStatus('idle')
    setNewKeyFieldErrors({ apiKeyName: '', apiKeyValue: '' })
  }

  const handleCancelAddNewKey = () => {
    // Only close add mode if there are existing API keys
    if (apiKeys.length > 0) {
      setIsAddingNewKey(false)
    }
    setNewKeyForm({ name: '', key: '' })
    setNewKeyValidationStatus('idle')
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

    // Provider-specific format validation
    const formatError = getProviderFormatError(provider.provider, newKeyForm.key.trim())
    if (formatError) {
      setNewKeyFieldErrors(prev => ({ ...prev, apiKeyValue: formatError }))
      return
    }

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
        
        // Reset form and close add mode (if there were existing keys)
        handleCancelAddNewKey()
        onAPIKeyUpdated(provider, newKeyForm.key.trim())
        
        // If there were no existing keys, close the sheet after successful creation
        if (apiKeys.length === 0) {
          // Small delay to show success message before closing
          setTimeout(() => {
            onOpenChange(false)
          }, 1000)
        }
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
    if (isAddingNewKey || (apiKeys.length === 0 && !isAddingNewKey)) {
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
              <p className="text-[13px] font-450 text-gray-900">
                {provider.provider}
              </p>
            </div>
          </div>
        </div>
        

        {/* API Keys List */}
        <div className="space-y-2">
          
          {apiKeys.length === 0 && !isAddingNewKey ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-key-name">API Key Name</Label>
                <Input
                  id="new-key-name"
                  placeholder="Enter a nickname for this API key"
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
                  required
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
                  required
                />
                <p className="text-xs text-gray-500">
                  Your API key will be encrypted and stored securely.
                </p>
              </div>

              {/* Validation Status */}
              {newKeyValidationStatus === "success" && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-[13px] text-green-800">
                    API key validated successfully!
                  </span>
                </div>
              )}

              {newKeyValidationStatus === "error" && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-[13px] text-red-800">
                    API key validation failed
                  </span>
                </div>
              )}
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

                      {/* Success Status */}
                      {validationStatus === 'success' && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-[13px] text-green-800">API key updated successfully!</span>
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
                          <div className="text-[13px] font-400 text-gray-900">{key.name}</div>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="text-[13px] font-400">
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
                      <span className="text-[13px] text-green-800">API key added successfully!</span>
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
