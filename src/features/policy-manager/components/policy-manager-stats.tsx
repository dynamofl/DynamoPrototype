/**
 * Policy Manager Stats Section
 */

import { useState, useEffect } from 'react'
import { StatCardSection } from '@/components/patterns/ui-patterns/stat-card-section'
import type { StatCardData } from '@/components/patterns/ui-patterns/stat-card-section'
import type { Policy } from '../types'

export function PolicyManagerStats() {
  const calculateStats = (): StatCardData[] => {
    try {
      const stored = localStorage.getItem('policies')
      const policies: Policy[] = stored ? JSON.parse(stored) : []

      const totalPolicies = policies.length
      const activePolicies = policies.filter(p => p.status === 'active').length
      const draftPolicies = policies.filter(p => p.status === 'draft').length
      const categories = new Set(policies.map(p => p.category).filter(Boolean)).size

      return [
        {
          title: 'Total Policies',
          value: totalPolicies.toString(),
          info: 'Total number of policies configured in your organization. Policies define rules and guidelines for AI system governance.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Active Policies',
          value: activePolicies.toString(),
          info: 'Policies that are currently active and being enforced across your AI systems.',
          variant: 'success',
          loading: false
        },
        {
          title: 'Draft Policies',
          value: draftPolicies.toString(),
          info: 'Policies that are still in draft state and pending review before activation.',
          variant: 'warning',
          loading: false
        },
        {
          title: 'Categories',
          value: categories.toString(),
          info: 'Number of distinct categories used to organize your policies across different governance areas.',
          variant: 'default',
          loading: false
        }
      ]
    } catch (error) {
      console.error('Failed to load policy stats:', error)
      return [
        {
          title: 'Total Policies',
          value: '0',
          info: 'Total number of policies configured in your organization.',
          variant: 'default',
          loading: false
        },
        {
          title: 'Active Policies',
          value: '0',
          info: 'Policies that are currently active and being enforced.',
          variant: 'success',
          loading: false
        },
        {
          title: 'Draft Policies',
          value: '0',
          info: 'Policies that are still in draft state.',
          variant: 'warning',
          loading: false
        },
        {
          title: 'Categories',
          value: '0',
          info: 'Number of distinct categories used to organize your policies.',
          variant: 'default',
          loading: false
        }
      ]
    }
  }

  const [stats, setStats] = useState<StatCardData[]>(calculateStats)

  useEffect(() => {
    setStats(calculateStats())
  }, [])

  return (
    <StatCardSection
      cards={stats}
      className=""
      gridCols={{ default: 1, md: 2, lg: 4 }}
      gap="2"
    />
  )
}
