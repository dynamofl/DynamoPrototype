/**
 * Free text cell component using table-level overlay system (like DynamoTable)
 */

import React, { type KeyboardEvent } from 'react'
import type { CellProps } from '@/types/table'

interface FreeTextCellProps extends CellProps {
  multiline?: boolean
  maxLength?: number
  validation?: (value: string) => boolean
  onStartEditing?: (cellType: string, currentValue: any) => void
  isCurrentlyEditing?: boolean
}

export function FreeTextCell({
  value,
  row,
  column,
  mode,
  onChange,
  onRowEdit,
  disabled = false,
  className = '',
  multiline = false,
  maxLength,
  validation,
  editMode = 'inline',
  onStartEditing,
  isCurrentlyEditing = false
}: FreeTextCellProps) {

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (mode === 'edit' && !disabled && !column.readonly && editMode === 'inline') {
        onStartEditing?.('freeText', value)
      }
    }
  }

  // Start editing
  const startEditing = () => {
    if (mode === 'edit' && !disabled && !column.readonly) {
      if (editMode === 'dialog') {
        onRowEdit?.(row)
        return
      }
      
      onStartEditing?.('freeText', value)
    }
  }

  // View mode - display value (matches DynamoTable styling)
  if (mode === 'view' || disabled || column.readonly) {
    const hasOverflowingText = value && String(value).length > 50
    
    return (
      <div 
        className={`cell-content ${className}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          cursor: 'default',
          outline: 'none',
          border: '1px solid transparent',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <div className="w-full overflow-hidden">
          <div className="whitespace-pre-line line-clamp-1 text-ellipsis overflow-hidden text-sm">
            {value || (
              <span className="text-gray-400 italic">
                {column.placeholder}
              </span>
            )}
            {hasOverflowingText && (
              <span className="text-blue-500 text-xs ml-1" title="Click to expand">
                ...
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Edit mode - clickable cell
  return (
    <div 
      className={`cell-content ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={startEditing}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        cursor: 'pointer',
        outline: 'none',
        border: isCurrentlyEditing ? '2px solid #3b82f6' : '1px solid transparent',
        borderRadius: '4px',
        backgroundColor: isCurrentlyEditing ? '#f8fafc' : 'transparent',
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <div className="w-full overflow-hidden">
        <div className="whitespace-pre-line line-clamp-1 text-ellipsis overflow-hidden text-sm">
          {value || (
            <span className="text-gray-400 italic">
              {column.placeholder}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

