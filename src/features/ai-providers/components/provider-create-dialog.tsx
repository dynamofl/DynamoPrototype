/**
 * ProviderCreateDialog component for adding new AI providers
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Eye, EyeOff, RefreshCw } from 'lucide-react'
import { AISystemIcon } from '@/components/patterns'
import { CreateDialog } from '@/components/patterns'
import type { ProviderType, NewProvider, AIModel } from '../types'
import { availableProviderTypes } from '../constants'
import { formatModelDate, validateOpenAIKey, fetchModelsForNewProvider } from '../lib'

export interface ProviderCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProviderCreated: (provider: any) => void
}

export function ProviderCreateDialog({ 
  open, 
  onOpenChange, 
  onProviderCreated 
}: ProviderCreateDialogProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'configure'>('select')
  const [selectedProviderType, setSelectedProviderType] = useState<ProviderType | null>(null)
  const [newProvider, setNewProvider] = useState<NewProvider>({
    name: '',
    apiKey: ''
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [isFetchingModels, setIsFetchingModels] = useState(false)

  const handleApiKeyChange = async (apiKey: string) => {
    setNewProvider({ ...newProvider, apiKey })
    
    if (apiKey.startsWith('sk-') && apiKey.length > 20) {
      setIsFetchingModels(true)
      setAvailableModels([])
      setSelectedModels([])
      
      try {
        const models = await fetchModelsForNewProvider(apiKey)
        setAvailableModels(models)
        // Auto-select all models by default
        setSelectedModels(models.map(model => model.id))
      } catch (error) {
        console.error('Failed to fetch models:', error)
        setAvailableModels([])
        setSelectedModels([])
      } finally {
        setIsFetchingModels(false)
      }
    } else {
      setAvailableModels([])
      setSelectedModels([])
    }
  }

  const handleProviderTypeSelect = (providerType: ProviderType) => {
    if (!providerType.isAvailable) {
      return // Don't allow selection of unavailable providers
    }
    
    setSelectedProviderType(providerType)
    setCurrentStep('configure')
    setNewProvider({ name: '', apiKey: '' })
    setAvailableModels([])
    setSelectedModels([])
    setValidationError('')
  }

  const handleBackToSelection = () => {
    setCurrentStep('select')
    setSelectedProviderType(null)
    setNewProvider({ name: '', apiKey: '' })
    setAvailableModels([])
    setSelectedModels([])
    setValidationError('')
  }

  const resetDialogState = () => {
    setCurrentStep('select')
    setSelectedProviderType(null)
    setNewProvider({ name: '', apiKey: '' })
    setAvailableModels([])
    setSelectedModels([])
    setValidationError('')
    setShowApiKey(false)
  }

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      resetDialogState()
    }
  }

  const handleAddProvider = async () => {
    if (!selectedProviderType) {
      setValidationError('Please select a provider type')
      return
    }

    if (!newProvider.name.trim() || !newProvider.apiKey.trim()) {
      setValidationError('Please fill in all fields')
      return
    }

    if (selectedProviderType.type === 'OpenAI' && !newProvider.apiKey.startsWith('sk-')) {
      setValidationError('OpenAI API keys must start with "sk-"')
      return
    }

    if (selectedModels.length === 0) {
      setValidationError('Please select at least one model')
      return
    }

    setIsValidating(true)
    setValidationError('')

    try {
      const isValid = await validateOpenAIKey(newProvider.apiKey)
      
      if (isValid) {
        const provider = {
          id: Date.now().toString(),
          name: newProvider.name.trim(),
          type: selectedProviderType.type,
          apiKey: newProvider.apiKey,
          status: 'active' as const,
          createdAt: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          usageCount: 0,
          isExpanded: false,
          models: selectedModels.length > 0 
            ? availableModels.filter(model => selectedModels.includes(model.id))
            : [],
          modelsLastFetched: selectedModels.length > 0 ? new Date().toLocaleString() : undefined
        }

        onProviderCreated(provider)
        handleDialogOpenChange(false)
      } else {
        setValidationError('Invalid API key. Please check your key and try again.')
      }
    } catch (error) {
      setValidationError('Failed to validate API key. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <CreateDialog
      trigger={
        <Button size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          Add Provider
        </Button>
      }
      title={currentStep === 'select' ? 'Add AI Provider' : `Configure ${selectedProviderType?.name}`}
      description={currentStep === 'select' 
        ? 'Select an AI service provider to add to your system' 
        : `Configure your ${selectedProviderType?.name} provider with API key and model selection`
      }
      open={open}
      onOpenChange={handleDialogOpenChange}
      maxWidth="lg"
      showBackButton={currentStep === 'configure'}
      onBack={handleBackToSelection}
      actionFooter={currentStep === 'configure' ? (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handleBackToSelection}
            disabled={isValidating}
          >
            Back
          </Button>
          <Button
            onClick={handleAddProvider}
            disabled={isValidating || selectedModels.length === 0}
            className="bg-blue-600 text-[#ebf1fd] hover:bg-blue-700"
          >
            {isValidating ? 'Validating...' : 'Add Provider'}
          </Button>
        </div>
      ) : undefined}
    >
      {currentStep === 'select' ? (
        // Provider Selection Screen
        <div className="space-y-4">
          <div className="text-center py-4">
            <h3 className="text-lg font-450 text-[#192c4b] mb-2">Choose AI Provider</h3>
            <p className="text-sm text-[#4b5976]">Select the AI service provider you want to add</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {availableProviderTypes.map((providerType) => (
              <div
                key={providerType.id}
                onClick={() => handleProviderTypeSelect(providerType)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  providerType.isAvailable
                    ? 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <AISystemIcon type={providerType.icon} className="w-6 h-6 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-450 text-[#192c4b]">{providerType.name}</h4>
                      {!providerType.isAvailable && (
                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#4b5976] mt-1">{providerType.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Configuration Screen
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <AISystemIcon type={selectedProviderType!.icon} className="w-6 h-6" />
              <h3 className="text-lg font-450 text-[#192c4b]">Configure {selectedProviderType!.name}</h3>
            </div>
            <p className="text-sm text-[#4b5976]">Enter your API key and select models</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Provider Name</Label>
              <Input
                id="provider-name"
                placeholder="e.g., OpenAI Production, OpenAI Development"
                value={newProvider.name}
                onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showApiKey ? "text" : "password"}
                  placeholder="sk-..."
                  value={newProvider.apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your API key will be securely stored and encrypted. Text models will be fetched automatically.
              </p>
            </div>

            {/* Models Selection */}
            {isFetchingModels && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Fetching available models...</span>
                </div>
              </div>
            )}

            {availableModels.length > 0 && (
              <div className="space-y-2">
                <Label>Available Models ({availableModels.length})</Label>
                <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                  <div className="flex items-center space-x-2 pb-2 border-b">
                    <input
                      type="checkbox"
                      id="select-all-models"
                      checked={selectedModels.length === availableModels.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModels(availableModels.map(model => model.id))
                        } else {
                          setSelectedModels([])
                        }
                      }}
                      className="rounded"
                    />
                    <Label htmlFor="select-all-models" className="text-sm font-450 cursor-pointer">
                      Select All Models
                    </Label>
                  </div>
                  {availableModels.map((model) => (
                    <div key={model.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`model-${model.id}`}
                        checked={selectedModels.includes(model.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedModels([...selectedModels, model.id])
                          } else {
                            setSelectedModels(selectedModels.filter(id => id !== model.id))
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`model-${model.id}`} className="text-sm cursor-pointer flex-1">
                        <div className="font-450">{model.id}</div>
                        <div className="text-xs text-muted-foreground">
                          Created: {formatModelDate(model.created)}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedModels.length} of {availableModels.length} models selected
                </p>
              </div>
            )}

            {validationError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {validationError}
              </div>
            )}
          </div>
        </div>
      )}
    </CreateDialog>
  )
}
