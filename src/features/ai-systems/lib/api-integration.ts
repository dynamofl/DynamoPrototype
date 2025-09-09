/**
 * API integration for AI Systems - handles API key management and model fetching
 */

import { AccessTokenStorage } from '@/features/settings/layouts/access-token/lib/access-token-storage'
import type { APIKeyOption, ProviderOption, AIModel } from '../types'
import { availableProviderTypes } from '../constants'

// Initialize access token storage
const accessTokenStorage = new AccessTokenStorage()

/**
 * Get available API keys for a specific provider
 */
export async function getAPIKeysForProvider(providerType: string): Promise<APIKeyOption[]> {
  try {
    const allAPIKeys = await accessTokenStorage.getAllAPIKeys()
    
    return allAPIKeys
      .filter(apiKey => apiKey.provider === providerType)
      .map(apiKey => ({
        id: apiKey.id,
        name: apiKey.name,
        provider: apiKey.provider,
        key: apiKey.key,
        isAvailable: true
      }))
  } catch (error) {
    console.error('Failed to get API keys for provider:', error)
    return []
  }
}

/**
 * Get all providers with their available API keys
 */
export async function getProvidersWithAPIKeys(): Promise<ProviderOption[]> {
  try {
    const allAPIKeys = await accessTokenStorage.getAllAPIKeys()
    
    return availableProviderTypes.map(provider => {
      const providerAPIKeys = allAPIKeys.filter(apiKey => apiKey.provider === provider.type)
      
      return {
        ...provider,
        apiKeys: providerAPIKeys.map(apiKey => ({
          id: apiKey.id,
          name: apiKey.name,
          provider: apiKey.provider,
          key: apiKey.key,
          isAvailable: true
        })),
        hasApiKeys: providerAPIKeys.length > 0
      }
    })
  } catch (error) {
    console.error('Failed to get providers with API keys:', error)
    return availableProviderTypes.map(provider => ({
      ...provider,
      apiKeys: [],
      hasApiKeys: false
    }))
  }
}

/**
 * Fetch models from OpenAI API using the provided API key
 */
export async function fetchModelsFromOpenAI(apiKey: string): Promise<AIModel[]> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
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

/**
 * Validate OpenAI API key
 */
export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    return response.ok
  } catch (error) {
    console.error('Failed to validate OpenAI API key:', error)
    return false
  }
}

/**
 * Create a new API key and store it in access token storage
 */
export async function createAndStoreAPIKey(
  provider: string, 
  name: string, 
  apiKey: string
): Promise<{ success: boolean; apiKeyId?: string; error?: string }> {
  try {
    // Validate the API key first
    const isValid = await validateOpenAIKey(apiKey)
    
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid API key. Please check your key and try again.'
      }
    }

    // Store the API key
    await accessTokenStorage.addAPIKey(provider, name, apiKey)
    
    // Get the stored API key to return its ID
    const allAPIKeys = await accessTokenStorage.getAllAPIKeys()
    const storedAPIKey = allAPIKeys.find(key => 
      key.provider === provider && 
      key.name === name && 
      key.key === apiKey
    )

    return {
      success: true,
      apiKeyId: storedAPIKey?.id
    }
  } catch (error) {
    console.error('Failed to create and store API key:', error)
    return {
      success: false,
      error: 'Failed to store API key. Please try again.'
    }
  }
}

/**
 * Format model date for display
 */
export function formatModelDate(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
