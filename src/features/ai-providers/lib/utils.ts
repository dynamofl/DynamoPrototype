/**
 * Utility functions for AI Provider operations
 */

import type { AIModel, AIProvider } from '../types/types'
import { textModelIds } from '../constants/constants'

/**
 * Format model date for display
 */
export const formatModelDate = (timestamp: number | string | Date): string => {
  try {
    let date: Date
    if (typeof timestamp === 'number') {
      date = new Date(timestamp * 1000)
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    } else {
      date = timestamp
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

/**
 * Validate OpenAI API key format
 */
export const validateOpenAIKey = async (apiKey: string): Promise<boolean> => {
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

/**
 * Fetch models for a new provider
 */
export const fetchModelsForNewProvider = async (apiKey: string): Promise<AIModel[]> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      const allModels = data.data || []
      
      // Filter to only include text models
      const textModels = allModels.filter((model: AIModel) => {
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

/**
 * Fetch models for an existing provider
 */
export const fetchModelsForProvider = async (provider: AIProvider): Promise<AIModel[]> => {
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
      
      // Filter to only include text models
      const textModels = allModels.filter((model: AIModel) => {
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

/**
 * Create a default provider if none exist
 */
export const createDefaultProvider = (): AIProvider => {
  return {
    id: '1',
    name: 'OpenAI Production',
    type: 'OpenAI',
    apiKey: 'sk-...' + 'abc123'.slice(-4),
    status: 'active',
    createdAt: 'Jan 15, 2024',
    lastUsed: '2 hours ago',
    usageCount: 1247
  }
}
