/**
 * Dropdown cell component matching DynamoTable styling and behavior
 */

import { type KeyboardEvent } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CellProps } from '@/types/table'

interface DropdownCellProps extends CellProps {
  options?: Array<{ value: string; label: string }>
}

export function DropdownCell({
  value,
  row,
  column,
  mode,
  onChange,
  onRowEdit,
  disabled = false,
  className = '',
  options = [],
  editMode = 'inline'
}: DropdownCellProps) {
  // Get current option
  const currentOption = options.find(option => option.value === value)

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      // Let the Select component handle the interaction
    }
  }

  // Handle value change
  const handleValueChange = (newValue: string) => {
    if (mode === 'edit' && !disabled && !column.readonly) {
      onChange?.(newValue)
    }
  }

  // View mode - display selected value (matches DynamoTable styling)
  if (mode === 'view' || disabled || column.readonly) {
    return (
      <div
        className={`cell-content w-full h-full flex items-center p-2 cursor-default outline-none border border-transparent rounded bg-transparent transition-all duration-200 ease-in-out ${className}`}
      >
        <span className="text-[13px]">
          {currentOption?.label || value || column.placeholder || 'Select...'}
        </span>
      </div>
    )
  }

  // Dialog mode - display with row edit trigger
  if (editMode === 'dialog') {
    return (
      <div
        className={`cell-content w-full h-full flex items-center p-2 cursor-pointer outline-none border border-transparent rounded bg-transparent transition-all duration-200 ease-in-out ${className}`}
        onClick={() => onRowEdit?.(row)}
      >
        <span className="text-[13px]">
          {currentOption?.label || value || column.placeholder || 'Select...'}
        </span>
      </div>
    )
  }

  // Edit mode - inline Select (matches DynamoTable styling)
  return (
    <div
      className={`cell-content w-full h-full flex items-center p-2 cursor-pointer outline-none border border-transparent rounded bg-transparent transition-all duration-200 ease-in-out ${className}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Select
        value={value}
        onValueChange={handleValueChange}
        disabled={disabled || column.readonly}
      >
        <SelectTrigger className="w-full h-8 border-none focus:ring-0 focus:outline-none hover:bg-gray-200 hover:cursor-pointer hover:ring-0">
          <SelectValue placeholder={column.placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

