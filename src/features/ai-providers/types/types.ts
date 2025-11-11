/**
 * Type definitions for AI Provider feature
 */

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

export interface AIProvider {
  id: string
  name: string
  type: 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Custom' | 'AWS' | 'DynamoAI' | 'Gemini'
  apiKey: string
  status: 'active' | 'inactive' | 'testing'
  createdAt: string
  lastUsed?: string
  usageCount: number
  models?: AIModel[]
  modelsLastFetched?: string
  isExpanded?: boolean
}

export interface ProviderType {
  id: string
  name: string
  type: AIProvider['type']
  description: string
  icon: AIProvider['type']
  isAvailable: boolean
}

export interface NewProvider {
  name: string
  apiKey: string
}

export interface ProviderFormData {
  name: string
  apiKey: string
  selectedModels: string[]
  availableModels: AIModel[]
}
