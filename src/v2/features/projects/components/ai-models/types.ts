import type { AIModel } from '@/features/ai-systems/types/types'

export interface ProviderModels {
  providerId: string
  providerName: string
  iconType: string
  models: AIModel[]
  loading: boolean
  error?: string
}

export interface SelectedModel {
  modelId: string
  providerId: string
  providerName: string
}
