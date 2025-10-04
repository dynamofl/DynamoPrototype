import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AISystemIcon } from '@/components/patterns';
import type { EvaluationProviderOption } from './evaluation-provider-selection-step';

export interface EvaluationConfigurationStepProps {
  provider: EvaluationProviderOption;
  name: string;
  onNameChange: (name: string) => void;
  apiKey: string;
  onAPIKeyChange: (apiKey: string) => void;
  showAPIKey: boolean;
  onToggleAPIKey: () => void;
  modelId: string;
  onModelChange: (modelId: string) => void;
  customEndpoint?: string;
  onCustomEndpointChange?: (endpoint: string) => void;
  onBackToSelection: () => void;
}

export function EvaluationConfigurationStep({
  provider,
  name,
  onNameChange,
  apiKey,
  onAPIKeyChange,
  showAPIKey,
  onToggleAPIKey,
  modelId,
  onModelChange,
  customEndpoint,
  onCustomEndpointChange,
  onBackToSelection,
}: EvaluationConfigurationStepProps) {
  return (
    <div className="flex-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
      <div className="space-y-6">
        {/* Provider Configuration */}
        <div className="space-y-2">
          <Label htmlFor="api-provider">Evaluation Provider</Label>
          <div className="flex items-center space-x-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
            <AISystemIcon
              type={provider.icon as any}
              className="w-8 h-8"
            />
            <div className="flex-1">
              <p className="text-[0.8125rem]  font-450 text-gray-900">
                {provider.name}
              </p>
            </div>
            <Button
              variant="link"
              size="sm"
              onClick={onBackToSelection}
              className="underline"
            >
              Change
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Model Name */}
          <div className="space-y-2">
            <Label htmlFor="model-name">Model Name</Label>
            <Input
              id="model-name"
              placeholder="Enter Name (e.g., GPT-4o Production, Claude Evaluator)"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>

          {/* Model Selection (only for OpenAI and Anthropic) */}
          {provider.id !== 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={modelId} onValueChange={onModelChange}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {provider.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom Endpoint (only for Custom provider) */}
          {provider.id === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="https://api.example.com/v1"
                  value={customEndpoint || ''}
                  onChange={(e) => onCustomEndpointChange?.(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customModel">Model ID</Label>
                <Input
                  id="customModel"
                  placeholder="e.g., gpt-4o"
                  value={modelId}
                  onChange={(e) => onModelChange(e.target.value)}
                />
              </div>
            </>
          )}

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showAPIKey ? 'text' : 'password'}
                placeholder={`Enter your ${provider.name} API key`}
                value={apiKey}
                onChange={(e) => onAPIKeyChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={onToggleAPIKey}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showAPIKey ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
