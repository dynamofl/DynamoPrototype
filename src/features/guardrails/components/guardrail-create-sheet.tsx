/**
 * GuardrailCreateSheet component for adding new guardrails
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ViewEditSheet } from '@/components/patterns'
import type { TableRow } from '@/types/table'

export interface GuardrailCreateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGuardrailCreated: (guardrail: TableRow) => void
}

export function GuardrailCreateSheet({
  open,
  onOpenChange,
  onGuardrailCreated
}: GuardrailCreateSheetProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    allowedBehavior: '',
    disallowedBehavior: ''
  })
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      type: '',
      allowedBehavior: '',
      disallowedBehavior: ''
    })
    setValidationError('')
    setActiveTab('allowed')
  }

  const handleSheetOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      resetForm()
    }
  }

  // Handle textarea input with bullet points
  const handleBehaviorChange = (
    field: 'allowedBehavior' | 'disallowedBehavior',
    value: string
  ) => {
    // Check if this is a paste operation (large change in content)
    const isPaste = Math.abs(value.length - formData[field].length) > 1

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
      setFormData({ ...formData, [field]: formattedLines.join('\n') })
    } else {
      // If the field is empty and user starts typing, add a bullet
      if (formData[field] === '' && value.length === 1 && value !== '•') {
        setFormData({ ...formData, [field]: `• ${value}` })
      } else {
        setFormData({ ...formData, [field]: value })
      }
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    field: 'allowedBehavior' | 'disallowedBehavior'
  ) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const currentValue = formData[field]

      if (e.shiftKey) {
        // Shift + Enter: Add a line break without bullet
        e.preventDefault()
        const newValue =
          currentValue.substring(0, cursorPosition) +
          '\n' +
          currentValue.substring(cursorPosition)

        setFormData({ ...formData, [field]: newValue })

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

        setFormData({ ...formData, [field]: newValue })

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

  const allowedCount = countBehaviors(formData.allowedBehavior)
  const disallowedCount = countBehaviors(formData.disallowedBehavior)

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

    if (!formData.category) {
      setValidationError('Category is required')
      return
    }

    if (!formData.type) {
      setValidationError('Type is required')
      return
    }

    setValidationError('')

    // Create new guardrail
    const newGuardrail: TableRow = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      type: formData.type,
      allowedBehavior: formData.allowedBehavior.trim(),
      disallowedBehavior: formData.disallowedBehavior.trim(),
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    onGuardrailCreated(newGuardrail)
    handleSheetOpenChange(false)
  }

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={handleSheetOpenChange}
      title="Create New Policy"
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button onClick={handleCreateGuardrail}>
            Create Guardrail
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSheetOpenChange(false)}
          >
            Cancel
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardrail-type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
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
            <Label htmlFor="guardrail-category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
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
          <Label htmlFor="guardrail-description">Description</Label>
          <Textarea
            id="guardrail-description"
            placeholder="Brief description of the guardrail"
            className="min-h-[120px] max-h-[200px] resize-none overflow-y-auto"
            style={{ height: 'auto', minHeight: '120px' }}
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value })
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
                value={formData.allowedBehavior}
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
                value={formData.disallowedBehavior}
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

        {validationError && (
          <div className="text-[0.8125rem]  text-red-600 bg-red-50 p-3 rounded-md">
            {validationError}
          </div>
        )}
      </div>
    </ViewEditSheet>
  )
}
