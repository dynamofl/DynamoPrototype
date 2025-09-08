/**
 * Guardrails Stats Section
 * Custom component for displaying guardrail statistics
 */

import { useState, useEffect } from 'react'
import { StatCardSection } from '@/components/patterns/stat-card-section'
import type { StatCardData } from '@/components/patterns/stat-card-section'
import type { Guardrail } from '@/types'

export function GuardrailsStats() {
  // Calculate stats immediately
  const calculateStats = (): StatCardData[] => {
    try {
      const stored = localStorage.getItem('guardrails')
      const guardrails: Guardrail[] = stored ? JSON.parse(stored) : []
      
      // Calculate statistics
      const totalGuardrails = guardrails.length
      const activeGuardrails = guardrails.filter(g => g.status === 'active').length
      const categories = new Set(guardrails.map(g => g.category).filter(Boolean)).size
      
      // Find most recently added guardrail
      const lastAdded = guardrails.length > 0 
        ? guardrails.reduce((latest, current) => {
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
          title: 'Total Guardrails',
          value: totalGuardrails.toString(),
          info: 'Total number of content guardrails configured in your system. These policies help ensure your AI systems follow specific rules and guidelines.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Active Guardrails',
          value: activeGuardrails.toString(),
          info: 'Guardrails that are currently active and being enforced. These policies are actively protecting your AI systems from harmful or inappropriate content.',
          variant: 'success',
          loading: false
        },
        {
          title: 'Categories',
          value: categories.toString(),
          info: 'Number of distinct categories used to organize your guardrails. Categories help you manage and apply policies systematically across different use cases.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Last Added',
          value: lastAddedDate,
          info: 'Date when the most recent guardrail was added to your system. Keep track of when new policies were configured.',
          variant: 'default',
          loading: false
        }
      ]
    } catch (error) {
      console.error('Failed to load guardrail stats:', error)
      // Return default values on error
      return [
        {
          title: 'Total Guardrails',
          value: '0',
          info: 'Total number of content guardrails configured in your system. These policies help ensure your AI systems follow specific rules and guidelines.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Active Guardrails',
          value: '0',
          info: 'Guardrails that are currently active and being enforced. These policies are actively protecting your AI systems from harmful or inappropriate content.',
          variant: 'success',
          loading: false
        },
        {
          title: 'Categories',
          value: '0',
          info: 'Number of distinct categories used to organize your guardrails. Categories help you manage and apply policies systematically across different use cases.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Last Added',
          value: 'None',
          info: 'Date when the most recent guardrail was added to your system. Keep track of when new policies were configured.',
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
