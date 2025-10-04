/**
 * Free text cell component using table-level overlay system (like DynamoTable)
 */

import { type KeyboardEvent } from 'react'
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
  onChange: _onChange,
  onRowEdit,
  disabled = false,
  className = '',
  multiline: _multiline = false,
  maxLength: _maxLength,
  validation: _validation,
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
    // Apply format function if available
    const displayValue = column.format ? column.format(value, row) : value
    const hasOverflowingText = displayValue && String(displayValue).length > 50
    
    return (
      <div
        className={`cell-content w-full h-full flex items-center p-0 cursor-default outline-none border border-transparent rounded border-gray-200 bg-transparent transition-all duration-200 ease-in-out ${className}`}
      >
        <div className="w-full overflow-hidden">
          <div className="whitespace-pre-line line-clamp-1 text-ellipsis overflow-hidden text-[0.8125rem] ">
            {displayValue || (
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
  // Apply format function if available
  const displayValue = column.format ? column.format(value, row) : value
  
  return (
    <div
      className={`cell-content w-full h-full flex items-center p-2 cursor-pointer outline-none ${isCurrentlyEditing ? 'border-2 border-blue-500 bg-gray-50' : 'border border-transparent'} rounded bg-transparent transition-all duration-200 ease-in-out ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={startEditing}
    >
      <div className="w-full overflow-hidden">
        <div className="whitespace-pre-line line-clamp-1 text-ellipsis overflow-hidden text-[0.8125rem] ">
          {displayValue || (
            <span className="text-gray-400 italic">
              {column.placeholder}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

