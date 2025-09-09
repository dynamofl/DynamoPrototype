/**
 * Dropdown cell component matching DynamoTable styling and behavior
 */

import React, { useState, type KeyboardEvent } from 'react'
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
        className={`cell-content ${className}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '8px',
          cursor: 'pointer',
          outline: 'none',
          border: '1px solid transparent',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          transition: 'all 0.2s ease-in-out'
        }}
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
      className={`cell-content ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
        cursor: 'pointer',
        outline: 'none',
        border: '1px solid transparent',
        borderRadius: '4px',
        backgroundColor: 'transparent',
        transition: 'all 0.2s ease-in-out'
      }}
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

