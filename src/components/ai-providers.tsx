import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Eye, EyeOff, ChevronDown, ChevronRight, RefreshCw, Search, Filter, Download, MoreHorizontal } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { APIKeyStorage } from '@/lib/secure-storage'
import { cn } from '@/lib/utils'

interface AIModel {
  id: string
  object: string
  created: number
  owned_by: string
  permission: any[]
  root: string
  parent: string | null
  logging: any
}

interface AIProvider {
  id: string
  name: string
  type: 'OpenAI'
  apiKey: string
  status: 'active' | 'inactive' | 'testing'
  createdAt: string
  lastUsed?: string
  usageCount: number
  models?: AIModel[]
  modelsLastFetched?: string
  isExpanded?: boolean
}

interface StatCardProps {
  title: string
  value: number | string
  info?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
}

function StatCard({ title, value, info, variant = 'default' }: StatCardProps) {
  const getValueColor = () => {
    switch (variant) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-orange-600'
      case 'destructive': return 'text-red-600'
      default: return 'text-foreground'
    }
  }

  return (
    <Card className={cn("shadow-none bg-transparent")}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              {info ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-[13px] font-450 text-muted-foreground border-b border-dashed border-gray-300 hover:text-foreground transition-colors cursor-help">
                        {title}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{info}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <p className="text-[13px] font-450 text-muted-foreground border-b border-dashed border-gray-300">{title}</p>
              )}
            </div>
            <p className={cn("text-lg font-450", getValueColor())}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AIProviders() {
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [newProvider, setNewProvider] = useState({
    name: '',
    apiKey: ''
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [fetchingModels, setFetchingModels] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [isFetchingModels, setIsFetchingModels] = useState(false)
  const [isViewingProvider, setIsViewingProvider] = useState(false)
  const [isEditingProvider, setIsEditingProvider] = useState(false)
  const [viewingProvider, setViewingProvider] = useState<AIProvider | null>(null)
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null)
  const [editAvailableModels, setEditAvailableModels] = useState<AIModel[]>([])
  const [editSelectedModels, setEditSelectedModels] = useState<string[]>([])
  const [isEditFetchingModels, setIsEditFetchingModels] = useState(false)
  
  // Pagination
  const itemsPerPage = 20
  const totalPages = Math.ceil(providers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, providers.length)
  const currentProviders = providers.slice(startIndex, endIndex)

  // Load providers from secure storage on component mount
  useEffect(() => {
    const storedProviders = APIKeyStorage.loadProviders()
    if (storedProviders.length === 0) {
      // Add default provider if none exist
      const defaultProvider: AIProvider = {
        id: '1',
        name: 'OpenAI Production',
        type: 'OpenAI',
        apiKey: 'sk-...' + 'abc123'.slice(-4),
        status: 'active',
        createdAt: 'Jan 15, 2024',
        lastUsed: '2 hours ago',
        usageCount: 1247
      }
      setProviders([defaultProvider])
      APIKeyStorage.saveProviders([defaultProvider])
    } else {
      setProviders(storedProviders)
    }
  }, [])

  const validateOpenAIKey = async (apiKey: string): Promise<boolean> => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        return true
      } else if (response.status === 401) {
        throw new Error('Invalid API key')
      } else {
        throw new Error('API key validation failed')
      }
    } catch (error) {
      console.error('API key validation error:', error)
      return false
    }
  }

  const fetchModelsForNewProvider = async (apiKey: string): Promise<AIModel[]> => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const allModels = data.data || []
        
        // Filter to only include text models (exclude audio, image, and other non-text models)
        const textModels = allModels.filter((model: AIModel) => {
          // Include models that are typically used for text generation
          const textModelIds = [
            'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini',
            'gpt-3.5-turbo', 'gpt-3.5-turbo-instruct',
            'text-davinci-003', 'text-davinci-002', 'text-davinci-001',
            'text-curie-001', 'text-babbage-001', 'text-ada-001',
            'davinci', 'curie', 'babbage', 'ada',
            'claude-3', 'claude-3-sonnet', 'claude-3-haiku',
            'claude-2', 'claude-instant',
            'gemini-pro', 'gemini-pro-vision',
            'llama-2', 'llama-3', 'mistral', 'qwen'
          ]
          
          // Check if the model ID contains any of the text model identifiers
          return textModelIds.some(textId => 
            model.id.toLowerCase().includes(textId.toLowerCase())
          )
        })
        
        return textModels
      } else {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
      throw error
    }
  }

  const fetchModelsForProvider = async (provider: AIProvider): Promise<AIModel[]> => {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const allModels = data.data || []
        
        // Filter to only include text models (exclude audio, image, and other non-text models)
        const textModels = allModels.filter((model: AIModel) => {
          // Include models that are typically used for text generation
          const textModelIds = [
            'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini',
            'gpt-3.5-turbo', 'gpt-3.5-turbo-instruct',
            'text-davinci-003', 'text-davinci-002', 'text-davinci-001',
            'text-curie-001', 'text-babbage-001', 'text-ada-001',
            'davinci', 'curie', 'babbage', 'ada',
            'claude-3', 'claude-3-sonnet', 'claude-3-haiku',
            'claude-2', 'claude-instant',
            'gemini-pro', 'gemini-pro-vision',
            'llama-2', 'llama-3', 'mistral', 'qwen'
          ]
          
          // Check if the model ID contains any of the text model identifiers
          return textModelIds.some(textId => 
            model.id.toLowerCase().includes(textId.toLowerCase())
          )
        })
        
        return textModels
      } else {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to fetch models:', error)
      throw error
    }
  }

  const handleFetchModels = async (providerId: string) => {
    const provider = providers.find(p => p.id === providerId)
    if (!provider) return

    setFetchingModels(providerId)
    
    try {
      const models = await fetchModelsForProvider(provider)
      const updatedProviders = providers.map(p => {
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
      
      setProviders(updatedProviders)
      APIKeyStorage.saveProviders(updatedProviders)
    } catch (error) {
      console.error('Failed to fetch models for provider:', error)
      // You could show a toast notification here
    } finally {
      setFetchingModels(null)
    }
  }

  const toggleProviderExpansion = (providerId: string) => {
    const updatedProviders = providers.map(p => {
      if (p.id === providerId) {
        return { ...p, isExpanded: !p.isExpanded }
      }
      return p
    })
    setProviders(updatedProviders)
  }

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

  const handleAddProvider = async () => {
    if (!newProvider.name.trim() || !newProvider.apiKey.trim()) {
      setValidationError('Please fill in all fields')
      return
    }

    if (!newProvider.apiKey.startsWith('sk-')) {
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
        const provider: AIProvider = {
          id: Date.now().toString(),
          name: newProvider.name.trim(),
          type: 'OpenAI',
          apiKey: newProvider.apiKey,
          status: 'active',
          createdAt: new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }),
          usageCount: 0,
          isExpanded: false
        }

        // Use selected models for the new provider
        if (selectedModels.length > 0) {
          provider.models = availableModels.filter(model => selectedModels.includes(model.id))
          provider.modelsLastFetched = new Date().toLocaleString()
        }

        const updatedProviders = [...providers, provider]
        setProviders(updatedProviders)
        
        // Save to secure storage
        APIKeyStorage.saveProviders(updatedProviders)
        
        setNewProvider({ name: '', apiKey: '' })
        setIsAddingProvider(false)
        setShowApiKey(false)
        setAvailableModels([])
        setSelectedModels([])
      } else {
        setValidationError('Invalid API key. Please check your key and try again.')
      }
    } catch (error) {
      setValidationError('Failed to validate API key. Please try again.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleDeleteProvider = (id: string) => {
    const updatedProviders = providers.filter(provider => provider.id !== id)
    setProviders(updatedProviders)
    
    // Update secure storage
    APIKeyStorage.deleteProvider(id)
  }

  const handleViewProvider = (provider: AIProvider) => {
    setViewingProvider(provider)
    setIsViewingProvider(true)
  }

  const handleEditProvider = (provider: AIProvider) => {
    setEditingProvider(provider)
    setIsEditingProvider(true)
    // Initialize edit models state with current provider's models
    setEditAvailableModels(provider.models || [])
    setEditSelectedModels(provider.models?.map(model => model.id) || [])
  }

  const handleEditFetchModels = async () => {
    if (!editingProvider) return

    setIsEditFetchingModels(true)
    
    try {
      const models = await fetchModelsForProvider(editingProvider)
      setEditAvailableModels(models)
      // Keep previously selected models selected, but add any new ones as unselected
      const currentSelectedIds = editingProvider.models?.map(model => model.id) || []
      const newSelectedIds = models.filter(model => currentSelectedIds.includes(model.id)).map(model => model.id)
      setEditSelectedModels(newSelectedIds)
    } catch (error) {
      console.error('Failed to fetch models for editing:', error)
      // Keep existing models if fetch fails
    } finally {
      setIsEditFetchingModels(false)
    }
  }

  const handleUpdateProvider = async () => {
    if (!editingProvider) return

    if (!editingProvider.name.trim()) {
      setValidationError('Provider name is required')
      return
    }

    setIsValidating(true)
    setValidationError('')

    try {
              const updatedProviders = providers.map(p => {
          if (p.id === editingProvider.id) {
            return {
              ...p,
              name: editingProvider.name.trim(),
              status: editingProvider.status,
              models: editAvailableModels.filter(model => editSelectedModels.includes(model.id)),
              modelsLastFetched: editAvailableModels.length > 0 ? new Date().toLocaleString() : p.modelsLastFetched
            }
          }
          return p
        })

      setProviders(updatedProviders)
      APIKeyStorage.saveProviders(updatedProviders)
      
      setEditingProvider(null)
      setIsEditingProvider(false)
      setIsValidating(false)
      setValidationError('')
    } catch (error) {
      setValidationError('Failed to update provider. Please try again.')
      setIsValidating(false)
    }
  }

  const getStatusBadge = (status: AIProvider['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'testing':
        return <Badge variant="outline">Testing</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getTypeIcon = (type: AIProvider['type']) => {
    switch (type) {
      case 'OpenAI':
        return <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-green-600 font-450 text-sm">O</span>
        </div>
      default:
        return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-450 text-sm">?</span>
        </div>
    }
  }

  const formatModelDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto">
        <div className="space-y-4">
          {/* Page Header */}
          <div className="px-6">
            <div className="flex items-center justify-between my-4">
              <h1 className="text-lg font-450 tracking-tight">AI Providers</h1>
              <Sheet open={isAddingProvider} onOpenChange={setIsAddingProvider}>
                <SheetTrigger asChild>
                  <Button size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="mr-1 h-4 w-4" />
                    Add Provider
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Add AI Provider</SheetTitle>
                    <SheetDescription>
                      Add a new AI service provider. Currently supporting OpenAI.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="space-y-4 mt-6">
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

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleAddProvider}
                        disabled={isValidating || selectedModels.length === 0}
                        className="flex-1"
                      >
                        {isValidating ? 'Validating...' : 'Add Provider'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddingProvider(false)}
                        disabled={isValidating}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* View Provider Sheet */}
              <Sheet open={isViewingProvider} onOpenChange={setIsViewingProvider}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Provider Details</SheetTitle>
                    <SheetDescription>
                      View detailed information about this AI service provider.
                    </SheetDescription>
                  </SheetHeader>
                  {viewingProvider && (
                    <div className="space-y-6 mt-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-450 text-muted-foreground">Provider Name</Label>
                          <p className="text-sm">{viewingProvider.name}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-450 text-muted-foreground">Type</Label>
                          <Badge variant="outline">{viewingProvider.type}</Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-450 text-muted-foreground">Status</Label>
                          {getStatusBadge(viewingProvider.status)}
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-450 text-muted-foreground">API Key</Label>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                              {viewingProvider.apiKey.slice(0, 7)}...{viewingProvider.apiKey.slice(-4)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey(!showApiKey)}
                            >
                              {showApiKey ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          {showApiKey && (
                            <p className="font-mono text-sm bg-muted px-2 py-1 rounded mt-2">
                              {viewingProvider.apiKey}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-450 text-muted-foreground">Created</Label>
                          <p className="text-sm">{viewingProvider.createdAt}</p>
                        </div>
                        
                        {viewingProvider.lastUsed && (
                          <div className="space-y-2">
                            <Label className="text-sm font-450 text-muted-foreground">Last Used</Label>
                            <p className="text-sm">{viewingProvider.lastUsed}</p>
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-450 text-muted-foreground">Usage Count</Label>
                          <p className="text-sm">{viewingProvider.usageCount}</p>
                        </div>
                      </div>

                      {viewingProvider.models && viewingProvider.models.length > 0 && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm font-450 text-muted-foreground">
                              Available Models ({viewingProvider.models.length})
                            </Label>
                            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                              {viewingProvider.models
                                .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                                .map((model) => (
                                <div key={model.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                  <div>
                                    <div className="font-450 text-sm">{model.id}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Created: {formatModelDate(model.created)}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {model.object}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                            {viewingProvider.modelsLastFetched && (
                              <p className="text-xs text-muted-foreground">
                                Last updated: {viewingProvider.modelsLastFetched}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsViewingProvider(false)}
                          className="flex-1"
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => {
                            setIsViewingProvider(false)
                            handleEditProvider(viewingProvider)
                          }}
                          className="flex-1"
                        >
                          Edit Provider
                        </Button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>

              {/* Edit Provider Sheet */}
              <Sheet open={isEditingProvider} onOpenChange={setIsEditingProvider}>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Edit AI Provider</SheetTitle>
                    <SheetDescription>
                      Modify the settings for this AI service provider.
                    </SheetDescription>
                  </SheetHeader>
                  {editingProvider && (
                    <div className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="edit-provider-name">Provider Name</Label>
                        <Input
                          id="edit-provider-name"
                          placeholder="e.g., OpenAI Production, OpenAI Development"
                          value={editingProvider.name}
                          onChange={(e) => setEditingProvider({ ...editingProvider, name: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-provider-status">Status</Label>
                        <Select
                          value={editingProvider.status}
                          onValueChange={(value) => setEditingProvider({ ...editingProvider, status: value as AIProvider['status'] })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="testing">Testing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Models Management */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-450">Models Management</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditFetchModels}
                            disabled={isEditFetchingModels}
                          >
                            {isEditFetchingModels ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                Fetching...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Fetch All Models
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Current Models Display */}
                        {editingProvider.models && editingProvider.models.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Currently Selected Models ({editingProvider.models.length})
                            </Label>
                            <div className="max-h-32 overflow-y-auto border rounded-md p-3 space-y-2">
                              {editingProvider.models
                                .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                                .map((model) => (
                                <div key={model.id} className="flex items-center justify-between py-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div>
                                      <div className="font-450 text-sm">{model.id}</div>
                                      <div className="text-xs text-muted-foreground">
                                        Created: {formatModelDate(model.created)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Available Models Selection */}
                        {editAvailableModels.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm text-muted-foreground">
                              Available Models ({editAvailableModels.length})
                            </Label>
                            <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                              <div className="flex items-center space-x-2 pb-2 border-b">
                                <input
                                  type="checkbox"
                                  id="edit-select-all-models"
                                  checked={editSelectedModels.length === editAvailableModels.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditSelectedModels(editAvailableModels.map(model => model.id))
                                    } else {
                                      setEditSelectedModels([])
                                    }
                                  }}
                                  className="rounded"
                                />
                                <Label htmlFor="edit-select-all-models" className="text-sm font-450 cursor-pointer">
                                  Select All Models
                                </Label>
                              </div>
                              {editAvailableModels
                                .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                                .map((model) => {
                                  const isCurrentlySelected = editingProvider.models?.some(m => m.id === model.id)
                                  return (
                                    <div key={model.id} className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        id={`edit-model-${model.id}`}
                                        checked={editSelectedModels.includes(model.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setEditSelectedModels([...editSelectedModels, model.id])
                                          } else {
                                            setEditSelectedModels(editSelectedModels.filter(id => id !== model.id))
                                          }
                                        }}
                                        className="rounded"
                                      />
                                      <Label htmlFor={`edit-model-${model.id}`} className="text-sm cursor-pointer flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-450">{model.id}</span>
                                          {isCurrentlySelected && (
                                            <Badge variant="secondary" className="text-xs">
                                              Current
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Created: {formatModelDate(model.created)}
                                        </div>
                                      </Label>
                                    </div>
                                  )
                                })}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {editSelectedModels.length} of {editAvailableModels.length} models selected
                            </p>
                          </div>
                        )}

                        {editAvailableModels.length === 0 && editingProvider.models && editingProvider.models.length === 0 && (
                          <div className="text-center py-4 text-sm text-muted-foreground">
                            No models available. Click "Fetch All Models" to discover available models.
                          </div>
                        )}
                      </div>

                      {validationError && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                          {validationError}
                        </div>
                      )}

                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleUpdateProvider}
                          disabled={isValidating}
                          className="flex-1"
                        >
                          {isValidating ? 'Updating...' : 'Update Provider'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingProvider(false)
                            setEditingProvider(null)
                            setValidationError('')
                            setEditAvailableModels([])
                            setEditSelectedModels([])
                          }}
                          disabled={isValidating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
              <StatCard 
                title="Total Providers" 
                value={providers.length}
                info="Total number of AI service providers configured in your system. This includes all active, inactive, and testing providers."
                variant="default"
              />
              <StatCard 
                title="Active Providers" 
                value={providers.filter(p => p.status === 'active').length}
                info="AI service providers that are currently active and available for use. These providers have valid API keys and are ready to process requests."
                variant="success"
              />
              <StatCard 
                title="Total Text Models" 
                value={providers.reduce((sum, p) => sum + (p.models?.length || 0), 0)}
                info="Total number of text generation models available across all providers. These models can be used for various AI tasks and evaluations."
                variant="default"
              />
              <StatCard 
                title="Last Added" 
                value={providers.length > 0 ? providers[providers.length - 1].createdAt : 'N/A'}
                info="Date when the most recent AI provider was added to your system. Keep track of when new providers were configured."
                variant="default"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center justify-between px-6">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search AI providers..."
                  className="pl-8 w-[300px]"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Edit Columns
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="border-t border-b">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="pl-6 w-12"></TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Available Models</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead className="pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProviders.map((provider) => (
                  <>
                    {/* Provider Row */}
                    <TableRow key={provider.id}>
                      <TableCell className="font-450">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleProviderExpansion(provider.id)}
                            className="h-6 w-6 p-0"
                          >
                            {provider.isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-450">
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(provider.type)}
                          <span className="text-[13px] font-450 hover:underline cursor-pointer">{provider.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="outline">{provider.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {getStatusBadge(provider.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <span className="font-450">
                            {provider.models ? provider.models.length : 0}
                          </span>
                          {provider.models && provider.models.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {provider.models.length} model{provider.models.length !== 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {provider.modelsLastFetched ? (
                          <span className="text-xs">
                            {provider.modelsLastFetched}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Never
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-sm">
                            {provider.apiKey.slice(0, 7)}...{provider.apiKey.slice(-4)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowApiKey(!showApiKey)}
                          >
                            {showApiKey ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewProvider(provider)}
                          >
                            View
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProvider(provider)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditProvider(provider)}>
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleFetchModels(provider.id)}>
                                {fetchingModels === provider.id ? 'Fetching...' : 'Fetch Models'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteProvider(provider.id)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Models Sub-rows */}
                    {provider.isExpanded && provider.models && (
                      <>
                        {/* Models Header Row */}
                   
                        
                        {/* Individual Model Rows */}
                        {provider.models
                          .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
                          .map((model) => (
                          <TableRow key={model.id} className="bg-muted/10">
                            <TableCell></TableCell>
                            <TableCell colSpan={7}>
                              <div className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center space-x-2">
                                    <div className="font-450 text-sm">{model.id}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Created: {formatModelDate(model.created)}
                                    </div>
                                  </div>
                                  {/* <div className="text-xs text-muted-foreground">
                                    Owned by: {model.owned_by}
                                  </div>
                                  {model.parent && (
                                    <div className="text-xs text-muted-foreground">
                                      Parent: {model.parent}
                                    </div>
                                  )} */}
                                </div>
                                {/* <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {model.object}
                                  </Badge>
                                  {model.root && (
                                    <Badge variant="secondary" className="text-xs">
                                      Root
                                    </Badge>
                                  )}
                                </div> */}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                    
                    {/* No Models Message */}
                    {provider.isExpanded && !provider.models && (
                      <TableRow className="bg-muted/10">
                        <TableCell colSpan={8}>
                          <div className="flex items-center justify-center py-8">
                            <div className="text-center">
                              <div className="text-muted-foreground mb-2">
                                No text models fetched yet
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleFetchModels(provider.id)}
                                disabled={fetchingModels === provider.id}
                              >
                                {fetchingModels === provider.id ? (
                                  <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                ) : (
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                )}
                                Fetch Text Models
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6">
            <p className="text-[13px] text-muted-foreground">
              Rows per page: 20
            </p>
            <div className="flex items-center space-x-2">
              <p className="text-[13px] text-muted-foreground">
                {startIndex + 1} - {endIndex} of {providers.length}
              </p>
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
