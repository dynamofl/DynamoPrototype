/**
 * AI System Create Dialog component
 * Handles the creation of new AI systems with provider selection and model picking
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import { AISystemIcon } from '@/components/patterns'
import { ViewEditSheet } from '@/components/patterns'
import type { AISystemFormData, ProviderOption, APIKeyOption, AIModel } from '../types'
import { 
  getProvidersWithAPIKeys, 
  fetchModelsFromOpenAI, 
  createAndStoreAPIKey,
  formatModelDate
} from '../lib'

export interface AISystemCreateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAISystemCreated: (system: any) => void
}

export function AISystemCreateSheet({ 
  open, 
  onOpenChange, 
  onAISystemCreated 
}: AISystemCreateSheetProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'configure'>('select')
  const [selectedProvider, setSelectedProvider] = useState<ProviderOption | null>(null)
  const [selectedAPIKey, setSelectedAPIKey] = useState<APIKeyOption | null>(null)
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState<AISystemFormData>({
    name: '',
    provider: { id: '', name: '', type: '' },
    apiKey: { id: '', name: '', key: '' },
    selectedModel: '',
    availableModels: []
  })

  // New API key form (when creating a new API key)
  const [newAPIKey, setNewAPIKey] = useState({
    name: '',
    key: '',
    showKey: false
  })

  // Available providers with API keys
  const [providers, setProviders] = useState<ProviderOption[]>([])

  // Load providers when dialog opens
  useEffect(() => {
    if (open) {
      loadProviders()
    }
  }, [open])

  const loadProviders = async () => {
    try {
      const providersWithKeys = await getProvidersWithAPIKeys()
      setProviders(providersWithKeys)
    } catch (error) {
      console.error('Failed to load providers:', error)
    }
  }

  const handleProviderSelect = (provider: ProviderOption) => {
    setSelectedProvider(provider)
    setCurrentStep('configure')
    setSelectedAPIKey(null)
    setAvailableModels([])
    setSelectedModel('')
    setValidationError('')
    
    setFormData(prev => ({
      ...prev,
      provider: {
        id: provider.id,
        name: provider.name,
        type: provider.type
      }
    }))
  }

  const handleAPIKeySelect = async (apiKey: APIKeyOption) => {
    setSelectedAPIKey(apiKey)
    setAvailableModels([])
    setSelectedModel('')
    setIsFetchingModels(true)
    
    setFormData(prev => ({
      ...prev,
      apiKey: {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key
      }
    }))

    try {
      const models = await fetchModelsFromOpenAI(apiKey.key)
      setAvailableModels(models)
    } catch (error) {
      console.error('Failed to fetch models:', error)
      setValidationError('Failed to fetch models. Please check your API key.')
    } finally {
      setIsFetchingModels(false)
    }
  }

  const handleCreateNewAPIKey = async () => {
    if (!newAPIKey.name.trim() || !newAPIKey.key.trim()) {
      setValidationError('Please fill in API key name and key')
      return
    }

    if (!newAPIKey.key.startsWith('sk-')) {
      setValidationError('OpenAI API keys must start with "sk-"')
      return
    }

    setIsValidating(true)
    setValidationError('')

    try {
      const result = await createAndStoreAPIKey(
        selectedProvider!.type,
        newAPIKey.name.trim(),
        newAPIKey.key.trim()
      )

      if (result.success) {
        // Reload providers to get the new API key
        await loadProviders()
        
        // Find the newly created API key
        const updatedProviders = await getProvidersWithAPIKeys()
        const updatedProvider = updatedProviders.find(p => p.id === selectedProvider!.id)
        const newAPIKeyOption = updatedProvider?.apiKeys.find(ak => ak.name === newAPIKey.name.trim())
        
        if (newAPIKeyOption) {
          await handleAPIKeySelect(newAPIKeyOption)
        }
        
        // Reset new API key form
        setNewAPIKey({ name: '', key: '', showKey: false })
      } else {
        setValidationError(result.error || 'Failed to create API key')
      }
    } catch (error) {
      setValidationError('Failed to create API key. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleBackToSelection = () => {
    setCurrentStep('select')
    setSelectedProvider(null)
    setSelectedAPIKey(null)
    setAvailableModels([])
    setSelectedModel('')
    setValidationError('')
    setNewAPIKey({ name: '', key: '', showKey: false })
  }

  const resetDialogState = () => {
    setCurrentStep('select')
    setSelectedProvider(null)
    setSelectedAPIKey(null)
    setAvailableModels([])
    setSelectedModel('')
    setValidationError('')
    setNewAPIKey({ name: '', key: '', showKey: false })
    setFormData({
      name: '',
      provider: { id: '', name: '', type: '' },
      apiKey: { id: '', name: '', key: '' },
      selectedModel: '',
      availableModels: []
    })
  }

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      resetDialogState()
    }
  }

  const handleCreateAISystem = () => {
    if (!formData.name.trim()) {
      setValidationError('Please fill in the system name')
      return
    }

    if (!selectedAPIKey) {
      setValidationError('Please select an API key')
      return
    }

    if (!selectedModel) {
      setValidationError('Please select a model')
      return
    }

    const selectedModelDetails = availableModels.find(m => m.id === selectedModel)
    
    const newSystem = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      createdAt: new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      status: 'active' as const,
      icon: selectedProvider!.type as any,
      hasGuardrails: false,
      isEvaluated: false,
      providerId: selectedProvider!.id,
      providerName: selectedProvider!.name,
      apiKeyId: selectedAPIKey.id,
      apiKeyName: selectedAPIKey.name,
      selectedModel: selectedModel,
      modelDetails: selectedModelDetails,
      isExpanded: false
    }

    onAISystemCreated(newSystem)
    handleDialogOpenChange(false)
  }

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={handleDialogOpenChange}
      title={currentStep === 'select' ? 'Add AI System' : `Configure ${selectedProvider?.name}`}
      size="lg"
      footer={currentStep === 'configure' ? (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBackToSelection}
            disabled={isValidating}
          >
            Back
          </Button>
          <Button
            onClick={handleCreateAISystem}
            disabled={!selectedAPIKey || !selectedModel || !formData.name.trim()}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Create AI System
          </Button>
        </div>
      ) : undefined}
    >
      {currentStep === 'select' ? (
        // Provider Selection Screen
        <div className="space-y-4">
          <div className="text-center py-4">
            <h3 className="text-lg font-450 text-[#192c4b] mb-2">Choose AI Provider</h3>
            <p className="text-sm text-[#4b5976]">Select the AI service provider for your new system</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => handleProviderSelect(provider)}
                className="p-3 border rounded-lg cursor-pointer transition-all border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex items-start space-x-3">
                  <AISystemIcon type={provider.icon as any} className="w-6 h-6 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-450 text-[#192c4b]">{provider.name}</h4>
                      {provider.hasApiKeys && (
                        <Badge variant="secondary" className="text-xs">
                          {provider.apiKeys.length} API Key{provider.apiKeys.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#4b5976] mt-1">
                      {provider.hasApiKeys 
                        ? `${provider.apiKeys.length} API key${provider.apiKeys.length !== 1 ? 's' : ''} available`
                        : 'No API keys configured'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Configuration Screen
        <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="space-y-6">
            <div className="text-center py-4 border-b border-gray-100">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <AISystemIcon type={selectedProvider!.icon as any} className="w-6 h-6" />
                <h3 className="text-lg font-450 text-[#192c4b]">Configure {selectedProvider!.name}</h3>
              </div>
              <p className="text-sm text-[#4b5976]">Enter system details and select API key and model</p>
            </div>

            <div className="space-y-6">
            {/* System Details */}
            <div className="border border-gray-200 rounded-lg">
              <div className="p-3 border-b border-gray-100 bg-gray-50">
                <h4 className="text-sm font-450 text-gray-900">System Details</h4>
                <p className="text-xs text-gray-600 mt-1">Basic information about your AI system</p>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  <Label htmlFor="system-name" className="text-xs font-450 text-gray-700">System Name *</Label>
                  <Input
                    id="system-name"
                    placeholder="e.g., Production Chatbot, Dev Assistant"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* API Key Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-450 text-gray-900">API Key *</Label>
              {selectedProvider!.hasApiKeys ? (
                <div className="space-y-3">
                  {/* Available API Keys List */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <h4 className="text-sm font-450 text-gray-900">Available API Keys</h4>
                      <p className="text-xs text-gray-600 mt-1">Select an API key to use for this system</p>
                    </div>
                    <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                      {selectedProvider!.apiKeys.map((apiKey) => (
                        <div
                          key={apiKey.id}
                          onClick={() => handleAPIKeySelect(apiKey)}
                          className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                            selectedAPIKey?.id === apiKey.id
                              ? 'bg-blue-50 border-l-4 border-l-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-450 text-sm text-gray-900">{apiKey.name}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {apiKey.key.substring(0, 12)}...{apiKey.key.substring(apiKey.key.length - 4)}
                              </div>
                            </div>
                            {selectedAPIKey?.id === apiKey.id && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Create New API Key Section */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-3 border-b border-gray-100 bg-gray-50">
                      <h4 className="text-sm font-450 text-gray-900">Create New API Key</h4>
                      <p className="text-xs text-gray-600 mt-1">Add a new API key for this provider</p>
                    </div>
                    <div className="p-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="new-api-key-name" className="text-xs font-450 text-gray-700">API Key Name</Label>
                          <Input
                            id="new-api-key-name"
                            placeholder="e.g., Production Key, Dev Key"
                            value={newAPIKey.name}
                            onChange={(e) => setNewAPIKey(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="new-api-key-value" className="text-xs font-450 text-gray-700">API Key</Label>
                          <div className="relative mt-1">
                            <Input
                              id="new-api-key-value"
                              type={newAPIKey.showKey ? "text" : "password"}
                              placeholder="sk-..."
                              value={newAPIKey.key}
                              onChange={(e) => setNewAPIKey(prev => ({ ...prev, key: e.target.value }))}
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => setNewAPIKey(prev => ({ ...prev, showKey: !prev.showKey }))}
                            >
                              {newAPIKey.showKey ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateNewAPIKey}
                        disabled={!newAPIKey.name.trim() || !newAPIKey.key.trim() || isValidating}
                        size="sm"
                        className="w-full"
                      >
                        {isValidating ? 'Creating...' : 'Create API Key'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <h4 className="text-sm font-450 text-gray-900">No API Keys Available</h4>
                    <p className="text-xs text-gray-600 mt-1">Create your first API key for this provider</p>
                  </div>
                  <div className="p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="new-api-key-name" className="text-xs font-450 text-gray-700">API Key Name</Label>
                        <Input
                          id="new-api-key-name"
                          placeholder="e.g., Production Key, Dev Key"
                          value={newAPIKey.name}
                          onChange={(e) => setNewAPIKey(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-api-key-value" className="text-xs font-450 text-gray-700">API Key</Label>
                        <div className="relative mt-1">
                          <Input
                            id="new-api-key-value"
                            type={newAPIKey.showKey ? "text" : "password"}
                            placeholder="sk-..."
                            value={newAPIKey.key}
                            onChange={(e) => setNewAPIKey(prev => ({ ...prev, key: e.target.value }))}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setNewAPIKey(prev => ({ ...prev, showKey: !prev.showKey }))}
                          >
                            {newAPIKey.showKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateNewAPIKey}
                      disabled={!newAPIKey.name.trim() || !newAPIKey.key.trim() || isValidating}
                      size="sm"
                      className="w-full"
                    >
                      {isValidating ? 'Creating...' : 'Create API Key'}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-450 text-gray-900">Model *</Label>
              
              {isFetchingModels ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                    <div>
                      <div className="text-sm font-450 text-gray-900">Fetching Models</div>
                      <div className="text-xs text-gray-600">Loading available models from OpenAI...</div>
                    </div>
                  </div>
                </div>
              ) : availableModels.length > 0 ? (
                <div className="border border-gray-200 rounded-lg">
                  <div className="p-3 border-b border-gray-100 bg-gray-50">
                    <h4 className="text-sm font-450 text-gray-900">Available Models</h4>
                    <p className="text-xs text-gray-600 mt-1">Select a model for your AI system</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {availableModels.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-3 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                          selectedModel === model.id
                            ? 'bg-blue-50 border-l-4 border-l-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-450 text-sm text-gray-900">{model.id}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Created: {formatModelDate(model.created)} • Owned by: {model.owned_by}
                            </div>
                          </div>
                          {selectedModel === model.id && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedModel && (
                    <div className="p-3 bg-blue-50 border-t border-blue-200">
                      <div className="text-xs text-blue-700">
                        <span className="font-450">Selected:</span> {selectedModel}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedAPIKey ? (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">No models available</div>
                    <div className="text-xs text-gray-400 mt-1">Please check your API key or try again</div>
                  </div>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Select an API key first</div>
                    <div className="text-xs text-gray-400 mt-1">Choose an API key to load available models</div>
                  </div>
                </div>
              )}
            </div>

            {validationError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {validationError}
              </div>
            )}
            </div>
          </div>
        </div>
      )}
    </ViewEditSheet>
  )
}