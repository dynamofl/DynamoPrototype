/**
 * Switch cell component for boolean values
 */

import React from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
      if (editMode === 'dialog' || (editMode === 'both' && column.rowEditTrigger)) {
        onRowEdit?.(row)
      } else {
        onChange?.(checked)
      }
    }
  }

  // View mode - display value
  if (mode === 'view' || disabled || column.readonly) {
    return (
      <div className={`min-h-[32px] flex items-center ${className}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isChecked ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-sm">{label}</span>
        </div>
      </div>
    )
  }

  // Edit mode - interactive switch
  return (
    <div className={`min-h-[32px] flex items-center ${className}`}>
      <div className="flex items-center gap-2">
        <Switch
          checked={isChecked}
          onCheckedChange={handleSwitchChange}
          disabled={disabled}
          className="data-[state=checked]:bg-green-600"
        />
        <Label className="text-sm cursor-pointer" onClick={() => handleSwitchChange(!isChecked)}>
          {label}
        </Label>
      </div>
    </div>
  )
}

