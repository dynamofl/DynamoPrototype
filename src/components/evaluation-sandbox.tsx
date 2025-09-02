import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { Play, Save, Share, History, Settings, Code, Eye, AlertTriangle, CheckCircle, XCircle, Clock, Plus, X, Info, Trash2 } from 'lucide-react'
import { APIKeyStorage } from '@/lib/secure-storage'
import { runEvaluation, getAvailableModels } from '@/lib/evalRunner'
import type { EvaluationInput, EvaluationConfig, EvaluationResult, EvaluationPrompt } from '@/types/evaluation'
import type { Guardrail } from '@/types'
import { useGuardrails } from '@/lib/useGuardrails'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
// Define MetricToggles locally to avoid import issues
interface MetricToggles {
  accuracy: boolean;
  precision: boolean;
  recall: boolean;
}

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

export function EvaluationSandbox() {
  const [providers, setProviders] = useState<AIProvider[]>([])
  const [config, setConfig] = useState<EvaluationConfig>({
    candidateModel: '',
    judgeModel: '',
    temperature: 0.7,
    maxLength: 500,
    topP: 0.9
  })

  const [evaluationInput, setEvaluationInput] = useState<EvaluationInput>({
    prompts: [
      {
        id: crypto.randomUUID(),
        prompt: '',
        topic: '',
        userMarkedAdversarial: false
      }
    ]
  })

  const [metricsEnabled, setMetricsEnabled] = useState<MetricToggles>({
    accuracy: true,
    precision: true,
    recall: true
  })

  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("input")

  // Guardrail state
  const [selectedGuardrails, setSelectedGuardrails] = useState<Guardrail[]>([])
  const [isAddingGuardrail, setIsAddingGuardrail] = useState(false)
  
  // Use shared guardrails hook
  const { guardrails: availableGuardrails } = useGuardrails()

  // Load providers from secure storage on component mount
  useEffect(() => {
    const storedProviders = APIKeyStorage.loadProviders()
    setProviders(storedProviders)
  }, [])

  // Set default models when available models change
  useEffect(() => {
    const availableModels = getAvailableModels()
    if (availableModels.length > 0 && availableModels[0].id !== 'no-models') {
      // Set default models if not already set
      if (!config.candidateModel) {
        const candidateModel = availableModels.find(m => m.id.includes('gpt-4o-mini') || m.id.includes('gpt-3.5'))?.id || availableModels[0].id
        setConfig(prev => ({ ...prev, candidateModel }))
      }
      if (!config.judgeModel) {
        const judgeModel = availableModels.find(m => m.id.includes('gpt-4o') || m.id.includes('gpt-4'))?.id || availableModels[0].id
        setConfig(prev => ({ ...prev, judgeModel }))
      }
    }
  }, [providers, config.candidateModel, config.judgeModel])

  // Get available models for selection
  const availableModels = getAvailableModels()

  // Helper functions to manage prompts
  const addPrompt = () => {
    setEvaluationInput(prev => ({
      ...prev,
      prompts: [
        ...prev.prompts,
        {
          id: crypto.randomUUID(),
          prompt: '',
          topic: '',
          userMarkedAdversarial: false
        }
      ]
    }))
  }

  const removePrompt = (id: string) => {
    if (evaluationInput.prompts.length > 1) {
      setEvaluationInput(prev => ({
        ...prev,
        prompts: prev.prompts.filter(p => p.id !== id)
      }))
    }
  }

  const updatePrompt = (id: string, field: keyof EvaluationPrompt, value: string | boolean) => {
    setEvaluationInput(prev => ({
      ...prev,
      prompts: prev.prompts.map(p => 
        p.id === id ? { ...p, [field]: value } : p
      )
    }))
  }

  const handleSubmit = async () => {
    // Check if at least one prompt has content
    const hasValidPrompt = evaluationInput.prompts.some(p => p.prompt.trim())
    if (!hasValidPrompt) {
      setError('Please provide at least one prompt')
      return
    }

    // Check if models are available
    const availableModels = getAvailableModels()
    if (availableModels.length === 1 && availableModels[0].id === 'no-models') {
      setError('No AI models available. Please add AI providers and fetch their models first.')
      return
    }

    // Check if selected models exist
    const judgeModelExists = availableModels.some(m => m.id === config.judgeModel)
    const candidateModelExists = availableModels.some(m => m.id === config.candidateModel)
    
    if (!judgeModelExists || !candidateModelExists) {
      setError('Selected models not found. Please ensure you have added AI providers and fetched their models.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create enhanced config with guardrails
      const enhancedConfig = {
        ...config,
        guardrails: selectedGuardrails
      }
      
      const evaluationResult = await runEvaluation(
        evaluationInput,
        enhancedConfig,
        metricsEnabled
      )
      setResult(evaluationResult)
      setActiveTab("results")
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = () => {
    // Save configuration logic
    console.log('Saving configuration:', config)
  }

  const handleShare = () => {
    // Share logic
    console.log('Sharing configuration:', config)
  }

  // Guardrail management functions
  const addGuardrail = (guardrail: Guardrail) => {
    if (!selectedGuardrails.find(g => g.id === guardrail.id)) {
      setSelectedGuardrails([...selectedGuardrails, guardrail])
    }
    // Don't close the popover - let user select multiple guardrails
    // setIsAddingGuardrail(false)
  }

  const removeGuardrail = (guardrailId: string) => {
    setSelectedGuardrails(selectedGuardrails.filter(g => g.id !== guardrailId))
  }

  const getAvailableGuardrailsForSelection = () => {
    return availableGuardrails
      .filter((guardrail: Guardrail) => guardrail.status === 'active')
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evaluation Sandbox</h1>
            <p className="text-muted-foreground">
              Test and evaluate AI models with different configurations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration
                </CardTitle>
                <CardDescription>
                  Adjust model parameters and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Candidate Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="candidateModel">Candidate Model</Label>
                  <Select value={config.candidateModel} onValueChange={(value) => setConfig({ ...config, candidateModel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select candidate model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.length === 1 && availableModels[0].id === 'no-models' ? (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          {availableModels[0].name}
                        </div>
                      ) : (
                        availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id} disabled={model.id === 'no-models'}>
                            {model.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Judge Model Selection */}
                <div className="space-y-2">
                  <Label htmlFor="judgeModel">Judge Model</Label>
                  <Select value={config.judgeModel} onValueChange={(value) => setConfig({ ...config, judgeModel: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select judge model" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.length === 1 && availableModels[0].id === 'no-models' ? (
                        <div className="px-2 py-1.5 text-xs text-muted-foreground">
                          {availableModels[0].name}
                        </div>
                      ) : (
                        availableModels.map((model) => (
                          <SelectItem key={model.id} value={model.id} disabled={model.id === 'no-models'}>
                            {model.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Guardrail Selection */}
                <div className="space-y-3">
                  <Label>Guardrails</Label>
                  
              

                  {/* Add Guardrail Button */}
                  <Popover open={isAddingGuardrail} onOpenChange={setIsAddingGuardrail}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-between">
                        <span>Add Guardrails</span>
                        <div className="flex items-center space-x-1">
                          {selectedGuardrails.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {selectedGuardrails.length}
                            </Badge>
                          )}
                          <Plus className="h-4 w-4" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search guardrails..." />
                        <CommandList className="max-h-64">
                          <CommandGroup>
                            {getAvailableGuardrailsForSelection().length === 0 ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <p>No guardrails available</p>
                              </div>
                            ) : (
                              getAvailableGuardrailsForSelection().map((guardrail: Guardrail) => {
                                const isSelected = selectedGuardrails.some(g => g.id === guardrail.id);
                                return (
                                  <div
                                    key={guardrail.id}
                                    className={`flex items-center space-x-3 p-3 cursor-pointer rounded-md ${
                                      isSelected 
                                        ? 'bg-green-50 border border-green-200' 
                                        : 'hover:bg-accent'
                                    }`}
                                    onClick={() => {
                                      if (isSelected) {
                                        removeGuardrail(guardrail.id);
                                      } else {
                                        addGuardrail(guardrail);
                                      }
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className={`text-sm font-medium ${
                                          isSelected ? 'text-green-800' : ''
                                        }`}>
                                          {guardrail.name}
                                        </span>
                                        {guardrail.category && (
                                          <Badge variant="outline" className="text-xs shrink-0">
                                            {guardrail.category}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className={`text-xs line-clamp-2 ${
                                        isSelected ? 'text-green-700' : 'text-muted-foreground'
                                      }`}>
                                        {guardrail.description}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {isSelected ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </CommandGroup>
                        </CommandList>
                        {selectedGuardrails.length > 0 && (
                          <div className="p-3 border-t bg-muted/30">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>{selectedGuardrails.length} guardrail{selectedGuardrails.length !== 1 ? 's' : ''} selected</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setIsAddingGuardrail(false)}
                                className="h-7 px-2"
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>

 {/* Selected Guardrails */}
 {selectedGuardrails.length > 0 && (
                    <div className="space-y-2">
                      {selectedGuardrails.map((guardrail) => (
                        <div key={guardrail.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center space-x-2">
                            <Info className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{guardrail.name}</span>
                            {guardrail.category && (
                              <Badge variant="outline" className="text-xs">
                                {guardrail.category}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGuardrail(guardrail.id)}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </CardContent>
            </Card>

            {/* Hyperparameter Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Hyperparameter Settings
                </CardTitle>
                <CardDescription>
                  Fine-tune model generation parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Badge variant="secondary">{config.temperature}</Badge>
                  </div>
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.01"
                    value={config.temperature}
                    onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Focused</span>
                    <span>Creative</span>
                  </div>
                </div>

                {/* Maximum Length */}
                <div className="space-y-2">
                  <Label htmlFor="maxLength">Maximum Length</Label>
                  <Input
                    id="maxLength"
                    type="number"
                    min="1"
                    max="4000"
                    value={config.maxLength}
                    onChange={(e) => setConfig({ ...config, maxLength: parseInt(e.target.value) })}
                  />
                </div>

                {/* Top P */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="topP">Top P</Label>
                    <Badge variant="secondary">{config.topP}</Badge>
                  </div>
                  <Input
                    id="topP"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={config.topP}
                    onChange={(e) => setConfig({ ...config, topP: parseFloat(e.target.value) })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Metrics Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Metrics</CardTitle>
                <CardDescription>
                  Select which metrics to calculate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="accuracy">Accuracy</Label>
                  <Switch
                    id="accuracy"
                    checked={metricsEnabled.accuracy}
                    onCheckedChange={(checked) => setMetricsEnabled({ ...metricsEnabled, accuracy: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="precision">Precision</Label>
                  <Switch
                    id="precision"
                    checked={metricsEnabled.precision}
                    onCheckedChange={(checked) => setMetricsEnabled({ ...metricsEnabled, precision: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="recall">Recall</Label>
                  <Switch
                    id="recall"
                    checked={metricsEnabled.recall}
                    onCheckedChange={(checked) => setMetricsEnabled({ ...metricsEnabled, recall: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                                          disabled={isLoading || !evaluationInput.prompts.some(p => p.prompt.trim()) || availableModels.length === 1 && availableModels[0].id === 'no-models'}
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isLoading ? 'Generating...' : 'Submit'}
                </Button>
                
                {availableModels.length === 1 && availableModels[0].id === 'no-models' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      ⚠️ No AI models available. Please add AI providers in the AI Providers page and fetch their models first.
                    </p>
                  </div>
                )}
                <Button variant="outline" className="w-full">
                  <History className="mr-2 h-4 w-4" />
                  Show History
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {!result ? (
              // Show input form directly when no results
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Evaluation Input
                  </CardTitle>
                  <CardDescription>
                    Enter your prompt and evaluation parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Multiple Prompts Table */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Evaluation Prompts</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addPrompt}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Prompt
                      </Button>
                    </div>
                    
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Prompt</TableHead>
                            <TableHead className="w-[25%]">Topic (optional)</TableHead>
                            <TableHead className="w-[25%]">Adversarial</TableHead>
                            <TableHead className="w-[10%]">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {evaluationInput.prompts.map((prompt, index) => (
                            <TableRow key={prompt.id}>
                              <TableCell>
                                <Textarea
                                  placeholder="Enter the prompt you want to evaluate..."
                                  value={prompt.prompt}
                                  onChange={(e) => updatePrompt(prompt.id, 'prompt', e.target.value)}
                                  className="min-h-[80px] resize-none text-sm"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="e.g., Finance, Legal (leave empty for 'any')"
                                  value={prompt.topic}
                                  onChange={(e) => updatePrompt(prompt.id, 'topic', e.target.value)}
                                  className="text-sm"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    checked={prompt.userMarkedAdversarial}
                                    onCheckedChange={(checked) => updatePrompt(prompt.id, 'userMarkedAdversarial', checked)}
                                  />
                                  <span className="text-xs text-muted-foreground">
                                    {prompt.userMarkedAdversarial ? 'Blocked' : 'Passed'}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {evaluationInput.prompts.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removePrompt(prompt.id)}
                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Add multiple prompts to evaluate them together. Each prompt will be processed individually and results will be shown collectively.
                    </p>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {error}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              // Show tabs when results are available
              <Tabs defaultValue="input" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="input" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Input
                  </TabsTrigger>
                  <TabsTrigger value="results" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Results
                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                      ✓
                    </Badge>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="input">
                  {/* Input Form */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5" />
                        Evaluation Input
                      </CardTitle>
                      <CardDescription>
                        Enter your prompt and evaluation parameters
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Multiple Prompts Table */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Evaluation Prompts</Label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={addPrompt}
                            className="flex items-center gap-2"
                          >
                            <Plus className="h-4 w-4" />
                            Add Prompt
                          </Button>
                        </div>
                        
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[40%]">Prompt</TableHead>
                                <TableHead className="w-[25%]">Topic (optional)</TableHead>
                                <TableHead className="w-[25%]">Adversarial</TableHead>
                                <TableHead className="w-[10%]">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {evaluationInput.prompts.map((prompt, index) => (
                                <TableRow key={prompt.id}>
                                  <TableCell>
                                    <Textarea
                                      placeholder="Enter the prompt you want to evaluate..."
                                      value={prompt.prompt}
                                      onChange={(e) => updatePrompt(prompt.id, 'prompt', e.target.value)}
                                      className="min-h-[80px] resize-none text-sm"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      placeholder="e.g., Finance, Legal (leave empty for 'any')"
                                      value={prompt.topic}
                                      onChange={(e) => updatePrompt(prompt.id, 'topic', e.target.value)}
                                      className="text-sm"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Switch
                                        checked={prompt.userMarkedAdversarial}
                                        onCheckedChange={(checked) => updatePrompt(prompt.id, 'userMarkedAdversarial', checked)}
                                      />
                                      <span className="text-xs text-muted-foreground">
                                        {prompt.userMarkedAdversarial ? 'Blocked' : 'Passed'}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {evaluationInput.prompts.length > 1 && (
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removePrompt(prompt.id)}
                                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Add multiple prompts to evaluate them together. Each prompt will be processed individually and results will be shown collectively.
                        </p>
                      </div>

                                              {/* Error Display */}
                        {error && (
                          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                            <p className="text-sm text-destructive flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              {error}
                            </p>
                          </div>
                        )}

                                                {/* Response Evaluation Summary - Show in Input tab when results are available */}
                        {result && (
                          <>
                            <Separator />
                            <div className="space-y-3">
                              <h3 className="font-semibold text-lg">Evaluation Summary</h3>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm text-muted-foreground">Total Prompts</p>
                                  <p className="text-2xl font-bold">{result.overallMetrics.totalPrompts}</p>
                                </div>
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm text-muted-foreground">Blocked</p>
                                  <p className="text-2xl font-bold text-red-600">{result.overallMetrics.totalBlocked}</p>
                                </div>
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm text-muted-foreground">Passed</p>
                                  <p className="text-2xl font-bold text-green-600">{result.overallMetrics.totalPassed}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                                  <p className="text-2xl font-bold">{(result.overallMetrics.averageAccuracy * 100).toFixed(1)}%</p>
                                </div>
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm text-muted-foreground">Avg Precision</p>
                                  <p className="text-2xl font-bold">{(result.overallMetrics.averagePrecision * 100).toFixed(1)}%</p>
                                </div>
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm text-muted-foreground">Avg Recall</p>
                                  <p className="text-2xl font-bold">{(result.overallMetrics.averageRecall * 100).toFixed(1)}%</p>
                                </div>
                              </div>
                            </div>
                          </>
                        )}


                         {/* Applied Guardrails */}
                         {selectedGuardrails.length > 0 && (
                          <>
                            <Separator />
                            <div className="space-y-3">
                              <h3 className="font-semibold text-lg">Applied Guardrails</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedGuardrails.map((guardrail) => (
                                  <div key={guardrail.id} className="p-3 bg-muted rounded-md border">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-sm">{guardrail.name}</span>
                                          {guardrail.category && (
                                            <Badge variant="outline" className="text-xs">
                                              {guardrail.category}
                                            </Badge>
                                          )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          {guardrail.description}
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Badge variant="default" className="text-xs">
                                          Applied
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}



                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="results">
                    {/* Results */}
                    {isLoading && (
                      <Card>
                        <CardContent className="p-8">
                          <div className="flex items-center justify-center space-x-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <div>
                              <p className="font-medium">Running Evaluation...</p>
                              <p className="text-sm text-muted-foreground">
                                Analyzing prompt and generating response
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    {result && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Eye className="h-5 w-5" />
                            Evaluation Results
                          </CardTitle>
                          <CardDescription>
                            Analysis and metrics from the evaluation
                          </CardDescription>
                        </CardHeader>
                                                <CardContent className="space-y-6">
                          {/* Overall Metrics Summary */}
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Overall Evaluation Summary</h3>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">Total Prompts</p>
                                <p className="text-2xl font-bold">{result.overallMetrics.totalPrompts}</p>
                              </div>
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">Blocked</p>
                                <p className="text-2xl font-bold text-red-600">{result.overallMetrics.totalBlocked}</p>
                              </div>
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">Passed</p>
                                <p className="text-2xl font-bold text-green-600">{result.overallMetrics.totalPassed}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
                                <p className="text-2xl font-bold">{(result.overallMetrics.averageAccuracy * 100).toFixed(1)}%</p>
                              </div>
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">Avg Precision</p>
                                <p className="text-2xl font-bold">{(result.overallMetrics.averagePrecision * 100).toFixed(1)}%</p>
                              </div>
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">Avg Recall</p>
                                <p className="text-2xl font-bold">{(result.overallMetrics.averageRecall * 100).toFixed(1)}%</p>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Individual Prompt Results Table */}
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Individual Prompt Results</h3>
                            <div className="border rounded-md">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-[20%]">Prompt</TableHead>
                                    <TableHead className="w-[12%]">Topic</TableHead>
                                    <TableHead className="w-[8%]">Expected</TableHead>
                                    <TableHead className="w-[8%]">Result</TableHead>
                                    <TableHead className="w-[8%]">Accuracy</TableHead>
                                    <TableHead className="w-[8%]">Precision</TableHead>
                                    <TableHead className="w-[8%]">Recall</TableHead>
                                    <TableHead className="w-[28%]">Guardrails</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {result.promptResults.map((promptResult) => (
                                    <TableRow key={promptResult.promptId}>
                                      <TableCell className="max-w-xs">
                                        <div className="text-sm">
                                          <p className="font-medium line-clamp-2">{promptResult.prompt}</p>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm">{promptResult.topic || 'any'}</span>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={promptResult.userMarkedAdversarial ? 'destructive' : 'default'}>
                                          {promptResult.userMarkedAdversarial ? 'Blocked' : 'Passed'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={promptResult.judgeDetectedAdversarial ? 'destructive' : 'default'}>
                                          {promptResult.judgeDetectedAdversarial ? 'Blocked' : 'Passed'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm">
                                          {promptResult.localScores.accuracy !== undefined 
                                            ? `${(promptResult.localScores.accuracy * 100).toFixed(1)}%`
                                            : 'N/A'
                                          }
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm">
                                          {promptResult.localScores.precision !== undefined 
                                            ? `${(promptResult.localScores.precision * 100).toFixed(1)}%`
                                            : 'N/A'
                                          }
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        <span className="text-sm">
                                          {promptResult.localScores.recall !== undefined 
                                            ? `${(promptResult.localScores.recall * 100).toFixed(1)}%`
                                            : 'N/A'
                                          }
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        {promptResult.guardrailResults && promptResult.guardrailResults.length > 0 ? (
                                          <div className="space-y-1">
                                            {promptResult.guardrailResults.map((guardrail, idx) => (
                                              <div key={idx} className="flex items-center gap-2">
                                                <Badge 
                                                  variant={guardrail.status === 'blocked' ? 'destructive' : 'default'}
                                                  className="text-xs"
                                                >
                                                  {guardrail.status === 'blocked' ? 'BLOCKED' : 'PASSED'}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                  {guardrail.guardrailName}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <span className="text-xs text-muted-foreground">No guardrails</span>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>

                          {/* Detailed Guardrail Results */}
                          {result.promptResults.some(pr => pr.guardrailResults && pr.guardrailResults.length > 0) && (
                            <>
                              <Separator />
                              <div className="space-y-3">
                                <h3 className="font-semibold text-lg">Detailed Guardrail Results</h3>
                                {result.promptResults.map((promptResult) => (
                                  promptResult.guardrailResults && promptResult.guardrailResults.length > 0 && (
                                    <div key={promptResult.promptId} className="space-y-3">
                                      <h4 className="font-medium text-md text-muted-foreground">
                                        Prompt: {promptResult.prompt.substring(0, 50)}...
                                      </h4>
                                      <div className="grid grid-cols-1 gap-3">
                                        {promptResult.guardrailResults.map((guardrail, idx) => (
                                          <div 
                                            key={idx} 
                                            className={`p-4 rounded-md border ${
                                              guardrail.status === 'blocked' 
                                                ? 'bg-red-50 border-red-200' 
                                                : 'bg-green-50 border-green-200'
                                            }`}
                                          >
                                            <div className="flex items-start justify-between">
                                              <div className="space-y-2 flex-1">
                                                <div className="flex items-center space-x-2">
                                                  <span className="font-medium text-sm">
                                                    {guardrail.guardrailName}
                                                  </span>
                                                  <Badge 
                                                    variant={guardrail.status === 'blocked' ? 'destructive' : 'default'}
                                                    className="text-xs"
                                                  >
                                                    {guardrail.status === 'blocked' ? 'BLOCKED' : 'PASSED'}
                                                  </Badge>
                                                </div>
                                                <div className="space-y-1">
                                                  <p className="text-xs font-medium text-muted-foreground">Policy:</p>
                                                  <p className="text-xs bg-white/50 p-2 rounded border">
                                                    {guardrail.policyDescription}
                                                  </p>
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                  Evaluated at: {new Date(guardrail.timestamp).toLocaleTimeString()}
                                                </div>
                                              </div>
                                              <div className="flex items-center space-x-2 ml-4">
                                                {guardrail.status === 'blocked' ? (
                                                  <XCircle className="h-5 w-5 text-red-600" />
                                                ) : (
                                                  <CheckCircle className="h-5 w-5 text-green-600" />
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )
                                ))}
                              </div>
                            </>
                          )}

                          {/* Candidate Responses */}
                          <Separator />
                          <div className="space-y-3">
                            <h3 className="font-semibold text-lg">Candidate Responses</h3>
                            {result.promptResults.map((promptResult) => (
                              <div key={promptResult.promptId} className="space-y-2">
                                <h4 className="font-medium text-md text-muted-foreground">
                                  Prompt: {promptResult.prompt.substring(0, 50)}...
                                </h4>
                                <div className="p-4 bg-muted rounded-md border">
                                  <pre className="whitespace-pre-wrap text-sm">{promptResult.candidateResponse}</pre>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Timestamp */}
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Evaluated at {new Date(result.timestamp).toLocaleString()}
                          </div>
                        </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {/* Loading State - Show outside tabs when no results yet */}
            {isLoading && !result && (
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <div>
                      <p className="font-medium">Running Evaluation...</p>
                      <p className="text-sm text-muted-foreground">
                        Analyzing prompt and generating response
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
