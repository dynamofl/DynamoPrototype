import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { AccessTokenStorage } from '@/features/settings/layouts/access-token/lib/access-token-storage'
import { KeyRound, Plus, Eye, EyeOff } from 'lucide-react'

export interface APIKeyAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerType: string
  selectedCount: number
  selectedSystems: Array<{
    id: string
    name: string
    config?: {
      apiKeyId?: string
      selectedApiKeyIds?: string[]
    }
  }>
  onConfirm: (selectedKeyIds: string[], primaryKeyId: string) => void
}

interface APIKey {
  id: string
  name: string
  key: string
  createdAt: string
}

export function APIKeyAssignmentDialog({
  open,
  onOpenChange,
  providerType,
  selectedCount,
  selectedSystems,
  onConfirm
}: APIKeyAssignmentDialogProps) {
  const [selectedApiKeyIds, setSelectedApiKeyIds] = useState<string[]>([])
  const [primaryKeyId, setPrimaryKeyId] = useState<string>('')
  const [availableApiKeys, setAvailableApiKeys] = useState<APIKey[]>([])
  const [showAddKeyForm, setShowAddKeyForm] = useState(false)
  const [newAPIKey, setNewAPIKey] = useState({
    name: '',
    key: '',
    showKey: false
  })
  const [fieldErrors, setFieldErrors] = useState({
    apiKeyName: '',
    apiKeyValue: ''
  })
  const [isValidating, setIsValidating] = useState(false)
  const [hasSharedConfig, setHasSharedConfig] = useState(false)

  // Track original configuration to detect changes
  const [originalSelectedKeyIds, setOriginalSelectedKeyIds] = useState<string[]>([])
  const [originalPrimaryKeyId, setOriginalPrimaryKeyId] = useState<string>('')

  useEffect(() => {
    if (open) {
      // Load API keys for the specific provider type from AccessTokenStorage
      loadApiKeys()
      // Check for shared configuration
      checkSharedConfiguration()
      // Reset form state
      setShowAddKeyForm(false)
      setNewAPIKey({ name: '', key: '', showKey: false })
      setFieldErrors({ apiKeyName: '', apiKeyValue: '' })
    }
  }, [open, providerType, selectedSystems])

  const loadApiKeys = async () => {
    const storage = new AccessTokenStorage()
    const keys = await storage.getAPIKeys(providerType)
    setAvailableApiKeys(keys)
  }

  const checkSharedConfiguration = () => {
    // Check if all selected systems have the same API key configuration
    if (selectedSystems.length === 0) {
      setHasSharedConfig(false)
      setSelectedApiKeyIds([])
      setPrimaryKeyId('')
      setOriginalSelectedKeyIds([])
      setOriginalPrimaryKeyId('')
      return
    }

    // Get the first system's configuration
    const firstSystem = selectedSystems[0]
    const firstPrimaryKey = firstSystem.config?.apiKeyId
    const firstSelectedKeys = firstSystem.config?.selectedApiKeyIds || []

    // Check if all systems have the same configuration
    const allSame = selectedSystems.every(system => {
      const primaryKey = system.config?.apiKeyId
      const selectedKeys = system.config?.selectedApiKeyIds || []

      // Check if primary keys match
      const primaryMatches = primaryKey === firstPrimaryKey

      // Check if selected keys match (order doesn't matter)
      const selectedMatch =
        selectedKeys.length === firstSelectedKeys.length &&
        selectedKeys.every(key => firstSelectedKeys.includes(key))

      return primaryMatches && selectedMatch
    })

    if (allSame && firstPrimaryKey) {
      // Pre-select the shared configuration
      const keysToSelect = firstSelectedKeys.length > 0 ? firstSelectedKeys : [firstPrimaryKey]
      setHasSharedConfig(true)
      setSelectedApiKeyIds(keysToSelect)
      setPrimaryKeyId(firstPrimaryKey)

      // Store original configuration for change detection
      setOriginalSelectedKeyIds([...keysToSelect])
      setOriginalPrimaryKeyId(firstPrimaryKey)
    } else {
      setHasSharedConfig(false)
      setSelectedApiKeyIds([])
      setPrimaryKeyId('')
      setOriginalSelectedKeyIds([])
      setOriginalPrimaryKeyId('')
    }
  }

  // Check if current configuration differs from original
  const hasChanges = () => {
    // If there was no shared config initially, any selection is a change
    if (!hasSharedConfig) {
      return selectedApiKeyIds.length > 0 && primaryKeyId !== ''
    }

    // Check if primary key changed
    if (primaryKeyId !== originalPrimaryKeyId) {
      return true
    }

    // Check if selected keys changed (order doesn't matter)
    if (selectedApiKeyIds.length !== originalSelectedKeyIds.length) {
      return true
    }

    // Check if all keys match
    const allKeysMatch = selectedApiKeyIds.every(keyId =>
      originalSelectedKeyIds.includes(keyId)
    )

    return !allKeysMatch
  }

  const handleAPIKeyToggle = (keyId: string, checked: boolean) => {
    if (checked) {
      setSelectedApiKeyIds([...selectedApiKeyIds, keyId])
      // Auto-set as primary if it's the first selected key
      if (selectedApiKeyIds.length === 0) {
        setPrimaryKeyId(keyId)
      }
    } else {
      setSelectedApiKeyIds(selectedApiKeyIds.filter(id => id !== keyId))
      // Clear primary if this was the primary key
      if (primaryKeyId === keyId) {
        const remaining = selectedApiKeyIds.filter(id => id !== keyId)
        setPrimaryKeyId(remaining.length > 0 ? remaining[0] : '')
      }
    }
  }

  const handleSetPrimaryKey = (keyId: string) => {
    setPrimaryKeyId(keyId)
  }

  const handleCreateNewAPIKey = async () => {
    // Clear previous errors
    setFieldErrors({ apiKeyName: '', apiKeyValue: '' })

    // Validate inputs
    if (!newAPIKey.name.trim()) {
      setFieldErrors(prev => ({ ...prev, apiKeyName: 'API key name is required' }))
      return
    }

    if (!newAPIKey.key.trim()) {
      setFieldErrors(prev => ({ ...prev, apiKeyValue: 'API key value is required' }))
      return
    }

    setIsValidating(true)

    try {
      const storage = new AccessTokenStorage()
      const createdKey = await storage.addAPIKey(providerType, newAPIKey.name, newAPIKey.key)

      // Reload keys
      await loadApiKeys()

      // Auto-select the newly created key
      setSelectedApiKeyIds([...selectedApiKeyIds, createdKey.id])

      // Set as primary if it's the first key
      if (selectedApiKeyIds.length === 0) {
        setPrimaryKeyId(createdKey.id)
      }

      // Reset form
      setNewAPIKey({ name: '', key: '', showKey: false })
      setShowAddKeyForm(false)
    } catch (error) {
      setFieldErrors(prev => ({
        ...prev,
        apiKeyValue: 'Failed to create API key. Please try again.'
      }))
    } finally {
      setIsValidating(false)
    }
  }

  const handleConfirm = () => {
    if (selectedApiKeyIds.length === 0 || !primaryKeyId) return

    onConfirm(selectedApiKeyIds, primaryKeyId)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign API Keys</DialogTitle>
          <DialogDescription>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm text-gray-600">
              Select one or more API keys to assign to {selectedCount} selected {providerType} AI system{selectedCount > 1 ? 's' : ''}
            </div>
           
          </div>

          {/* API Key Selection */}
          <div className="space-y-2">
            <Label>API Keys</Label>
            {availableApiKeys.length === 0 && !showAddKeyForm ? (
              <div className="space-y-3">
                <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                  <KeyRound className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-450">No API Keys Available for {providerType}</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">
                    Add a new API key to get started
                  </p>
                </div>
                <div>
                  <Button
                    onClick={() => setShowAddKeyForm(true)}
                    variant="secondary"
                    size="default"
                    className="w-fit"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add New Key
                  </Button>
                </div>
              </div>
            ) : availableApiKeys.length > 0 ? (
              <div className="space-y-3">
                {/* Available API Keys List */}
                <div className="space-y-2">
                  {availableApiKeys.map((apiKey) => {
                    // Check if this key was in the original configuration
                    const isFromCurrentConfig = hasSharedConfig &&
                      (selectedSystems[0]?.config?.selectedApiKeyIds?.includes(apiKey.id) ||
                       selectedSystems[0]?.config?.apiKeyId === apiKey.id)

                    return (
                      <div
                        key={apiKey.id}
                        className={`flex space-x-3 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
                          isFromCurrentConfig ? 'border-gray-200 bg-gray-50/30' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex space-x-3 flex-1">
                          <KeyRound className="w-4 h-4 text-gray-500 mt-1.5" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={apiKey.id} className="font-450 text-[0.8125rem] text-gray-900 cursor-pointer">
                                {apiKey.name}
                              </Label>
                              {isFromCurrentConfig && (
                                <Badge variant="outline" className="text-[0.65rem] px-1 py-0 h-4">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {apiKey.key.substring(0, 4)}•••••••{apiKey.key.substring(apiKey.key.length - 2)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-start pt-0.5 space-x-3">
                          {selectedApiKeyIds.includes(apiKey.id) && (
                            <Button
                              onClick={() => handleSetPrimaryKey(apiKey.id)}
                              variant={primaryKeyId === apiKey.id ? "subtle" : "outline"}
                              size="sm"
                              className="text-xs"
                            >
                              {primaryKeyId === apiKey.id ? "Primary Key" : "Mark as Primary Key"}
                            </Button>
                          )}
                          <Checkbox
                            id={apiKey.id}
                            checked={selectedApiKeyIds.includes(apiKey.id)}
                            onCheckedChange={(checked: boolean) => handleAPIKeyToggle(apiKey.id, checked)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Add New Key Button/Form */}
                {!showAddKeyForm ? (
                  <div>
                    <Button
                      onClick={() => setShowAddKeyForm(true)}
                      variant="secondary"
                      size="default"
                      className="w-fit"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New Key
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Add New Key Form */}
            {showAddKeyForm && (
              <div className="space-y-3">
                <div className="flex space-x-3 px-3 py-2 border border-gray-200 rounded-lg">
                  <KeyRound className="w-4 h-4 text-gray-500 mt-1.5" />
                  <div className="grid grid-cols-1 gap-3 flex-1 pb-3">
                    <div>
                      <Label
                        htmlFor="new-api-key-name"
                        className="text-xs font-450 text-gray-600"
                      >
                        API Key Name
                      </Label>
                      <Input
                        id="new-api-key-name"
                        placeholder="e.g., Production Key, Dev Key"
                        value={newAPIKey.name}
                        onChange={(e) => {
                          setNewAPIKey({ ...newAPIKey, name: e.target.value })
                          if (fieldErrors.apiKeyName) {
                            setFieldErrors({ ...fieldErrors, apiKeyName: '' })
                          }
                        }}
                        error={fieldErrors.apiKeyName}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="new-api-key-value"
                        className="text-xs font-450 text-gray-600"
                      >
                        API Key
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id="new-api-key-value"
                          type={newAPIKey.showKey ? "text" : "password"}
                          placeholder="sk-..."
                          value={newAPIKey.key}
                          onChange={(e) => {
                            setNewAPIKey({ ...newAPIKey, key: e.target.value })
                            if (fieldErrors.apiKeyValue) {
                              setFieldErrors({ ...fieldErrors, apiKeyValue: '' })
                            }
                          }}
                          error={fieldErrors.apiKeyValue}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setNewAPIKey({ ...newAPIKey, showKey: !newAPIKey.showKey })}
                        >
                          {newAPIKey.showKey ? (
                            <Eye className="h-4 w-4" />
                          ) : (
                            <EyeOff className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="flex space-x-2 pt-2">
                      <Button
                        onClick={handleCreateNewAPIKey}
                        disabled={
                          !newAPIKey.name.trim() ||
                          !newAPIKey.key.trim() ||
                          isValidating
                        }
                        size="sm"
                        className="w-fit"
                      >
                        {isValidating ? "Validating..." : "Validate and Save"}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowAddKeyForm(false)
                          setNewAPIKey({ name: '', key: '', showKey: false })
                          setFieldErrors({ apiKeyName: '', apiKeyValue: '' })
                        }}
                        variant="outline"
                        size="sm"
                        className="w-fit"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {selectedApiKeyIds.length > 0 && !primaryKeyId && (
            <p className="text-xs text-amber-600">
              Please mark one key as primary
            </p>
          )}

          {hasSharedConfig && selectedApiKeyIds.length > 0 && primaryKeyId && !hasChanges() && (
            <p className="text-xs text-gray-500">
              No changes detected from current configuration
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedApiKeyIds.length === 0 || !primaryKeyId || !hasChanges()}
          >
            Assign to {selectedCount} System{selectedCount > 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
