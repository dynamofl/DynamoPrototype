import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AILoader } from '@/components/ui/ai-loader'
import { Lock, Globe, SkipForward, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '../lib/useProjects'
import type { V2Project, ProjectVisibility } from '../types/project'

type OnboardingStep = 'create' | 'permissions'

interface OnboardingFlowProps {
  onComplete: (project: V2Project) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { createProject, error } = useProjects()

  const [step, setStep] = useState<OnboardingStep>('create')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  // Collected data across steps
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState<ProjectVisibility>('private')

  // Fade in on mount and after step transition
  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(timer)
    }
  }, [isTransitioning, step])

  const transitionToStep = (nextStep: OnboardingStep) => {
    setIsVisible(false)
    setIsTransitioning(true)

    setTimeout(() => {
      setStep(nextStep)
      setIsTransitioning(false)
      setIsVisible(false)
    }, 150)
  }

  const handleContinue = () => {
    if (!name.trim()) return
    transitionToStep('permissions')
  }

  const handleOpenProject = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
    const project = await createProject(name.trim(), undefined, visibility)
    setIsSubmitting(false)

    if (project) {
      onComplete(project)
    }
  }

  const handleSkip = async () => {
    if (!name.trim()) return

    setIsSubmitting(true)
    const project = await createProject(name.trim(), undefined, 'private')
    setIsSubmitting(false)

    if (project) {
      onComplete(project)
    }
  }

  return (
    <div className="flex justify-center min-h-[calc(100vh-56px)] px-6 pt-[30vh]">
      <div
        className={cn(
          "w-full max-w-[480px] space-y-8 duration-highlight-out transition-[opacity,transform]",
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-[0.99]"
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.6, 0.04, 0.98, 0.34)' }}
      >
        {/* Step 1: Create Project */}
        {step === 'create' && (
          <>
            <div className="space-y-1">
              <h2 className="text-sm font-450 text-gray-900">
                Create Your First Project
              </h2>
              <p className="text-[0.8125rem] text-gray-600">
                Set up a new project to organize your AI models and evaluations.
              </p>
            </div>

            <div className="space-y-2">
              <Input
                id="onboarding-project-name"
                placeholder="e.g., Production Safety Testing"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={handleContinue}
                disabled={!name.trim()}
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Share Permissions */}
        {step === 'permissions' && (
          <>
            <div className="space-y-1">
              <h2 className="text-sm font-450 text-gray-900">
                Share Permissions
              </h2>
              <p className="text-[0.8125rem] text-gray-600">
                Choose who can access this project.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Visibility</Label>
              <RadioGroup
                value={visibility}
                onValueChange={(val) => setVisibility(val as ProjectVisibility)}
              >
                <div className="space-y-3">
                  <div
                    className="flex items-start space-x-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => setVisibility('private')}
                  >
                    <RadioGroupItem value="private" id="visibility-private" className="mt-1" />
                    <div className="flex-1">
                      <label htmlFor="visibility-private" className="text-sm font-450 text-gray-900 cursor-pointer flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" />
                        Private
                      </label>
                      <p className="text-[0.8125rem] text-gray-600 mt-1">
                        Only you can access this project. You can invite specific people later.
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex items-start space-x-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 transition-colors cursor-pointer"
                    onClick={() => setVisibility('public')}
                  >
                    <RadioGroupItem value="public" id="visibility-public" className="mt-1" />
                    <div className="flex-1">
                      <label htmlFor="visibility-public" className="text-sm font-450 text-gray-900 cursor-pointer flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Public
                      </label>
                      <p className="text-[0.8125rem] text-gray-600 mt-1">
                        Anyone on your team can view this project and its evaluations.
                      </p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <p className="text-[0.8125rem] text-red-600">{error}</p>
            )}

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => transitionToStep('create')}
                disabled={isSubmitting}
                className="text-gray-500 flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="text-gray-500 flex items-center gap-1.5"
                >
                  <SkipForward className="h-3.5 w-3.5" />
                  Skip for Now
                </Button>
                <Button
                  type="button"
                  onClick={handleOpenProject}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <AILoader size={14} className="mr-2" />}
                  {isSubmitting ? 'Creating...' : 'Open Project'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
