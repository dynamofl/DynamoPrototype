/**
 * Icon cell component for displaying icons with text
 */

import React from 'react'
import { cn } from '@/lib/utils'
import { AISystemIcon } from '../ai-system-icon'
import type { CellProps } from '@/types/table'

interface IconCellProps extends CellProps {
  iconComponent?: React.ComponentType<{ className?: string }>
  iconSrc?: string
  iconAlt?: string
  showText?: boolean
  iconPosition?: 'left' | 'right' | 'top' | 'bottom'
  iconSize?: 'sm' | 'md' | 'lg'
  iconFormat?: (value: any, row: any) => React.ReactElement | null
}

export function IconCell({
  value,
  row,
  column,
  mode: _mode,
  onChange: _onChange,
  disabled: _disabled = false,
  className = '',
  iconComponent: IconComponent,
  iconSrc,
  iconAlt = '',
  showText = true,
  iconPosition = 'left',
  iconSize = 'md',
  iconFormat
}: IconCellProps) {
  // Get icon size classes
  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'sm': return 'h-4 w-4'
      case 'lg': return 'h-6 w-6'
      default: return 'h-5 w-5'
    }
  }

  // Get layout classes based on icon position
  const getLayoutClasses = () => {
    switch (iconPosition) {
      case 'right': return 'flex-row-reverse'
      case 'top': return 'flex-col'
      case 'bottom': return 'flex-col-reverse'
      default: return 'flex-row'
    }
  }

  // Get spacing classes
  const getSpacingClasses = () => {
    switch (iconPosition) {
      case 'top':
      case 'bottom': return 'gap-1'
      default: return 'gap-2'
    }
  }

  // Render icon
  const renderIcon = () => {
    // Use iconFormat if provided (for custom icon rendering)
    if (iconFormat) {
      return iconFormat(value, row)
    }

    if (IconComponent) {
      return <IconComponent className={getIconSizeClass()} />
    }
    
    if (iconSrc) {
      return (
        <img
          src={iconSrc}
          alt={iconAlt}
          className={cn(getIconSizeClass(), 'object-contain')}
        />
      )
    }

    // Check if this is an AI provider row and use AISystemIcon
    if (row && row.type && typeof row.type === 'string') {
      const providerType = row.type as any
      if (['OpenAI', 'Azure', 'Mistral', 'Databricks', 'HuggingFace', 'Anthropic', 'Remote', 'Local', 'DynamoAI', 'AWS'].includes(providerType)) {
        return <AISystemIcon type={providerType} className={getIconSizeClass()} />
      }
    }

    return null
  }

  // Render text
  const renderText = () => {
    if (!showText) return null

    // If iconFormat is provided, use the original value for text (not the formatted JSX)
    const textValue = iconFormat ? value : (column.format ? column.format(value, row) : value)
    return (
      <span className="text-sm truncate">
        {textValue || column.placeholder || ''}
      </span>
    )
  }

  return (
    <div className={cn(
      'min-h-[32px] flex items-center',
      getLayoutClasses(),
      getSpacingClasses(),
      className
    )}>
      {renderIcon()}
      {renderText()}
    </div>
  )
}

