/**
 * Row edit dialog component for editing entire rows
 */

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { TableColumn, TableRow } from '@/types/table'

interface RowEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  row: TableRow | null
  columns: TableColumn[]
  title: string
  description: string
  onSave: (row: TableRow) => void
  onCancel: () => void
}

export function RowEditDialog({
  open,
  onOpenChange,
  row,
  columns,
  title,
  description,
  onSave,
  onCancel
}: RowEditDialogProps) {
  const [editedRow, setEditedRow] = useState<TableRow | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize edited row when dialog opens
  useEffect(() => {
    if (open && row) {
      setEditedRow({ ...row })
      setErrors({})
    }
  }, [open, row])

  // Handle field change
  const handleFieldChange = (key: string, value: any) => {
    if (!editedRow) return

    setEditedRow(prev => ({
      ...prev!,
      [key]: value
    }))

    // Clear error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    if (!editedRow) return false

    const newErrors: Record<string, string> = {}

    columns.forEach(column => {
      if (column.type === 'button' || column.type === 'expand') return

      const value = editedRow[column.key]
      
      // Check validation function
      if (column.validation && !column.validation(value)) {
        newErrors[column.key] = `Invalid ${column.title.toLowerCase()}`
      }

      // Check required fields (basic validation)
      if (!value && column.key !== 'id' && !column.placeholder?.includes('optional')) {
        newErrors[column.key] = `${column.title} is required`
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = () => {
    if (!editedRow) return

    if (validateForm()) {
      onSave(editedRow)
      onOpenChange(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setEditedRow(null)
    setErrors({})
    onCancel()
    onOpenChange(false)
  }

  // Render field based on column type
  const renderField = (column: TableColumn) => {
    if (!editedRow || column.type === 'button' || column.type === 'expand') return null

    const value = editedRow[column.key]
    const hasError = !!errors[column.key]

    switch (column.type) {
      case 'freeText':
        return column.multiline ? (
          <Textarea
            value={value || ''}
            onChange={(e) => handleFieldChange(column.key, e.target.value)}
            placeholder={column.placeholder}
            className={hasError ? 'border-red-500' : ''}
            rows={3}
          />
        ) : (
          <Input
            value={value || ''}
            onChange={(e) => handleFieldChange(column.key, e.target.value)}
            placeholder={column.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'dropdown':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => handleFieldChange(column.key, newValue)}
          >
            <SelectTrigger className={hasError ? 'border-red-500' : ''}>
              <SelectValue placeholder={column.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {column.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldChange(column.key, checked)}
            />
            <Label>
              {column.switchLabel ? column.switchLabel(Boolean(value)) : (Boolean(value) ? 'Yes' : 'No')}
            </Label>
          </div>
        )

      case 'badge':
        return (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {value || 'N/A'}
            </Badge>
            <span className="text-sm text-gray-500">
              (Display only)
            </span>
          </div>
        )

      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleFieldChange(column.key, e.target.value)}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      case 'icon':
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleFieldChange(column.key, e.target.value)}
            placeholder={column.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        )

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => handleFieldChange(column.key, e.target.value)}
            placeholder={column.placeholder}
            className={hasError ? 'border-red-500' : ''}
          />
        )
    }
  }

  if (!editedRow) return null

  // Filter out action columns and expand columns for the dialog
  const editableColumns = columns.filter(col => 
    col.type !== 'button' && 
    col.type !== 'expand' && 
    !col.readonly
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {editableColumns.map((column) => (
              <div key={column.key} className="space-y-2">
                <Label htmlFor={column.key} className="text-sm font-medium">
                  {column.title}
                  {column.validation && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {renderField(column)}
                {errors[column.key] && (
                  <p className="text-sm text-red-500">{errors[column.key]}</p>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
