import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { ensureAuthenticated } from '@/lib/supabase/client'
import type { AISystem } from '../types/types'
import { aiSystemsStateManager } from './ai-systems-state-manager'

/**
 * Hook to fetch AI systems from Supabase backend
 * Replaces localStorage-based storage
 */
export function useAISystemsSupabase() {
  const [aiSystems, setAISystems] = useState<AISystem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load AI systems from Supabase
  useEffect(() => {
    loadAISystems()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('ai-systems-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_systems'
        },
        () => {
          loadAISystems()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function loadAISystems() {
    try {
      setLoading(true)
      setError(null)

      // Ensure authenticated
      await ensureAuthenticated()

      const { data, error: fetchError } = await supabase
        .from('ai_systems')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform Supabase data to match AISystem type
      const transformedSystems: AISystem[] = (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        providerId: item.provider,
        providerName: item.provider,
        selectedModel: item.model,
        model: item.model,
        apiKeyId: item.config?.apiKeyId,
        apiKeyName: item.config?.apiKeyName,
        modelDetails: item.config?.modelDetails,
        icon: item.config?.icon || 'custom',
        status: item.config?.status || 'active',
        hasValidAPIKey: false, // Will be updated during enhancement
        hasGuardrails: false,
        isEvaluated: false,
        lastValidated: 0,
        createdAt: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        updatedAt: item.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      }))

      // Enhance systems with actual API key validation
      const enhancedSystems = await aiSystemsStateManager.enhanceAISystems(transformedSystems)

      setAISystems(enhancedSystems)
    } catch (err) {
      console.error('Failed to load AI systems from Supabase:', err)
      setError(err instanceof Error ? err.message : 'Failed to load AI systems')
      setAISystems([])
    } finally {
      setLoading(false)
    }
  }

  const getSystemByName = (name: string) => {
    return aiSystems.find(system => system.name === name)
  }

  const getSystemById = (id: string) => {
    return aiSystems.find(system => system.id === id)
  }

  return {
    aiSystems,
    loading,
    error,
    getSystemByName,
    getSystemById,
    reload: loadAISystems
  }
}
