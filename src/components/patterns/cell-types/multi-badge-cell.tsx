/**
 * Multi-badge cell component for displaying multiple badges with overflow handling
 */

import React from 'react'
import { cn } from '@/lib/utils'
import type { CellProps } from '@/types/table'

interface BadgeItem {
  label: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  className?: string
}

interface MultiBadgeCellProps extends CellProps {
  maxVisible?: number
  showOverflowCount?: boolean
  overflowLabel?: string
  getBadges?: (value: any, row: any) => BadgeItem[]
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
}

export function MultiBadgeCell({
  value,
  row,
  column,
  mode: _mode,
  onChange: _onChange,
  disabled: _disabled = false,
  className = '',
  maxVisible = 2,
  showOverflowCount = true,
  overflowLabel = '+{count} more',
  getBadges,
  badgeVariant = 'default'
}: MultiBadgeCellProps) {
  // Get badges from value or custom function
  const getBadgeItems = (): BadgeItem[] => {
    if (getBadges) {
      return getBadges(value, row)
    }

    // Handle array of strings
    if (Array.isArray(value)) {
      return value.map(item => ({
        label: String(item),
        variant: badgeVariant
      }))
    }

    // Handle single string
    if (typeof value === 'string' && value) {
      return [{ label: value, variant: badgeVariant }]
    }

    return []
  }

  const badges = getBadgeItems()
  const visibleBadges = badges.slice(0, maxVisible)
  const hiddenCount = badges.length - maxVisible

  // Get badge styling
  const getBadgeClasses = (variant: string = 'default') => {
    const baseClasses = 'inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium'
    
    switch (variant) {
      case 'primary':
        return cn(baseClasses, 'bg-blue-50 text-blue-700 border border-blue-200')
      case 'success':
        return cn(baseClasses, 'bg-green-50 text-green-700 border border-green-200')
      case 'warning':
        return cn(baseClasses, 'bg-yellow-50 text-yellow-700 border border-yellow-200')
      case 'error':
        return cn(baseClasses, 'bg-red-50 text-red-700 border border-red-200')
      default:
        return cn(baseClasses, 'bg-gray-50 text-gray-700 border border-gray-200')
    }
  }

  if (badges.length === 0) {
    return (
      <div className={cn('min-h-[32px] flex items-center', className)}>
        <span className="text-sm text-gray-400">No roles</span>
      </div>
    )
  }

  return (
    <div className={cn('min-h-[32px] flex items-center gap-1 flex-wrap', className)}>
      {visibleBadges.map((badge, index) => (
        <span
          key={index}
          className={cn(
            getBadgeClasses(badge.variant),
            badge.className
          )}
        >
          {badge.label}
        </span>
      ))}
      
      {showOverflowCount && hiddenCount > 0 && (
        <span className={cn(
          getBadgeClasses('primary'),
          'cursor-pointer hover:opacity-80'
        )}>
          {overflowLabel.replace('{count}', hiddenCount.toString())}
        </span>
      )}
    </div>
  )
}
