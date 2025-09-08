/**
 * GuardrailEditSheet component for editing guardrail details
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ViewEditSheet } from '@/components/patterns'
import type { TableRow } from '@/types/table'

export interface GuardrailEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  guardrail: TableRow | null
  onGuardrailUpdated: (guardrail: TableRow) => void
}

export function GuardrailEditSheet({ 
  open, 
  onOpenChange, 
  guardrail, 
  onGuardrailUpdated 
}: GuardrailEditSheetProps) {
  const [editingGuardrail, setEditingGuardrail] = useState<TableRow | null>(null)
  const [validationError, setValidationError] = useState('')

  const categoryOptions = [
    { value: 'Safety', label: 'Safety' },
    { value: 'Privacy', label: 'Privacy' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Quality', label: 'Quality' },
    { value: 'Security', label: 'Security' },
    { value: 'Ethics', label: 'Ethics' }
  ]

  // Initialize state when guardrail changes
  useEffect(() => {
    if (guardrail) {
      setEditingGuardrail({ ...guardrail })
      setValidationError('')
    }
  }, [guardrail])

  const handleUpdateGuardrail = () => {
    if (!editingGuardrail) return

    // Validation
    if (!editingGuardrail.name?.trim()) {
      setValidationError('Guardrail name is required')
      return
    }

    if (!editingGuardrail.description?.trim()) {
      setValidationError('Description is required')
      return
    }

    if (!editingGuardrail.content?.trim()) {
      setValidationError('Guardrail content is required')
      return
    }

    if (!editingGuardrail.category) {
      setValidationError('Category is required')
      return
    }

    setValidationError('')

    // Update guardrail
    const updatedGuardrail: TableRow = {
      ...editingGuardrail,
      name: editingGuardrail.name.trim(),
      description: editingGuardrail.description.trim(),
      content: editingGuardrail.content.trim(),
      category: editingGuardrail.category,
      updatedAt: new Date().toISOString().split('T')[0]
    }

    onGuardrailUpdated(updatedGuardrail)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setEditingGuardrail(null)
    setValidationError('')
  }

  if (!editingGuardrail) return null

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Guardrail"
      description="Modify the settings and content for this guardrail policy."
      size="lg"
    >
      <div className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-guardrail-name">Guardrail Name</Label>
            <Input
              id="edit-guardrail-name"
              placeholder="Enter guardrail name"
              value={editingGuardrail.name || ''}
              onChange={(e) => setEditingGuardrail({ ...editingGuardrail, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-guardrail-category">Category</Label>
            <Select
              value={editingGuardrail.category || ''}
              onValueChange={(value) => setEditingGuardrail({ ...editingGuardrail, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-guardrail-description">Description</Label>
          <Input
            id="edit-guardrail-description"
            placeholder="Brief description of the guardrail"
            value={editingGuardrail.description || ''}
            onChange={(e) => setEditingGuardrail({ ...editingGuardrail, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-guardrail-content">Guardrail Content</Label>
          <Textarea
            id="edit-guardrail-content"
            placeholder="Enter the detailed guardrail rules and content..."
            className="min-h-[120px]"
            value={editingGuardrail.content || ''}
            onChange={(e) => setEditingGuardrail({ ...editingGuardrail, content: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Define the specific rules, guidelines, or restrictions that this guardrail will enforce.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-guardrail-status">Status</Label>
          <Select
            value={editingGuardrail.status || 'active'}
            onValueChange={(value) => setEditingGuardrail({ ...editingGuardrail, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {validationError && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {validationError}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleUpdateGuardrail}
            className="flex-1"
          >
            Update Guardrail
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </ViewEditSheet>
  )
}
