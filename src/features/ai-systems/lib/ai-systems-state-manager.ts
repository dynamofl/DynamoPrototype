/**
 * AI Systems State Manager
 * Manages AI system state with API key validation tracking
 */

import type { AISystem } from '../types'
import { SecureAPIKeyService } from '@/lib/supabase/secure-api-key-service'
import { supabase } from '@/lib/supabase/client'

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
      // Map provider names to lowercase for consistency
      const providerTypeMap: Record<string, string> = {
        'OpenAI': 'openai',
        'Anthropic': 'anthropic',
        'Mistral': 'mistral',
        'Cohere': 'cohere',
        'Google': 'google'
      };
      const normalizedProvider = providerTypeMap[providerId] || providerId.toLowerCase();

      const allAPIKeys = await SecureAPIKeyService.listAPIKeys()

      const matchingKey = allAPIKeys.find(apiKey =>
        apiKey.id === apiKeyId &&
        apiKey.provider === normalizedProvider
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
   * Also updates the database to keep config.status in sync
   */
  async enhanceAISystems(systems: AISystem[]): Promise<AISystem[]> {
    const enhancedSystems = await Promise.all(
      systems.map(system => this.enhanceAISystem(system))
    )

    // Update database with computed status to keep it in sync
    await this.syncStatusToDatabase(enhancedSystems)

    return enhancedSystems
  }

  /**
   * Sync computed status back to database
   * Updates config.status field to match the validated hasValidAPIKey state
   */
  private async syncStatusToDatabase(systems: AISystem[]): Promise<void> {
    try {
      // Batch update all systems that need status changes
      const updates = systems.map(async (system) => {
        const computedStatus = system.hasValidAPIKey ? 'connected' : 'disconnected'

        // Fetch current config to preserve other fields
        const { data: currentSystem, error: fetchError } = await supabase
          .from('ai_systems')
          .select('config')
          .eq('id', system.id)
          .single()

        if (fetchError) {
          console.error(`[StateManager] Failed to fetch config for ${system.name}:`, fetchError)
          return
        }

        const currentConfig = currentSystem?.config || {}

        // Only update if status has changed to avoid unnecessary writes
        if (currentConfig.status !== computedStatus) {
          console.log(`[StateManager] Syncing status for ${system.name}: ${currentConfig.status} -> ${computedStatus}`)

          const { error } = await supabase
            .from('ai_systems')
            .update({
              config: {
                ...currentConfig,
                status: computedStatus
              }
            })
            .eq('id', system.id)

          if (error) {
            console.error(`[StateManager] Failed to sync status for ${system.name}:`, error)
          }
        }
      })

      await Promise.all(updates)
    } catch (error) {
      console.error('[StateManager] Failed to sync status to database:', error)
    }
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
