/**
 * Badge cell component for status display
 */

import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { CellProps } from '@/types/table'

interface BadgeCellProps extends CellProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  colorMap?: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className?: string }>
  tooltip?: string
}

export function BadgeCell({
  value,
  row,
  column,
  mode,
  onChange,
  disabled = false,
  className = '',
  variant = 'default',
  colorMap = {},
  tooltip
}: BadgeCellProps) {
  // Format value for display
  const formatValue = (val: any): string => {
    // Use column format function if provided
    if (column.format) {
      const formatted = column.format(val, row)
      if (typeof formatted === 'string') {
        return formatted
      }
      // If format returns a ReactNode, convert to string
      return String(formatted)
    }
    
    if (val === null || val === undefined) {
      return 'N/A'
    }
    
    if (Array.isArray(val)) {
      return `${val.length} items`
    }
    
    if (typeof val === 'object') {
      return 'Object'
    }
    
    return String(val)
  }

  // Get badge configuration
  const getBadgeConfig = (val: any) => {
    const stringValue = formatValue(val).toLowerCase()
    
    if (colorMap[stringValue]) {
      return colorMap[stringValue]
    }

    // Default color mapping based on value
    if (stringValue.includes('active') || stringValue.includes('enabled') || stringValue.includes('success')) {
      return { variant: 'default' as const, className: 'bg-green-100 text-green-800 border-green-200' }
    }
    
    if (stringValue.includes('inactive') || stringValue.includes('disabled') || stringValue.includes('error')) {
      return { variant: 'destructive' as const }
    }
    
    if (stringValue.includes('pending') || stringValue.includes('warning') || stringValue.includes('processing')) {
      return { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    }

    // Special handling for arrays (like models)
    if (Array.isArray(val)) {
      return { variant: 'outline' as const, className: 'bg-blue-50 text-blue-700 border-blue-200' }
    }

    return { variant, className: '' }
  }

  const badgeConfig = getBadgeConfig(value)

  // Handle badge click (for edit mode)
  const handleBadgeClick = () => {
    if (mode === 'edit' && !disabled && !column.readonly && onChange) {
      // Toggle between common states
      const currentValue = formatValue(value).toLowerCase()
      let newValue = value

      if (currentValue.includes('active')) {
        newValue = 'inactive'
      } else if (currentValue.includes('inactive')) {
        newValue = 'active'
      } else if (currentValue.includes('enabled')) {
        newValue = 'disabled'
      } else if (currentValue.includes('disabled')) {
        newValue = 'enabled'
      }

      onChange(newValue)
    }
  }

  // View mode - display badge
  if (mode === 'view' || disabled || column.readonly) {
    const badgeElement = (
      <Badge
        variant={badgeConfig.variant}
        className={badgeConfig.className}
      >
        {formatValue(value)}
      </Badge>
    )

    return (
      <div className={`min-h-[32px] flex items-center ${className}`}>
        {tooltip ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {badgeElement}
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          badgeElement
        )}
      </div>
    )
  }

  // Edit mode - clickable badge
  return (
    <div className={`min-h-[32px] flex items-center ${className}`}>
      <Badge
        variant={badgeConfig.variant}
        className={`cursor-pointer hover:opacity-80 transition-opacity ${badgeConfig.className}`}
        onClick={handleBadgeClick}
      >
        {formatValue(value)}
      </Badge>
    </div>
  )
}

