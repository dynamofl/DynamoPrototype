/**
 * Type definitions for AI Systems feature
 */

export interface AISystem {
  id: string
  name: string
  createdAt: string
  status: 'active' | 'inactive'
  icon: 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Remote' | 'Local' | 'AWS' | 'DynamoAI'
  hasGuardrails: boolean
  isEvaluated: boolean
  // New fields for dynamic functionality
  providerId: string // Reference to the AI provider
  providerName: string // Name of the AI provider
  apiKeyId: string // Reference to the API key used
  apiKeyName: string // Nickname of the API key
  selectedModel: string // The single model selected for this system
  modelDetails?: {
    id: string
    name: string
    created: number
    owned_by: string
  }
  isExpanded?: boolean
  // Computed fields for state tracking
  hasValidAPIKey: boolean // Whether the API key actually exists and is valid
  lastValidated: number // Timestamp of last validation
}

export interface NewAISystem {
  name: string
  providerId: string
  apiKeyId: string
  selectedModel: string
}

export interface AISystemFormData {
  name: string
  provider: {
    id: string
    name: string
    type: string
  }
  apiKey: {
    id: string
    name: string
    key: string
  }
  selectedModel: string
  availableModels: AIModel[]
}

export interface AIModel {
  id: string
  object: string
  created: number
  owned_by: string
  permission: any[]
  root: string
  parent: string | null
  logging: any
}

export interface APIKeyOption {
  id: string
  name: string
  provider: string
  key: string
  isAvailable: boolean
}

export interface ProviderOption {
  id: string
  name: string
  type: string
  icon: string
  apiKeys: APIKeyOption[]
  hasApiKeys: boolean
}
