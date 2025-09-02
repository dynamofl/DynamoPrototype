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
import { Play, Save, Share, History, Settings, Code, Eye, AlertTriangle, CheckCircle, XCircle, Clock, Plus, X, Info } from 'lucide-react'
import { APIKeyStorage } from '@/lib/secure-storage'
import { runEvaluation, getAvailableModels } from '@/lib/evalRunner'
import type { EvaluationInput, EvaluationConfig, EvaluationResult } from '@/types/evaluation'
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
    prompt: '',
    topic: '',
    userMarkedAdversarial: false
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

  const handleSubmit = async () => {
    if (!evaluationInput.prompt.trim()) {
      setError('Please provide a prompt')
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
                  disabled={isLoading || !evaluationInput.prompt.trim() || availableModels.length === 1 && availableModels[0].id === 'no-models'}
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
                  {/* Prompt Input */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Enter the prompt you want to evaluate..."
                      value={evaluationInput.prompt}
                      onChange={(e) => setEvaluationInput({ ...evaluationInput, prompt: e.target.value })}
                      className="min-h-[120px] resize-none"
                    />
                  </div>

                  {/* Topic Input */}
                  <div className="space-y-2">
                    <Label htmlFor="topic">
                      Topic/Category
                      <span className="text-sm text-muted-foreground font-normal ml-1">(optional)</span>
                    </Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Housing, Finance, Legal, Healthcare, Education (leave empty for 'any')"
                      value={evaluationInput.topic}
                      onChange={(e) => setEvaluationInput({ ...evaluationInput, topic: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      If no topic is specified, the evaluation will consider the prompt under "any" category
                    </p>
                  </div>

                  {/* Adversarial Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="adversarial">Expect Blocked Response</Label>
                      <p className="text-sm text-muted-foreground">
                        Indicate if you expect the AI to block/refuse this prompt (adversarial prompt)
                      </p>
                    </div>
                    <Switch
                      id="adversarial"
                      checked={evaluationInput.userMarkedAdversarial}
                      onCheckedChange={(checked) => setEvaluationInput({ ...evaluationInput, userMarkedAdversarial: checked })}
                    />
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
                      {/* Prompt Input */}
                      <div className="space-y-2">
                        <Label htmlFor="prompt">Prompt</Label>
                        <Textarea
                          id="prompt"
                          placeholder="Enter the prompt you want to evaluate..."
                          value={evaluationInput.prompt}
                          onChange={(e) => setEvaluationInput({ ...evaluationInput, prompt: e.target.value })}
                          className="min-h-[120px] resize-none"
                        />
                      </div>

                      {/* Topic Input */}
                      <div className="space-y-2">
                        <Label htmlFor="topic">
                          Topic/Category
                          <span className="text-sm text-muted-foreground font-normal ml-1">(optional)</span>
                        </Label>
                        <Input
                          id="topic"
                          placeholder="e.g., Housing, Finance, Legal, Healthcare, Education (leave empty for 'any')"
                          value={evaluationInput.topic}
                          onChange={(e) => setEvaluationInput({ ...evaluationInput, topic: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          If no topic is specified, the evaluation will consider the prompt under "any" category
                        </p>
                      </div>

                      {/* Adversarial Toggle */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="adversarial">Expect Blocked Response</Label>
                          <p className="text-sm text-muted-foreground">
                            Indicate if you expect the AI to block/refuse this prompt (adversarial prompt)
                          </p>
                        </div>
                        <Switch
                          id="adversarial"
                          checked={evaluationInput.userMarkedAdversarial}
                          onCheckedChange={(checked) => setEvaluationInput({ ...evaluationInput, userMarkedAdversarial: checked })}
                        />
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

                        {/* Response Evaluation Result - Show in Input tab when results are available */}
                        {result && (
                          <>
                            <Separator />
                            <div className="space-y-3">
                              <h3 className="font-semibold text-lg">Response Evaluation</h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm text-muted-foreground">User Expected</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {evaluationInput.userMarkedAdversarial ? (
                                      <CheckCircle className="h-4 w-4 text-destructive" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-green-600" />
                                    )}
                                    <span className="font-medium">
                                      {evaluationInput.userMarkedAdversarial ? 'Blocked Response' : 'Passed Response'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Based on prompt analysis
                                  </p>
                                </div>
                                <div className="p-3 bg-muted rounded-md">
                                  <p className="text-sm text-muted-foreground">Judge Found</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {result.judgeDetectedAdversarial ? (
                                      <CheckCircle className="h-4 w-4 text-destructive" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-green-600" />
                                    )}
                                                                      <span className="font-medium">
                                    {result.judgeDetectedAdversarial ? 'Blocked Response' : 'Passed Response'}
                                  </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Based on response evaluation
                                  </p>
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

{/* Guardrail Evaluation Results */}
{result.guardrailResults && result.guardrailResults.length > 0 && (
                          <>
                            <Separator />
                            <div className="space-y-3">
                              <h3 className="font-semibold text-lg">Guardrail Policy Evaluation</h3>
                              <p className="text-sm text-muted-foreground">
                                Results from evaluating the prompt against each guardrail policy
                              </p>
                              <div className="grid grid-cols-1 gap-3">
                                {result.guardrailResults.map((guardrailResult) => (
                                  <div 
                                    key={guardrailResult.guardrailId} 
                                    className={`p-4 rounded-md border ${
                                      guardrailResult.status === 'blocked' 
                                        ? 'bg-red-50 border-red-200' 
                                        : 'bg-green-50 border-green-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-2 flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-medium text-sm">
                                            {guardrailResult.guardrailName}
                                          </span>
                                          <Badge 
                                            variant={guardrailResult.status === 'blocked' ? 'destructive' : 'default'}
                                            className="text-xs"
                                          >
                                            {guardrailResult.status === 'blocked' ? 'BLOCKED' : 'PASSED'}
                                          </Badge>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-xs font-medium text-muted-foreground">Policy:</p>
                                          <p className="text-xs bg-white/50 p-2 rounded border">
                                            {guardrailResult.policyDescription}
                                          </p>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Evaluated at: {new Date(guardrailResult.timestamp).toLocaleTimeString()}
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2 ml-4">
                                        {guardrailResult.status === 'blocked' ? (
                                          <XCircle className="h-5 w-5 text-red-600" />
                                        ) : (
                                          <CheckCircle className="h-5 w-5 text-green-600" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Summary */}
                              <div className="p-3 bg-muted rounded-md">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium">Summary:</span>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-green-600">
                                      Passed: {result.guardrailResults.filter(r => r.status === 'passed').length}
                                    </span>
                                    <span className="text-red-600">
                                      Blocked: {result.guardrailResults.filter(r => r.status === 'blocked').length}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        <Separator />

                        {/* Model Response */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg">Model Response</h3>
                          <div className="p-4 bg-muted rounded-md border">
                            <pre className="whitespace-pre-wrap text-sm">{result.candidateResponse}</pre>
                          </div>
                        </div>

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

                       
                        

                        <Separator />

                        

                        {/* Confusion Matrix */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg">Confusion Matrix</h3>
                          <p className="text-sm text-muted-foreground">
                            Comparing user expectation vs judge evaluation of response blocking
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-sm text-green-700 font-medium">True Positive (TP)</p>
                              <p className="text-xs text-green-600">Expected blocked, found blocked</p>
                              <p className="text-2xl font-bold text-green-800">{result.confusionMatrix.tp}</p>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-700 font-medium">True Negative (TN)</p>
                              <p className="text-xs text-blue-600">Expected passed, found passed</p>
                              <p className="text-2xl font-bold text-blue-800">{result.confusionMatrix.tn}</p>
                            </div>
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                              <p className="text-sm text-yellow-700 font-medium">False Positive (FP)</p>
                              <p className="text-xs text-yellow-600">Expected blocked, found passed</p>
                              <p className="text-2xl font-bold text-yellow-800">{result.confusionMatrix.fp}</p>
                            </div>
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-700 font-medium">False Negative (FN)</p>
                              <p className="text-xs text-red-600">Expected passed, found blocked</p>
                              <p className="text-2xl font-bold text-red-800">{result.confusionMatrix.fn}</p>
                            </div>
                          </div>
                          
                          {/* Debug Info */}
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                            <p className="text-xs text-gray-600 font-medium mb-2">Debug Information:</p>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                              <div>TP: {result.confusionMatrix.tp}</div>
                              <div>TN: {result.confusionMatrix.tn}</div>
                              <div>FP: {result.confusionMatrix.fp}</div>
                              <div>FN: {result.confusionMatrix.fn}</div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Total: {result.confusionMatrix.tp + result.confusionMatrix.tn + result.confusionMatrix.fp + result.confusionMatrix.fn}
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Metrics */}
                        <div className="space-y-3">
                          <h3 className="font-semibold text-lg">Evaluation Metrics</h3>
                          <div className="grid grid-cols-3 gap-4">
                            {result.localScores.accuracy !== undefined && (
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">Accuracy</p>
                                <p className="text-2xl font-bold">{(result.localScores.accuracy * 100).toFixed(1)}%</p>
                              </div>
                            )}
                            {result.localScores.precision !== undefined && (
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">Precision</p>
                                <p className="text-2xl font-bold">{(result.localScores.precision * 100).toFixed(1)}%</p>
                              </div>
                            )}
                            {result.localScores.recall !== undefined && (
                              <div className="p-3 bg-muted rounded-md">
                                <p className="text-sm text-muted-foreground">Recall</p>
                                <p className="text-2xl font-bold">{(result.localScores.recall * 100).toFixed(1)}%</p>
                              </div>
                              )}
                          </div>
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
