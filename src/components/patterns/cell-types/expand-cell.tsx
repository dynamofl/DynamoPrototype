/**
 * Expand cell component for expandable rows
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { ExpandCellProps } from '@/types/table'

export function ExpandCell({
  value,
  row,
  column,
  mode,
  onChange,
  disabled = false,
  className = '',
  isExpanded,
  onToggle,
  expandIcon,
  collapseIcon
}: ExpandCellProps) {
  // Handle expand/collapse
  const handleToggle = () => {
    if (!disabled) {
      onToggle()
    }
  }

  // Get icon based on expansion state
  const getIcon = () => {
    if (isExpanded) {
      return collapseIcon || <ChevronRight className="h-4 w-4" />
    }
    return expandIcon || <ChevronRight className="h-4 w-4" />
  }

  // Get rotation class for smooth animation (only if using default chevron)
  const getRotationClass = () => {
    if (isExpanded && !collapseIcon) {
      return 'rotate-90'
    }
    return 'rotate-0'
  }

  return (
    <div className={cn('min-h-[32px] flex items-center justify-center', className)}>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggle}
        disabled={disabled}
        className="h-6 w-6 p-0 hover:bg-gray-100"
      >
        <div className={cn(
          'transition-transform duration-200 ease-in-out',
          getRotationClass()
        )}>
          {getIcon()}
        </div>
      </Button>
    </div>
  )
}

