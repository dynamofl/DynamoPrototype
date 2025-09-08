/**
 * Switch cell component matching DynamoTable styling and behavior
 */

import React, { type KeyboardEvent } from 'react'
import { Switch } from '@/components/ui/switch'
import type { CellProps } from '@/types/table'

interface SwitchCellProps extends CellProps {
  switchLabel?: (value: boolean) => string
}

export function SwitchCell({
  value,
  row,
  column,
  mode,
  onChange,
  onRowEdit,
  disabled = false,
  className = '',
  switchLabel,
  editMode = 'inline'
}: SwitchCellProps) {
  const isChecked = Boolean(value)
  const label = switchLabel ? switchLabel(isChecked) : (isChecked ? 'Yes' : 'No')

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    if (mode === 'edit' && !disabled && !column.readonly) {
      if (editMode === 'dialog') {
        onRowEdit?.(row)
      } else {
        onChange?.(checked)
      }
    }
  }

  // Handle keyboard events
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (mode === 'edit' && !disabled && !column.readonly) {
        handleSwitchChange(!isChecked)
      }
    }
  }

  // Handle cell click
  const handleCellClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (mode === 'edit' && !disabled && !column.readonly) {
      handleSwitchChange(!isChecked)
    }
  }

  // View mode - display value (matches DynamoTable styling)
  if (mode === 'view' || disabled || column.readonly) {
    return (
      <div 
        className={`cell-content ${className}`}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
          cursor: 'default',
          outline: 'none',
          border: '1px solid transparent',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <div className="flex items-center space-x-2">
          <Switch
            checked={isChecked}
            onCheckedChange={handleSwitchChange}
            disabled={true}
          />
          {switchLabel && (
            <span className="text-xs text-muted-foreground">
              {label}
            </span>
          )}
        </div>
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
          justifyContent: 'center',
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
        <div className="flex items-center space-x-2">
          <Switch
            checked={isChecked}
            onCheckedChange={handleSwitchChange}
            disabled={true}
          />
          {switchLabel && (
            <span className="text-xs text-muted-foreground">
              {label}
            </span>
          )}
        </div>
      </div>
    )
  }

  // Edit mode - interactive switch (matches DynamoTable styling)
  return (
    <div 
      className={`cell-content ${className}`}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
      onClick={handleCellClick}
    >
      <div className="flex items-center space-x-2">
        <Switch
          checked={isChecked}
          onCheckedChange={handleSwitchChange}
          disabled={disabled || column.readonly}
        />
        {switchLabel && (
          <span className="text-xs text-muted-foreground">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

