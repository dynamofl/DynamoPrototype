import type { ProviderType } from '@/features/ai-systems/lib/provider-validation'

export interface ProviderKey {
  id: string
  name: string
  value: string
  validated: boolean
  validating: boolean
  error?: string
}

export interface ProviderState {
  open: boolean
  keys: ProviderKey[]
}

export interface ProviderDef {
  id: string
  name: string
  description: string
  docsUrl: string
  iconType: 'OpenAI' | 'Azure' | 'Mistral' | 'Databricks' | 'HuggingFace' | 'Anthropic' | 'Custom' | 'AWS' | 'DynamoAI' | 'Gemini'
  providerType: ProviderType
}
