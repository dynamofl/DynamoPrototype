/**
 * Provider Statistics Service
 *
 * Fetches dynamic statistics for API providers from Supabase:
 * - Available API keys count
 * - AI System usage count
 * - Last used/updated timestamp
 */

import { supabase } from '@/lib/supabase/client'

export interface ProviderStatistics {
  provider: string
  availableKeys: number
  aiSystemUsage: number
  lastUpdated: string
  hasKeys: boolean
}

/**
 * List of all supported providers in the platform
 */
const SUPPORTED_PROVIDERS = [
  { id: 'openai', displayName: 'OpenAI' },
  { id: 'azure', displayName: 'Azure OpenAI' },
  { id: 'anthropic', displayName: 'Anthropic' },
  { id: 'mistral', displayName: 'Mistral' },
  { id: 'databricks', displayName: 'Databricks' },
  { id: 'aws', displayName: 'AWS Bedrock' },
  { id: 'huggingface', displayName: 'Hugging Face' },
  { id: 'gemini', displayName: 'Gemini' }
]

/**
 * Fetch provider statistics dynamically from Supabase
 * Now simplified to trust database config.status which is kept in sync by AI Systems State Manager
 */
export async function fetchProviderStatistics(): Promise<ProviderStatistics[]> {
  try {
    // Fetch all statistics in parallel for better performance
    const [apiKeysData, aiSystemsData] = await Promise.all([
      fetchAPIKeyStatistics(),
      fetchAISystemStatistics()
    ])

    // Combine data for all supported providers
    const statistics: ProviderStatistics[] = SUPPORTED_PROVIDERS.map(provider => {
      const apiKeyStats = apiKeysData.find(stat => stat.provider === provider.id)
      const aiSystemStats = aiSystemsData.find(stat => stat.provider === provider.id)

      const aiUsageCount = aiSystemStats?.count ?? 0
      const availableKeysCount = apiKeyStats?.count ?? 0

      return {
        provider: provider.displayName,
        availableKeys: Number(availableKeysCount),
        aiSystemUsage: Number(aiUsageCount),
        lastUpdated: apiKeyStats?.lastUpdated || '-',
        hasKeys: availableKeysCount > 0
      }
    })

    return statistics
  } catch (error) {
    console.error('[Provider Stats] Failed to fetch provider statistics:', error)
    throw error
  }
}

/**
 * Fetch API key statistics grouped by provider
 */
async function fetchAPIKeyStatistics(): Promise<Array<{ provider: string; count: number; lastUpdated: string }>> {
  try {
    const { data: apiKeys, error } = await supabase
      .from('api_keys')
      .select('provider, last_used_at, created_at, updated_at')
      .eq('status', 'active')

    if (error) {
      console.error('[Provider Stats] Error fetching API keys:', error)
      return []
    }

    if (!apiKeys || apiKeys.length === 0) {
      return []
    }

    // Group by provider and calculate statistics
    const providerStats = apiKeys.reduce((acc, key) => {
      const provider = key.provider

      if (!acc[provider]) {
        acc[provider] = {
          count: 0,
          lastTimestamp: null as Date | null
        }
      }

      acc[provider].count++

      // Track the most recent timestamp (prefer last_used_at, fallback to updated_at, then created_at)
      const timestamp = key.last_used_at || key.updated_at || key.created_at
      if (timestamp) {
        const date = new Date(timestamp)
        if (!acc[provider].lastTimestamp || date > acc[provider].lastTimestamp) {
          acc[provider].lastTimestamp = date
        }
      }

      return acc
    }, {} as Record<string, { count: number; lastTimestamp: Date | null }>)

    // Convert to array format
    return Object.entries(providerStats).map(([provider, stats]) => ({
      provider,
      count: stats.count,
      lastUpdated: stats.lastTimestamp ? formatDate(stats.lastTimestamp) : '-'
    }))
  } catch (error) {
    console.error('[Provider Stats] Error in fetchAPIKeyStatistics:', error)
    return []
  }
}

/**
 * Fetch AI System usage statistics grouped by provider
 * Trusts database config.status which is kept in sync by AI Systems State Manager
 */
async function fetchAISystemStatistics(): Promise<Array<{ provider: string; count: number }>> {
  try {
    const { data: aiSystems, error } = await supabase
      .from('ai_systems')
      .select('provider, config')

    if (error) {
      console.error('[Provider Stats] Error fetching AI systems:', error)
      return []
    }

    if (!aiSystems || aiSystems.length === 0) {
      return []
    }

    // Filter systems that are CONNECTED (status is automatically synced by State Manager)
    const connectedSystems = aiSystems.filter(system =>
      system.config && system.config.status === 'connected'
    )

    // Group by provider and count
    const providerCounts = connectedSystems.reduce((acc, system) => {
      // Normalize provider name to lowercase for consistency
      const provider = (system.provider || '').toLowerCase().trim()

      if (!provider) return acc

      // Remove common suffixes like " ai" or "ai" at the end
      const normalizedProvider = provider
        .replace(/\s+ai$/i, '')
        .replace(/\s+/g, '')

      acc[normalizedProvider] = (acc[normalizedProvider] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Convert to array format
    return Object.entries(providerCounts).map(([provider, count]) => ({
      provider,
      count
    }))
  } catch (error) {
    console.error('[Provider Stats] Error in fetchAISystemStatistics:', error)
    return []
  }
}

/**
 * Format date to "MMM DD, YYYY" format
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
