/**
 * GuardrailCreateDialog component for adding new guardrails
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreateDialog } from '@/components/patterns'
import type { TableRow } from '@/types/table'

export interface GuardrailCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGuardrailCreated: (guardrail: TableRow) => void
}

export function GuardrailCreateDialog({ 
  open, 
  onOpenChange, 
  onGuardrailCreated 
}: GuardrailCreateDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    content: '',
    category: ''
  })
  const [validationError, setValidationError] = useState('')

  const categoryOptions = [
    { value: 'Safety', label: 'Safety' },
    { value: 'Privacy', label: 'Privacy' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Quality', label: 'Quality' },
    { value: 'Security', label: 'Security' },
    { value: 'Ethics', label: 'Ethics' }
  ]

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      content: '',
      category: ''
    })
    setValidationError('')
  }

  const handleDialogOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      resetForm()
    }
  }

  const handleCreateGuardrail = () => {
    // Validation
    if (!formData.name.trim()) {
      setValidationError('Guardrail name is required')
      return
    }

    if (!formData.description.trim()) {
      setValidationError('Description is required')
      return
    }

    if (!formData.content.trim()) {
      setValidationError('Guardrail content is required')
      return
    }

    if (!formData.category) {
      setValidationError('Category is required')
      return
    }

    setValidationError('')

    // Create new guardrail
    const newGuardrail: TableRow = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      content: formData.content.trim(),
      category: formData.category,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    onGuardrailCreated(newGuardrail)
    handleDialogOpenChange(false)
  }

  return (
    <CreateDialog
      trigger={<div />} // Empty trigger since we handle it externally
      title="Create New Guardrail"
      description="Define a new guardrail to ensure your AI systems follow specific rules and guidelines."
      open={open}
      onOpenChange={handleDialogOpenChange}
      maxWidth="lg"
      actionFooter={
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => handleDialogOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateGuardrail}
          >
            Create Guardrail
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardrail-name">Name</Label>
            <Input
              id="guardrail-name"
              placeholder="Enter guardrail name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guardrail-category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
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
          <Label htmlFor="guardrail-description">Description</Label>
          <Input
            id="guardrail-description"
            placeholder="Brief description of the guardrail"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardrail-content">Guardrail Content</Label>
          <Textarea
            id="guardrail-content"
            placeholder="Enter the detailed guardrail rules and content..."
            className="min-h-[120px]"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Define the specific rules, guidelines, or restrictions that this guardrail will enforce.
          </p>
        </div>

        {validationError && (
          <div className="text-[13px] text-red-600 bg-red-50 p-3 rounded-md">
            {validationError}
          </div>
        )}
      </div>
    </CreateDialog>
  )
}
