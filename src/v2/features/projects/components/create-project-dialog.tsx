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
import {
  Lock,
  Globe,
  Headset,
  MessageCircleQuestion,
  BookOpenText,
  TrendingUp,
  ShieldCheck,
  CircleHelp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '../lib/useProjects'
import type { ProjectVisibility, UseCase } from '../types/project'
import { serializeUseCase } from '../types/project'

/* ------------------------------------------------------------------ */
/*  Use case definitions                                               */
/* ------------------------------------------------------------------ */
const USE_CASES: { id: string; name: string; description: string; icon: typeof Headset }[] = [
  { id: 'call-centre', name: 'Call Centre', description: 'Voice and chat agent quality monitoring', icon: Headset },
  { id: 'customer-faqs', name: 'Customer FAQs', description: 'Automated customer support and Q&A', icon: MessageCircleQuestion },
  { id: 'knowledge-management', name: 'Knowledge Management', description: 'Internal knowledge retrieval and search', icon: BookOpenText },
  { id: 'investment-management', name: 'Investment Management', description: 'Financial analysis and portfolio insights', icon: TrendingUp },
  { id: 'compliance', name: 'Compliance & Safety', description: 'Policy enforcement and content moderation', icon: ShieldCheck },
  { id: 'other', name: 'Other', description: '', icon: CircleHelp },
]

interface CreateProjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated?: () => void
}

export function CreateProjectDialog({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) {
  const { createProject } = useProjects()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<ProjectVisibility>('private')

  // Custom use case overlay state
  const [customDialogOpen, setCustomDialogOpen] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')

  const handleUseCaseClick = (id: string) => {
    if (id === 'other') {
      setCustomDialogOpen(true)
      return
    }
    const uc = USE_CASES.find((u) => u.id === id)
    if (uc) {
      setSelectedId(id)
      setSelectedUseCase({ name: uc.name, description: uc.description })
    }
  }

  const handleCustomSave = () => {
    if (!customName.trim()) return
    setSelectedId('other')
    setSelectedUseCase({
      name: customName.trim(),
      description: customDescription.trim(),
    })
    setCustomDialogOpen(false)
    setCustomName('')
    setCustomDescription('')
  }

  const handleSubmit = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
    const useCaseStr = selectedUseCase ? serializeUseCase(selectedUseCase) : undefined
    const project = await createProject(name.trim(), useCaseStr, visibility)
    setIsSubmitting(false)

    if (project) {
      resetForm()
      onOpenChange(false)
      onProjectCreated?.()
    }
  }

  const resetForm = () => {
    setName('')
    setSelectedUseCase(null)
    setSelectedId(null)
    setCustomName('')
    setCustomDescription('')
    setCustomDialogOpen(false)
    setVisibility('private')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) resetForm()
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <DialogBody size="lg" scrollable>
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

            {/* Use Case */}
            <div className="space-y-1.5">
              <Label className="text-[0.8125rem] font-450">Use Case</Label>
              <div className="grid grid-cols-3 gap-2">
                {USE_CASES.map((uc) => {
                  const Icon = uc.icon
                  const isSelected = selectedId === uc.id
                  return (
                    <button
                      key={uc.id}
                      type="button"
                      onClick={() => handleUseCaseClick(uc.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border transition-colors text-center',
                        isSelected
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 bg-gray-0 hover:border-gray-300',
                        uc.id === 'other' && !isSelected && 'border-dashed'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4',
                          isSelected ? 'text-gray-800' : 'text-gray-400'
                        )}
                        strokeWidth={1.5}
                      />
                      <span
                        className={cn(
                          'text-[0.75rem] font-[450]',
                          isSelected ? 'text-gray-900' : 'text-gray-600'
                        )}
                      >
                        {uc.id === 'other' && isSelected && selectedUseCase
                          ? selectedUseCase.name
                          : uc.name}
                      </span>
                    </button>
                  )
                })}
              </div>
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

      {/* Custom use case overlay */}
      <Dialog open={customDialogOpen} onOpenChange={setCustomDialogOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Custom Use Case</DialogTitle>
          </DialogHeader>
          <DialogBody size="sm">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[0.8125rem] font-450">Name</Label>
                <Input
                  placeholder="e.g., Legal Document Review"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[0.8125rem] font-450">
                  Description
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </Label>
                <Input
                  placeholder="Brief description of the use case"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCustomSave()
                  }}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setCustomDialogOpen(false)
                  setCustomName('')
                  setCustomDescription('')
                }}
                className="h-8 px-3 text-[0.8125rem] font-450"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCustomSave}
                disabled={!customName.trim()}
                className="h-8 px-3 text-[0.8125rem] font-450"
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
