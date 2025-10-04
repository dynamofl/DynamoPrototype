/**
 * GuardrailEditSheet component for editing guardrail details
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  const [activeTab, setActiveTab] = useState('allowed')

  const categoryOptions = [
    { value: 'Content', label: 'Content' },
    { value: 'Safety', label: 'Safety' },
    { value: 'PII Detection', label: 'PII Detection' },
    { value: 'Key Word Detection', label: 'Key Word Detection' },
    { value: 'Hallucination Detection', label: 'Hallucination Detection' }
  ]

  const typeOptions = [
    { value: 'Input Policy', label: 'Input Policy' },
    { value: 'Output Policy', label: 'Output Policy' }
  ]

  // Initialize state when guardrail changes
  useEffect(() => {
    if (guardrail) {
      setEditingGuardrail({ ...guardrail })
      setValidationError('')
    }
  }, [guardrail])

  // Handle textarea input with bullet points
  const handleBehaviorChange = (
    field: 'allowedBehavior' | 'disallowedBehavior',
    value: string
  ) => {
    if (!editingGuardrail) return

    const currentValue = (editingGuardrail[field] as string) || ''
    // Check if this is a paste operation (large change in content)
    const isPaste = Math.abs(value.length - currentValue.length) > 1

    if (isPaste) {
      // Parse pasted content and add bullets to each line
      const lines = value.split('\n')
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('•')) {
          return `• ${trimmedLine}`
        }
        return line
      })
      setEditingGuardrail({ ...editingGuardrail, [field]: formattedLines.join('\n') })
    } else {
      // If the field is empty and user starts typing, add a bullet
      if (currentValue === '' && value.length === 1 && value !== '•') {
        setEditingGuardrail({ ...editingGuardrail, [field]: `• ${value}` })
      } else {
        setEditingGuardrail({ ...editingGuardrail, [field]: value })
      }
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    field: 'allowedBehavior' | 'disallowedBehavior'
  ) => {
    if (e.key === 'Enter' && editingGuardrail) {
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const currentValue = (editingGuardrail[field] as string) || ''

      if (e.shiftKey) {
        // Shift + Enter: Add a line break without bullet
        e.preventDefault()
        const newValue =
          currentValue.substring(0, cursorPosition) +
          '\n' +
          currentValue.substring(cursorPosition)

        setEditingGuardrail({ ...editingGuardrail, [field]: newValue })

        // Set cursor position after the line break
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
          // Auto-grow and scroll to cursor
          textarea.style.height = 'auto'
          textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px'
          textarea.scrollTop = textarea.scrollHeight
        }, 0)
      } else {
        // Enter: Add a new bullet point
        e.preventDefault()
        const newValue =
          currentValue.substring(0, cursorPosition) +
          '\n• ' +
          currentValue.substring(cursorPosition)

        setEditingGuardrail({ ...editingGuardrail, [field]: newValue })

        // Set cursor position after the bullet
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 3
          // Auto-grow and scroll to cursor
          textarea.style.height = 'auto'
          textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px'
          textarea.scrollTop = textarea.scrollHeight
        }, 0)
      }
    }
  }

  // Count number of behaviors (non-empty bullet points)
  const countBehaviors = (text: string): number => {
    if (!text.trim()) return 0
    const lines = text.split('\n').filter(line => line.trim().startsWith('•') && line.trim().length > 1)
    return lines.length
  }

  const allowedCount = countBehaviors((editingGuardrail?.allowedBehavior as string) || '')
  const disallowedCount = countBehaviors((editingGuardrail?.disallowedBehavior as string) || '')

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

    if (!editingGuardrail.category) {
      setValidationError('Category is required')
      return
    }

    if (!editingGuardrail.type) {
      setValidationError('Type is required')
      return
    }

    setValidationError('')

    // Update guardrail
    const updatedGuardrail: TableRow = {
      ...editingGuardrail,
      name: editingGuardrail.name.trim(),
      description: editingGuardrail.description.trim(),
      category: editingGuardrail.category,
      type: editingGuardrail.type,
      allowedBehavior: (editingGuardrail.allowedBehavior as string || '').trim(),
      disallowedBehavior: (editingGuardrail.disallowedBehavior as string || '').trim(),
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
      title="Edit Policy"
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button onClick={handleUpdateGuardrail}>
            Update Guardrail
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="edit-guardrail-name">Name</Label>
          <Input
            id="edit-guardrail-name"
            placeholder="Enter guardrail name"
            value={editingGuardrail.name || ''}
            onChange={(e) => setEditingGuardrail({ ...editingGuardrail, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-guardrail-type">Type</Label>
            <Select
              value={editingGuardrail.type || ''}
              onValueChange={(value) => setEditingGuardrail({ ...editingGuardrail, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-guardrail-category">Category</Label>
            <Select
              value={editingGuardrail.category || ''}
              onValueChange={(value) => setEditingGuardrail({ ...editingGuardrail, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
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
          <Textarea
            id="edit-guardrail-description"
            placeholder="Brief description of the guardrail"
            className="min-h-[120px] max-h-[200px] resize-none overflow-y-auto"
            style={{ height: 'auto', minHeight: '120px' }}
            value={editingGuardrail.description || ''}
            onChange={(e) => {
              setEditingGuardrail({ ...editingGuardrail, description: e.target.value })
              // Auto-grow textarea
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Behavior</Label>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="allowed">
                Allowed Behavior {allowedCount > 0 && `(${allowedCount})`}
              </TabsTrigger>
              <TabsTrigger value="disallowed">
                Disallowed Behavior {disallowedCount > 0 && `(${disallowedCount})`}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="allowed" className="mt-4">
              <Textarea
                placeholder="• Start typing allowed behaviors&#10;"
                className="min-h-[240px] max-h-[400px] text-[0.8125rem]  resize-none overflow-y-auto"
                style={{ height: 'auto', minHeight: '240px' }}
                value={(editingGuardrail.allowedBehavior as string) || ''}
                onChange={(e) => {
                  handleBehaviorChange('allowedBehavior', e.target.value)
                  // Auto-grow textarea
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 400) + 'px'
                }}
                onKeyDown={(e) => handleKeyDown(e, 'allowedBehavior')}
              />
              <p className="text-xs text-gray-500 mt-2">
                Press Enter for new bullet point, Shift + Enter for line break.
              </p>
            </TabsContent>

            <TabsContent value="disallowed" className="mt-4">
              <Textarea
                placeholder="• Start typing disallowed behaviors&#10;"
                className="min-h-[240px] max-h-[400px] text-[0.8125rem]  resize-none overflow-y-auto"
                style={{ height: 'auto', minHeight: '240px' }}
                value={(editingGuardrail.disallowedBehavior as string) || ''}
                onChange={(e) => {
                  handleBehaviorChange('disallowedBehavior', e.target.value)
                  // Auto-grow textarea
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.min(e.target.scrollHeight, 400) + 'px'
                }}
                onKeyDown={(e) => handleKeyDown(e, 'disallowedBehavior')}
              />
              <p className="text-xs text-gray-500 mt-2">
                Press Enter for new bullet point, Shift + Enter for line break.
              </p>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-guardrail-status">Status</Label>
          <Select
            value={editingGuardrail.status || 'active'}
            onValueChange={(value) => setEditingGuardrail({ ...editingGuardrail, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {validationError && (
          <div className="text-[0.8125rem]  text-red-600 bg-red-50 p-3 rounded-md">
            {validationError}
          </div>
        )}
      </div>
    </ViewEditSheet>
  )
}
