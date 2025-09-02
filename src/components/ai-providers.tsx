import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Key, CheckCircle, XCircle, Eye, EyeOff, Trash2, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { APIKeyStorage } from '@/lib/secure-storage'

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

  const handleAddProvider = async () => {
    if (!newProvider.name.trim() || !newProvider.apiKey.trim()) {
      setValidationError('Please fill in all fields')
      return
    }

    if (!newProvider.apiKey.startsWith('sk-')) {
      setValidationError('OpenAI API keys must start with "sk-"')
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

        // Fetch models for the new provider
        try {
          const models = await fetchModelsForProvider(provider)
          provider.models = models
          provider.modelsLastFetched = new Date().toLocaleString()
        } catch (error) {
          console.error('Failed to fetch models for new provider:', error)
          // Provider is still valid even if models can't be fetched
        }

        const updatedProviders = [...providers, provider]
        setProviders(updatedProviders)
        
        // Save to secure storage
        APIKeyStorage.saveProviders(updatedProviders)
        
        setNewProvider({ name: '', apiKey: '' })
        setIsAddingProvider(false)
        setShowApiKey(false)
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
          <span className="text-green-600 font-bold text-sm">O</span>
        </div>
      default:
        return <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-gray-600 font-bold text-sm">?</span>
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
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Providers</h1>
            <p className="text-muted-foreground">
              Manage your AI service providers and API keys securely
            </p>
          </div>
          <Sheet open={isAddingProvider} onOpenChange={setIsAddingProvider}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
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
                      onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
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

                {validationError && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {validationError}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddProvider}
                    disabled={isValidating}
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Providers</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{providers.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Providers</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {providers.filter(p => p.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Text Models</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">🤖</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {providers.reduce((sum, p) => sum + (p.models?.length || 0), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Added</CardTitle>
              <div className="h-4 w-4 text-muted-foreground">🕒</div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {providers.length > 0 ? providers[providers.length - 1].createdAt : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Providers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Provider List</CardTitle>
            <CardDescription>
              Manage your AI service providers and monitor their usage. Click the chevron to expand and view available text models.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {providers.map((provider) => (
                  <>
                    {/* Provider Row */}
                    <TableRow key={provider.id} className="hover:bg-muted/50">
                      <TableCell>
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
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(provider.type)}
                          <div>
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-muted-foreground">ID: {provider.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{provider.type}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(provider.status)}
                      </TableCell>
                      <TableCell>
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
                      <TableCell>{provider.createdAt}</TableCell>
                      <TableCell>
                        {provider.lastUsed || 'Never'}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono">
                          {provider.usageCount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!provider.models && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFetchModels(provider.id)}
                              disabled={fetchingModels === provider.id}
                              className="h-8 px-2"
                            >
                              {fetchingModels === provider.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                              <span className="ml-1 text-xs">Fetch Text Models</span>
                            </Button>
                          )}
                          {provider.models && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFetchModels(provider.id)}
                              disabled={fetchingModels === provider.id}
                              className="h-8 px-2"
                            >
                              {fetchingModels === provider.id ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                              <span className="ml-1 text-xs">Refresh Text Models</span>
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Provider</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{provider.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProvider(provider.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                    
                    {/* Models Sub-rows */}
                    {provider.isExpanded && provider.models && (
                      <>
                        {/* Models Header Row */}
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={9}>
                            <div className="flex items-center justify-between py-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                  Available Text Models ({provider.models.length})
                                </span>
                                {provider.modelsLastFetched && (
                                  <span className="text-xs text-muted-foreground">
                                    Last updated: {provider.modelsLastFetched}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* Individual Model Rows */}
                        {provider.models.map((model) => (
                          <TableRow key={model.id} className="bg-muted/10">
                            <TableCell></TableCell>
                            <TableCell colSpan={8}>
                              <div className="flex items-center justify-between py-2">
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <div className="font-medium text-sm">{model.id}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Created: {formatModelDate(model.created)}
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Owned by: {model.owned_by}
                                  </div>
                                  {model.parent && (
                                    <div className="text-xs text-muted-foreground">
                                      Parent: {model.parent}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {model.object}
                                  </Badge>
                                  {model.root && (
                                    <Badge variant="secondary" className="text-xs">
                                      Root
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                    
                    {/* No Models Message */}
                    {provider.isExpanded && !provider.models && (
                      <TableRow className="bg-muted/10">
                        <TableCell colSpan={9}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
