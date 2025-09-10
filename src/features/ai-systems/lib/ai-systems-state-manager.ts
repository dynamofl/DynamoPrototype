/**
 * AI Systems State Manager
 * Manages AI system state with API key validation tracking
 */

import type { AISystem } from '../types'
import { AccessTokenStorage } from '@/features/settings/layouts/access-token/lib/access-token-storage'

// Initialize access token storage
const accessTokenStorage = new AccessTokenStorage()

export class AISystemsStateManager {
  private static instance: AISystemsStateManager
  private validationCache = new Map<string, { hasValidAPIKey: boolean; lastValidated: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): AISystemsStateManager {
    if (!AISystemsStateManager.instance) {
      AISystemsStateManager.instance = new AISystemsStateManager()
    }
    return AISystemsStateManager.instance
  }

  /**
   * Validate if an API key exists and is valid for a given provider
   */
  private async validateAPIKey(apiKeyId: string, providerId: string): Promise<boolean> {
    try {
      const allAPIKeys = await accessTokenStorage.getAllAPIKeys()
      
      const matchingKey = allAPIKeys.find(apiKey => 
        apiKey.id === apiKeyId && 
        apiKey.provider.toLowerCase() === providerId.toLowerCase()
      )
      
      return !!matchingKey
    } catch (error) {
      console.error('Failed to validate API key:', error)
      return false
    }
  }

  /**
   * Get cached validation result or validate and cache
   */
  private async getValidationResult(apiKeyId: string, providerId: string): Promise<boolean> {
    const cacheKey = `${apiKeyId}-${providerId}`
    const cached = this.validationCache.get(cacheKey)
    const now = Date.now()

    // Return cached result if still valid
    if (cached && (now - cached.lastValidated) < this.CACHE_DURATION) {
      return cached.hasValidAPIKey
    }

    // Validate and cache result
    const hasValidAPIKey = await this.validateAPIKey(apiKeyId, providerId)
    this.validationCache.set(cacheKey, {
      hasValidAPIKey,
      lastValidated: now
    })

    return hasValidAPIKey
  }

  /**
   * Enhance AI system with validation state
   */
  async enhanceAISystem(system: AISystem): Promise<AISystem> {
    const hasValidAPIKey = await this.getValidationResult(system.apiKeyId, system.providerId)
    
    return {
      ...system,
      hasValidAPIKey,
      lastValidated: Date.now(),
      status: hasValidAPIKey ? 'connected' : 'disconnected'
    }
  }

  /**
   * Enhance multiple AI systems with validation state
   */
  async enhanceAISystems(systems: AISystem[]): Promise<AISystem[]> {
    const enhancedSystems = await Promise.all(
      systems.map(system => this.enhanceAISystem(system))
    )
    return enhancedSystems
  }

  /**
   * Invalidate cache for a specific API key
   */
  invalidateAPIKey(apiKeyId: string, providerId: string): void {
    const cacheKey = `${apiKeyId}-${providerId}`
    this.validationCache.delete(cacheKey)
  }

  /**
   * Invalidate cache for all API keys of a provider
   */
  invalidateProvider(providerId: string): void {
    for (const [key] of this.validationCache) {
      if (key.endsWith(`-${providerId}`)) {
        this.validationCache.delete(key)
      }
    }
  }

  /**
   * Clear all validation cache
   */
  clearCache(): void {
    this.validationCache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.validationCache.size,
      keys: Array.from(this.validationCache.keys())
    }
  }

  /**
   * Notify that API keys have been modified for a provider
   * This should be called after API key operations
   */
  notifyAPIKeyModified(provider: string): void {
    this.invalidateProvider(provider)
  }
}

// Export singleton instance
export const aiSystemsStateManager = AISystemsStateManager.getInstance()
