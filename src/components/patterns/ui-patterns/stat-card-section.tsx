/**
 * Reusable StatCard Section component
 * Displays a grid of stat cards with customizable layout
 */

import React from 'react'
import { StatCard } from '@/features/ai-providers/components/stat-card'

export interface StatCardData {
  title: string
  value: string | number
  info: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  loading?: boolean
}

export interface StatCardSectionProps {
  cards: StatCardData[]
  className?: string
  gridCols?: {
    default?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: '1' | '2' | '3' | '4' | '6' | '8'
}

export function StatCardSection({
  cards,
  className = '',
  gridCols = { default: 1, md: 2, lg: 4 },
  gap = '2'
}: StatCardSectionProps) {
  const getGridClasses = () => {
    const classes = ['grid', 'gap-' + gap]
    
    if (gridCols.default) {
      classes.push(`grid-cols-${gridCols.default}`)
    }
    if (gridCols.md) {
      classes.push(`md:grid-cols-${gridCols.md}`)
    }
    if (gridCols.lg) {
      classes.push(`lg:grid-cols-${gridCols.lg}`)
    }
    if (gridCols.xl) {
      classes.push(`xl:grid-cols-${gridCols.xl}`)
    }
    
    return classes.join(' ')
  }

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {cards.map((card, index) => (
        <StatCard
          key={index}
          title={card.title}
          value={card.value}
          info={card.info}
          variant={card.variant || 'default'}
        />
      ))}
    </div>
  )
}
