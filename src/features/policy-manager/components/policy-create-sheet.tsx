/**
 * PolicyCreateSheet component for adding new policies
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ViewEditSheet } from '@/components/patterns'
import type { TableRow } from '@/types/table'
import { POLICY_CATEGORY_OPTIONS, POLICY_TYPE_OPTIONS } from '../constants'

export interface PolicyCreateSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPolicyCreated: (policy: TableRow) => void
}

export function PolicyCreateSheet({
  open,
  onOpenChange,
  onPolicyCreated
}: PolicyCreateSheetProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    version: '1.0',
    effectiveDate: '',
    owner: '',
    content: ''
  })
  const [validationError, setValidationError] = useState('')

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      type: '',
      version: '1.0',
      effectiveDate: '',
      owner: '',
      content: ''
    })
    setValidationError('')
  }

  const handleSheetOpenChange = (open: boolean) => {
    onOpenChange(open)
    if (!open) {
      resetForm()
    }
  }

  const handleContentChange = (value: string) => {
    const isPaste = Math.abs(value.length - formData.content.length) > 1

    if (isPaste) {
      const lines = value.split('\n')
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('•')) {
          return `• ${trimmedLine}`
        }
        return line
      })
      setFormData({ ...formData, content: formattedLines.join('\n') })
    } else {
      if (formData.content === '' && value.length === 1 && value !== '•') {
        setFormData({ ...formData, content: `• ${value}` })
      } else {
        setFormData({ ...formData, content: value })
      }
    }
  }

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const currentValue = formData.content

      if (e.shiftKey) {
        e.preventDefault()
        const newValue =
          currentValue.substring(0, cursorPosition) +
          '\n' +
          currentValue.substring(cursorPosition)

        setFormData({ ...formData, content: newValue })

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
          textarea.style.height = 'auto'
          textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px'
          textarea.scrollTop = textarea.scrollHeight
        }, 0)
      } else {
        e.preventDefault()
        const newValue =
          currentValue.substring(0, cursorPosition) +
          '\n• ' +
          currentValue.substring(cursorPosition)

        setFormData({ ...formData, content: newValue })

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 3
          textarea.style.height = 'auto'
          textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px'
          textarea.scrollTop = textarea.scrollHeight
        }, 0)
      }
    }
  }

  const handleCreatePolicy = () => {
    if (!formData.name.trim()) {
      setValidationError('Policy name is required')
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

    if (!formData.owner.trim()) {
      setValidationError('Owner is required')
      return
    }

    setValidationError('')

    const newPolicy: TableRow = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      category: formData.category,
      type: formData.type,
      version: formData.version || '1.0',
      effectiveDate: formData.effectiveDate || new Date().toISOString().split('T')[0],
      owner: formData.owner.trim(),
      content: formData.content.trim(),
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }

    onPolicyCreated(newPolicy)
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
          <Button onClick={handleCreatePolicy}>
            Create Policy
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
          <Label htmlFor="policy-name">Name</Label>
          <Input
            id="policy-name"
            placeholder="Enter policy name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="policy-category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {POLICY_CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy-type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {POLICY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy-version">Version</Label>
            <Input
              id="policy-version"
              placeholder="e.g., 1.0"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="policy-owner">Owner</Label>
            <Input
              id="policy-owner"
              placeholder="e.g., john.doe@company.com"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy-effective-date">Effective Date</Label>
            <Input
              id="policy-effective-date"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="policy-description">Description</Label>
          <Textarea
            id="policy-description"
            placeholder="Brief description of the policy"
            className="min-h-[120px] max-h-[200px] resize-none overflow-y-auto"
            style={{ height: 'auto', minHeight: '120px' }}
            value={formData.description}
            onChange={(e) => {
              setFormData({ ...formData, description: e.target.value })
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
            }}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Policy Rules</Label>
          <Textarea
            placeholder="• Start typing policy rules&#10;"
            className="min-h-[240px] max-h-[400px] text-[0.8125rem] resize-none overflow-y-auto"
            style={{ height: 'auto', minHeight: '240px' }}
            value={formData.content}
            onChange={(e) => {
              handleContentChange(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 400) + 'px'
            }}
            onKeyDown={handleContentKeyDown}
          />
          <p className="text-xs text-gray-500 mt-2">
            Press Enter for new bullet point, Shift + Enter for line break.
          </p>
        </div>

        {validationError && (
          <div className="text-[0.8125rem] text-red-600 bg-red-50 p-3 rounded-md">
            {validationError}
          </div>
        )}
      </div>
    </ViewEditSheet>
  )
}
