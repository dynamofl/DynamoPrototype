/**
 * AI Systems Stats Section
 * Custom component for displaying AI system statistics
 */

import { useMemo } from 'react'
import { StatCardSection } from '@/components/patterns/ui-patterns/stat-card-section'
import type { StatCardData } from '@/components/patterns/ui-patterns/stat-card-section'
import type { AISystem } from '../types/types'

interface AISystemsStatsProps {
  data: AISystem[]
}

export function AISystemsStats({ data }: AISystemsStatsProps) {
  // Calculate stats from provided data
  const stats = useMemo((): StatCardData[] => {
    try {
      // Use the provided data instead of localStorage
      const aiSystems = data || []
      
      // Calculate statistics
      const totalSystems = aiSystems.length
      const connectedSystems = aiSystems.filter(system => system.hasValidAPIKey).length
      const disconnectedSystems = totalSystems - connectedSystems
      
      // Get provider counts and find top providers
      const providerCounts = new Map<string, number>()
      aiSystems.forEach(system => {
        const provider = system.providerId || system.providerName
        if (provider) {
          providerCounts.set(provider, (providerCounts.get(provider) || 0) + 1)
        }
      })
      
      // Sort providers by count and get top ones
      const sortedProviders = Array.from(providerCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3) // Top 3 providers
      
      // Format provider names for display
      const topProvidersText = sortedProviders.length > 0 
        ? sortedProviders.map(([provider, count]) => 
            count > 1 ? `${provider}` : provider
          ).join(', ')
        : 'None'
      
      return [
        {
          title: 'Total AI Systems',
          value: totalSystems.toString(),
          info: 'Total number of AI systems configured in your environment. These include all LLM integrations across different providers.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Connected Systems',
          value: connectedSystems.toString(),
          info: 'AI systems that are currently connected and operational with valid API keys. These systems are ready to handle requests.',
          variant: 'success',
          loading: false
        },
        {
          title: 'Disconnected Systems',
          value: disconnectedSystems.toString(),
          info: 'AI systems that are not currently connected due to invalid or missing API keys. These systems need attention to become operational.',
          variant: disconnectedSystems > 0 ? 'destructive' : 'default',
          loading: false
        },
                {
          title: 'Top AI Providers',
          value: topProvidersText,
          info: 'Your most used AI providers with system counts. Shows up to 3 providers ranked by number of configured systems.',
          variant: 'default',
          loading: false
        }
      ]
    } catch (error) {
      console.error('Failed to calculate AI systems stats:', error)
      // Return default values on error
      return [
        {
          title: 'Total AI Systems',
          value: '0',
          info: 'Total number of AI systems configured in your environment. These include all LLM integrations across different providers.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Connected Systems',
          value: '0',
          info: 'AI systems that are currently connected and operational with valid API keys. These systems are ready to handle requests.',
          variant: 'success',
          loading: false
        },
        {
          title: 'Disconnected Systems',
          value: '0',
          info: 'AI systems that are not currently connected due to invalid or missing API keys. These systems need attention to become operational.',
          variant: 'default',
          loading: false
        },
                {
          title: 'Top AI Providers',
          value: 'None',
          info: 'Your most used AI providers with system counts. Shows up to 3 providers ranked by number of configured systems.',
          variant: 'default',
          loading: false
        }
      ]
    }
  }, [data])

  return (
    <StatCardSection
      cards={stats}
      className=""
      gridCols={{ default: 1, md: 2, lg: 4 }}
      gap="2"
    />
  )
}