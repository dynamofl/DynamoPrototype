/**
 * Provider Services - Abstraction layer for different AI provider APIs
 * Handles provider-specific API validation, model fetching, and configuration
 */

import type { AIModel } from '../types'
import type { ProviderType } from './provider-validation'

/**
 * Message format for chat completions
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Chat completion response
 */
export interface ChatCompletionResponse {
  content: string
  model: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Interface for AI provider service implementations
 */
export interface ProviderService {
  /** Provider type identifier */
  readonly type: ProviderType

  /** Base API URL for the provider */
  readonly baseUrl: string

  /** Validate an API key by making a test request to the provider */
  validateKey(apiKey: string): Promise<boolean>

  /** Fetch available models from the provider */
  fetchModels(apiKey: string): Promise<AIModel[]>

  /** Get the authorization header value for API requests */
  getAuthHeader(apiKey: string): string

  /** Send chat completion request to the provider */
  createChatCompletion(
    apiKey: string,
    model: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      topP?: number
    }
  ): Promise<ChatCompletionResponse>
}

/**
 * OpenAI Provider Service
 */
class OpenAIProviderService implements ProviderService {
  readonly type: ProviderType = 'OpenAI'
  readonly baseUrl = 'https://api.openai.com/v1'

  getAuthHeader(apiKey: string): string {
    return `Bearer ${apiKey}`
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(apiKey),
          'Content-Type': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('Failed to validate OpenAI API key:', error)
      return false
    }
  }

  async fetchModels(apiKey: string): Promise<AIModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(apiKey),
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Filter for text models only (gpt models)
      const textModels = data.data.filter((model: any) =>
        model.id.includes('gpt') &&
        !model.id.includes('instruct') &&
        !model.id.includes('vision')
      )

      return textModels.map((model: any) => ({
        id: model.id,
        object: model.object,
        created: model.created,
        owned_by: model.owned_by,
        permission: model.permission,
        root: model.root,
        parent: model.parent,
        logging: model.logging
      }))
    } catch (error) {
      console.error('Failed to fetch models from OpenAI:', error)
      throw error
    }
  }

  async createChatCompletion(
    apiKey: string,
    model: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      topP?: number
    }
  ): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(apiKey),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1000,
          top_p: options?.topP ?? 1
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      }
    } catch (error) {
      console.error('Failed to create chat completion with OpenAI:', error)
      throw error
    }
  }
}

/**
 * Mistral AI Provider Service
 */
class MistralProviderService implements ProviderService {
  readonly type: ProviderType = 'Mistral'
  readonly baseUrl = 'https://api.mistral.ai/v1'

  getAuthHeader(apiKey: string): string {
    return `Bearer ${apiKey}`
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(apiKey),
          'Content-Type': 'application/json'
        }
      })

      return response.ok
    } catch (error) {
      console.error('Failed to validate Mistral API key:', error)
      return false
    }
  }

  async fetchModels(apiKey: string): Promise<AIModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(apiKey),
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Mistral API returns models in data array
      // Filter for text/chat models (exclude embedding models)
      const textModels = data.data.filter((model: any) =>
        !model.id.includes('embed') &&
        !model.id.includes('moderation')
      )

      return textModels.map((model: any) => ({
        id: model.id,
        object: model.object || 'model',
        created: model.created || Date.now() / 1000,
        owned_by: model.owned_by || 'mistralai',
        permission: model.permission || [],
        root: model.root || model.id,
        parent: model.parent || null,
        logging: model.logging || null
      }))
    } catch (error) {
      console.error('Failed to fetch models from Mistral:', error)
      throw error
    }
  }

  async createChatCompletion(
    apiKey: string,
    model: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      topP?: number
    }
  ): Promise<ChatCompletionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(apiKey),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1000,
          top_p: options?.topP ?? 1
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        }
      }
    } catch (error) {
      console.error('Failed to create chat completion with Mistral:', error)
      throw error
    }
  }
}

/**
 * Anthropic Provider Service
 */
class AnthropicProviderService implements ProviderService {
  readonly type: ProviderType = 'Anthropic'
  readonly baseUrl = 'https://api.anthropic.com/v1'

