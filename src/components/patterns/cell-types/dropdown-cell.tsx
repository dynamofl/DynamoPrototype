/**
 * Dropdown cell component for selectable options
 */

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Check, ChevronDown, Edit2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  const [isOpen, setIsOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Get current option
  const currentOption = options.find(option => option.value === value)

  // Handle option select
  const handleOptionSelect = (optionValue: string) => {
    onChange?.(optionValue)
    setIsOpen(false)
    setIsEditing(false)
  }

  // Handle edit start
  const handleEditStart = () => {
    if (mode === 'edit' && !disabled && !column.readonly) {
      if (editMode === 'dialog' || (editMode === 'both' && column.rowEditTrigger)) {
        onRowEdit?.(row)
      } else {
        setIsEditing(true)
        setIsOpen(true)
      }
    }
  }

  // View mode - display selected value
  if (mode === 'view' || disabled || column.readonly) {
    return (
      <div className={`min-h-[32px] flex items-center ${className}`}>
        <span className="text-sm">
          {currentOption?.label || value || column.placeholder || 'Select...'}
        </span>
      </div>
    )
  }

  // Edit mode - dropdown
  if (isEditing) {
    return (
      <div className={`min-h-[32px] flex items-center ${className}`}>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-full justify-between"
              disabled={disabled}
            >
              <span className="truncate">
                {currentOption?.label || column.placeholder || 'Select...'}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[200px]">
            {options.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleOptionSelect(option.value)}
                className="flex items-center justify-between"
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Dialog mode - display with row edit trigger
  if (editMode === 'dialog' || (editMode === 'both' && column.rowEditTrigger)) {
    return (
      <div className={`min-h-[32px] flex items-center justify-between group ${className}`}>
        <div className="flex-1 min-w-0">
          <span className="text-sm truncate">
            {currentOption?.label || value || column.placeholder || 'Select...'}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleEditStart}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit2 className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  // Edit mode - display with edit button
  return (
    <div className={`min-h-[32px] flex items-center justify-between group ${className}`}>
      <div className="flex-1 min-w-0">
        <span className="text-sm truncate">
          {currentOption?.label || value || column.placeholder || 'Select...'}
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleEditStart}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit2 className="h-3 w-3" />
      </Button>
    </div>
  )
}

