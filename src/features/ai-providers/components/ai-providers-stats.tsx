/**
 * AI Providers Stats Section
 * Custom component for displaying AI provider statistics
 */

import { useState, useEffect } from 'react'
import { StatCardSection } from '@/components/patterns/stat-card-section'
import type { StatCardData } from '@/components/patterns/stat-card-section'
import { APIKeyStorage } from '@/lib/storage/secure-storage'

export function AIProvidersStats() {
  // Calculate stats immediately
  const calculateStats = (): StatCardData[] => {
    try {
      const providers = APIKeyStorage.loadProviders()
      
      // Calculate statistics
      const totalProviders = providers.length
      const activeProviders = providers.filter((p: any) => p.status === 'active').length
      const totalModels = providers.reduce((sum: number, p: any) => {
        return sum + (Array.isArray(p.models) ? p.models.length : 0)
      }, 0)
      
      // Find most recently added provider
      const lastAdded = providers.length > 0 
        ? providers.reduce((latest: any, current: any) => {
            const latestDate = new Date(latest.createdAt || 0)
            const currentDate = new Date(current.createdAt || 0)
            return currentDate > latestDate ? current : latest
          })
        : null

      const lastAddedDate = lastAdded 
        ? new Date(lastAdded.createdAt).toLocaleDateString()
        : 'None'

      return [
        {
          title: 'Total Providers',
          value: totalProviders.toString(),
          info: 'Total number of AI service providers configured in your system. This includes all active, inactive, and testing providers.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Active Providers',
          value: activeProviders.toString(),
          info: 'AI service providers that are currently active and available for use. These providers have valid API keys and are ready to process requests.',
          variant: 'success',
          loading: false
        },
        {
          title: 'Total Text Models',
          value: totalModels.toString(),
          info: 'Total number of text generation models available across all providers. These models can be used for various AI tasks and evaluations.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Last Added',
          value: lastAddedDate,
          info: 'Date when the most recent AI provider was added to your system. Keep track of when new providers were configured.',
          variant: 'default',
          loading: false
        }
      ]
    } catch (error) {
      console.error('Failed to load AI provider stats:', error)
      // Return default values on error
      return [
        {
          title: 'Total Providers',
          value: '0',
          info: 'Total number of AI service providers configured in your system. This includes all active, inactive, and testing providers.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Active Providers',
          value: '0',
          info: 'AI service providers that are currently active and available for use. These providers have valid API keys and are ready to process requests.',
          variant: 'success',
          loading: false
        },
        {
          title: 'Total Text Models',
          value: '0',
          info: 'Total number of text generation models available across all providers. These models can be used for various AI tasks and evaluations.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Last Added',
          value: 'None',
          info: 'Date when the most recent AI provider was added to your system. Keep track of when new providers were configured.',
          variant: 'default',
          loading: false
        }
      ]
    }
  }

  const [stats, setStats] = useState<StatCardData[]>(calculateStats)

  // Update stats when data changes
  useEffect(() => {
    setStats(calculateStats())
  }, [])

  return (
    <StatCardSection
      cards={stats}
      className="mb-6"
      gridCols={{ default: 1, md: 2, lg: 4 }}
      gap="2"
    />
  )
}