  getAuthHeader(apiKey: string): string {
    return apiKey // Anthropic uses x-api-key header, handled separately
  }

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      // Anthropic doesn't have a models endpoint, so we validate by checking the key format
      // and making a minimal request to verify authentication
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        })
      })

      // 200 or 400 (bad request) both indicate valid auth; 401 indicates invalid key
      return response.status !== 401
    } catch (error) {
      // CORS error or network error - if the key format is valid, accept it
      // The actual validation will happen server-side during evaluation
      console.warn('Failed to validate Anthropic API key (likely CORS), accepting based on format:', error)
      return true // Accept if format validation passed
    }
  }

  async fetchModels(apiKey: string): Promise<AIModel[]> {
    // Anthropic doesn't provide a models API endpoint
    // Return a static list of known models
    const knownModels = [
      'claude-3-5-sonnet-20241022',
      'claude-3-5-haiku-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ]

    return knownModels.map(modelId => ({
      id: modelId,
      object: 'model',
      created: Date.now() / 1000,
      owned_by: 'anthropic',
      permission: [],
      root: modelId,
      parent: null,
      logging: null
    }))
  }

  async createChatCompletion(
    apiKey: string,
    model: string,
    messages: ChatMessage[],
    options?: {
      temperature?: number
      maxTokens?: number
      topP?: number
    }
  ): Promise<ChatCompletionResponse> {
    try {
      // Anthropic uses a different message format - needs to separate system messages
      const systemMessages = messages.filter(m => m.role === 'system')
      const conversationMessages = messages.filter(m => m.role !== 'system')

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens ?? 1000,
          temperature: options?.temperature ?? 0.7,
          top_p: options?.topP ?? 1,
          system: systemMessages.length > 0 ? systemMessages[0].content : undefined,
          messages: conversationMessages
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return {
        content: data.content[0].text,
        model: data.model,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        }
      }
    } catch (error) {
      console.error('Failed to create chat completion with Anthropic:', error)
      throw error
    }
  }
}

/**
 * Provider Service Registry
 */
class ProviderServiceRegistry {
  private services: Map<ProviderType, ProviderService> = new Map()

  constructor() {
    // Register all provider services
    this.register(new OpenAIProviderService())
    this.register(new MistralProviderService())
    this.register(new AnthropicProviderService())
  }

  /**
   * Register a provider service
   */
  register(service: ProviderService): void {
    this.services.set(service.type, service)
  }

  /**
   * Get a provider service by type
   */
  getService(providerType: ProviderType): ProviderService | undefined {
    return this.services.get(providerType)
  }

  /**
   * Check if a provider is supported
   */
  isSupported(providerType: ProviderType): boolean {
    return this.services.has(providerType)
  }

  /**
   * Get all supported provider types
   */
  getSupportedProviders(): ProviderType[] {
    return Array.from(this.services.keys())
  }
}

// Export singleton instance
export const providerRegistry = new ProviderServiceRegistry()

/**
 * Helper functions for provider operations
 */

/**
 * Validate an API key for a specific provider
 */
export async function validateProviderAPIKey(
  providerType: ProviderType,
  apiKey: string
): Promise<boolean> {
  const service = providerRegistry.getService(providerType)

  if (!service) {
    console.warn(`No service registered for provider: ${providerType}`)
    return false
  }

  return service.validateKey(apiKey)
}

/**
 * Fetch models from a specific provider
 */
export async function fetchProviderModels(
  providerType: ProviderType,
  apiKey: string
): Promise<AIModel[]> {
  const service = providerRegistry.getService(providerType)

  if (!service) {
    throw new Error(`No service registered for provider: ${providerType}`)
  }

  return service.fetchModels(apiKey)
}

/**
 * Check if a provider is supported by the system
 */
export function isProviderSupported(providerType: ProviderType): boolean {
  return providerRegistry.isSupported(providerType)
}

/**
 * Get all supported provider types
 */
export function getSupportedProviderTypes(): ProviderType[] {
  return providerRegistry.getSupportedProviders()
}

/**
 * Create a chat completion using the appropriate provider service
 */
export async function createProviderChatCompletion(
  providerType: ProviderType,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options?: {
    temperature?: number
    maxTokens?: number
    topP?: number
  }
): Promise<ChatCompletionResponse> {
  const service = providerRegistry.getService(providerType)

  if (!service) {
    throw new Error(`No service registered for provider: ${providerType}`)
  }

  return service.createChatCompletion(apiKey, model, messages, options)
}
