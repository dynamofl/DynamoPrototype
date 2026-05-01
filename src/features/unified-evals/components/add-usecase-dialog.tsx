import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { UsecaseOption } from '../types'

interface AddUsecaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (usecase: UsecaseOption) => void
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function AddUsecaseDialog({
  open,
  onOpenChange,
  onSave,
}: AddUsecaseDialogProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) {
      setName('')
      setDescription('')
    }
  }, [open])

  const canSave = name.trim().length > 0 && description.trim().length > 0

  const handleSave = () => {
    if (!canSave) return
    const trimmedName = name.trim()
    onSave({
      value: `custom-${slugify(trimmedName)}-${Date.now()}`,
      label: trimmedName,
      description: description.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your own Use Case</DialogTitle>
        </DialogHeader>
        <DialogBody scrollable={false} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="usecase-name" className="text-sm text-gray-900">
              Use Case Name
            </Label>
            <Input
              id="usecase-name"
              placeholder="Example: Q&A Chatbot"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="usecase-description"
              className="text-sm text-gray-900"
            >
              Use Case Description
            </Label>
            <Textarea
              id="usecase-description"
              placeholder="Example: AI system used for answering common customer questions"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save & Select Use Case
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
