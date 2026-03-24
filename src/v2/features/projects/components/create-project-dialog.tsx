import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Lock, Globe } from 'lucide-react'
import { useProjects } from '../lib/useProjects'
import type { ProjectVisibility } from '../types/project'

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: () => void
}

export function CreateProjectDialog({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) {
  const { createProject } = useProjects()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState<ProjectVisibility>('private')

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
    const project = await createProject(name.trim(), undefined, visibility)
    setIsSubmitting(false)

    if (project) {
      setName('')
      setVisibility('private')
      onOpenChange(false)
      onProjectCreated?.()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName('')
      setVisibility('private')
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <DialogBody size="md" scrollable>
          <div className="space-y-5">
            {/* Project Name */}
            <div className="space-y-1.5">
              <Label htmlFor="dialog-project-name" className="text-[0.8125rem] font-450">
                Project Name
              </Label>
              <Input
                id="dialog-project-name"
                placeholder="Enter project name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                disabled={isSubmitting}
                className="text-[0.8125rem]"
              />
            </div>

            {/* Visibility */}
            <div className="space-y-1.5">
              <Label className="text-[0.8125rem] font-450">Visibility</Label>
              <RadioGroup
                value={visibility}
                onValueChange={(val) => setVisibility(val as ProjectVisibility)}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="flex items-start space-x-2.5 rounded-lg border border-gray-200 px-3 py-2.5 hover:border-gray-300 duration-regular transition-colors cursor-pointer"
                    onClick={() => setVisibility('private')}
                  >
                    <RadioGroupItem value="private" id="dialog-visibility-private" className="mt-0.5" />
                    <div className="flex-1">
                      <label htmlFor="dialog-visibility-private" className="text-[0.8125rem] font-450 text-gray-900 cursor-pointer flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" />
                        Private
                      </label>
                      <p className="text-[0.75rem] text-gray-500 mt-0.5">
                        Only you can access.
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-start space-x-2.5 rounded-lg border border-gray-200 px-3 py-2.5 hover:border-gray-300 duration-regular transition-colors cursor-pointer"
                    onClick={() => setVisibility('public')}
                  >
                    <RadioGroupItem value="public" id="dialog-visibility-public" className="mt-0.5" />
                    <div className="flex-1">
                      <label htmlFor="dialog-visibility-public" className="text-[0.8125rem] font-450 text-gray-900 cursor-pointer flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Public
                      </label>
                      <p className="text-[0.75rem] text-gray-500 mt-0.5">
                        Anyone on your team.
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              className="h-8 px-3 text-[0.8125rem] font-450"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || isSubmitting}
              className="h-8 px-3 text-[0.8125rem] font-450"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
