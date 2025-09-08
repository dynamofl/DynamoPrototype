/**
 * Free text cell component for editable text input
 */

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Check, X, Edit2 } from 'lucide-react'
import type { CellProps } from '@/types/table'

interface FreeTextCellProps extends CellProps {
  multiline?: boolean
  maxLength?: number
  validation?: (value: string) => boolean
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
  editMode = 'inline'
}: FreeTextCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (multiline) {
        inputRef.current.select()
      }
    }
  }, [isEditing, multiline])

  // Handle edit start
  const handleEditStart = () => {
    if (mode === 'edit' && !disabled && !column.readonly) {
      if (editMode === 'dialog' || (editMode === 'both' && column.rowEditTrigger)) {
        onRowEdit?.(row)
      } else {
        setEditValue(value || '')
        setError(null)
        setIsEditing(true)
      }
    }
  }

  // Handle edit cancel
  const handleEditCancel = () => {
    setEditValue(value || '')
    setError(null)
    setIsEditing(false)
  }

  // Handle edit save
  const handleEditSave = () => {
    // Validate if validation function provided
    if (validation && !validation(editValue)) {
      setError('Invalid value')
      return
    }

    // Check max length
    if (maxLength && editValue.length > maxLength) {
      setError(`Maximum length is ${maxLength} characters`)
      return
    }

    // Save the value
    onChange?.(editValue)
    setError(null)
    setIsEditing(false)
  }

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault()
      handleEditSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleEditCancel()
    }
  }

  // Handle blur
  const handleBlur = () => {
    if (isEditing) {
      handleEditSave()
    }
  }

  // View mode - display value
  if (mode === 'view' || disabled || column.readonly) {
    return (
      <div className={`min-h-[32px] flex items-center ${className}`}>
        {multiline ? (
          <div className="whitespace-pre-wrap text-sm">
            {value || column.placeholder || ''}
          </div>
        ) : (
          <span className="text-sm truncate">
            {value || column.placeholder || ''}
          </span>
        )}
      </div>
    )
  }

  // Edit mode - inline editing
  if (isEditing) {
    return (
      <div className={`min-h-[32px] flex items-center gap-1 ${className}`}>
        {multiline ? (
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            placeholder={column.placeholder}
            maxLength={maxLength}
            className="min-h-[60px] resize-none"
            rows={3}
          />
        ) : (
          <Input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            placeholder={column.placeholder}
            maxLength={maxLength}
            className="h-8"
          />
        )}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEditSave}
            className="h-6 w-6 p-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleEditCancel}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        {error && (
          <div className="text-xs text-red-500 mt-1">
            {error}
          </div>
        )}
      </div>
    )
  }

  // Dialog mode - display with row edit trigger
  if (editMode === 'dialog' || (editMode === 'both' && column.rowEditTrigger)) {
    return (
      <div className={`min-h-[32px] flex items-center justify-between group ${className}`}>
        <div className="flex-1 min-w-0">
          {multiline ? (
            <div className="whitespace-pre-wrap text-sm">
              {value || column.placeholder || ''}
            </div>
          ) : (
            <span className="text-sm truncate">
              {value || column.placeholder || ''}
            </span>
          )}
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
        {multiline ? (
          <div className="whitespace-pre-wrap text-sm">
            {value || column.placeholder || ''}
          </div>
        ) : (
          <span className="text-sm truncate">
            {value || column.placeholder || ''}
          </span>
        )}
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

