/**
 * PolicyEditSheet component for editing policy details
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ViewEditSheet } from '@/components/patterns'
import type { TableRow } from '@/types/table'
import { POLICY_CATEGORY_OPTIONS, POLICY_TYPE_OPTIONS } from '../constants'

export interface PolicyEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  policy: TableRow | null
  onPolicyUpdated: (policy: TableRow) => void
}

export function PolicyEditSheet({
  open,
  onOpenChange,
  policy,
  onPolicyUpdated
}: PolicyEditSheetProps) {
  const [editingPolicy, setEditingPolicy] = useState<TableRow | null>(null)
  const [validationError, setValidationError] = useState('')

  useEffect(() => {
    if (policy) {
      setEditingPolicy({ ...policy })
      setValidationError('')
    }
  }, [policy])

  const handleContentChange = (value: string) => {
    if (!editingPolicy) return

    const currentValue = (editingPolicy.content as string) || ''
    const isPaste = Math.abs(value.length - currentValue.length) > 1

    if (isPaste) {
      const lines = value.split('\n')
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('•')) {
          return `• ${trimmedLine}`
        }
        return line
      })
      setEditingPolicy({ ...editingPolicy, content: formattedLines.join('\n') })
    } else {
      if (currentValue === '' && value.length === 1 && value !== '•') {
        setEditingPolicy({ ...editingPolicy, content: `• ${value}` })
      } else {
        setEditingPolicy({ ...editingPolicy, content: value })
      }
    }
  }

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && editingPolicy) {
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const currentValue = (editingPolicy.content as string) || ''

      if (e.shiftKey) {
        e.preventDefault()
        const newValue =
          currentValue.substring(0, cursorPosition) +
          '\n' +
          currentValue.substring(cursorPosition)

        setEditingPolicy({ ...editingPolicy, content: newValue })

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

        setEditingPolicy({ ...editingPolicy, content: newValue })

        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 3
          textarea.style.height = 'auto'
          textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px'
          textarea.scrollTop = textarea.scrollHeight
        }, 0)
      }
    }
  }

  const handleUpdatePolicy = () => {
    if (!editingPolicy) return

    if (!editingPolicy.name?.trim()) {
      setValidationError('Policy name is required')
      return
    }

    if (!editingPolicy.description?.trim()) {
      setValidationError('Description is required')
      return
    }

    if (!editingPolicy.category) {
      setValidationError('Category is required')
      return
    }

    if (!editingPolicy.type) {
      setValidationError('Type is required')
      return
    }

    if (!editingPolicy.owner?.trim()) {
      setValidationError('Owner is required')
      return
    }

    setValidationError('')

    const updatedPolicy: TableRow = {
      ...editingPolicy,
      name: editingPolicy.name.trim(),
      description: editingPolicy.description.trim(),
      category: editingPolicy.category,
      type: editingPolicy.type,
      owner: editingPolicy.owner.trim(),
      content: (editingPolicy.content as string || '').trim(),
      updatedAt: new Date().toISOString().split('T')[0]
    }

    onPolicyUpdated(updatedPolicy)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
    setEditingPolicy(null)
    setValidationError('')
  }

  if (!editingPolicy) return null

  return (
    <ViewEditSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Policy"
      size="lg"
      footer={
        <div className="flex gap-2">
          <Button onClick={handleUpdatePolicy}>
            Update Policy
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
          <Label htmlFor="edit-policy-name">Name</Label>
          <Input
            id="edit-policy-name"
            placeholder="Enter policy name"
            value={editingPolicy.name || ''}
            onChange={(e) => setEditingPolicy({ ...editingPolicy, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-policy-category">Category</Label>
            <Select
              value={editingPolicy.category || ''}
              onValueChange={(value) => setEditingPolicy({ ...editingPolicy, category: value })}
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
            <Label htmlFor="edit-policy-type">Type</Label>
            <Select
              value={editingPolicy.type || ''}
              onValueChange={(value) => setEditingPolicy({ ...editingPolicy, type: value })}
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
            <Label htmlFor="edit-policy-version">Version</Label>
            <Input
              id="edit-policy-version"
              placeholder="e.g., 1.0"
              value={editingPolicy.version || ''}
              onChange={(e) => setEditingPolicy({ ...editingPolicy, version: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-policy-owner">Owner</Label>
            <Input
              id="edit-policy-owner"
              placeholder="e.g., john.doe@company.com"
              value={editingPolicy.owner || ''}
              onChange={(e) => setEditingPolicy({ ...editingPolicy, owner: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-policy-effective-date">Effective Date</Label>
            <Input
              id="edit-policy-effective-date"
              type="date"
              value={editingPolicy.effectiveDate || ''}
              onChange={(e) => setEditingPolicy({ ...editingPolicy, effectiveDate: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-policy-description">Description</Label>
          <Textarea
            id="edit-policy-description"
            placeholder="Brief description of the policy"
            className="min-h-[120px] max-h-[200px] resize-none overflow-y-auto"
            style={{ height: 'auto', minHeight: '120px' }}
            value={editingPolicy.description || ''}
            onChange={(e) => {
              setEditingPolicy({ ...editingPolicy, description: e.target.value })
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
            value={(editingPolicy.content as string) || ''}
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

        <div className="space-y-2">
          <Label htmlFor="edit-policy-status">Status</Label>
          <Select
            value={editingPolicy.status || 'draft'}
            onValueChange={(value) => setEditingPolicy({ ...editingPolicy, status: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
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
