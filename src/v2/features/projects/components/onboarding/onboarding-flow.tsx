import { useState, useEffect } from 'react'
import { CircleHelp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProjects } from '../../lib/useProjects'
import type { V2Project, ProjectVisibility, UseCase } from '../../types/project'
import { serializeUseCase } from '../../types/project'
import type { OnboardingStep } from './onboarding-types'
import { USE_CASES } from './onboarding-constants'
import { StepIndicator } from './step-layout'
import { StepCreate } from './step-create'
import { StepUseCase } from './step-usecase'
import { StepProviders, type ProviderConfig } from './step-providers'
import { StepPermissions } from './step-permissions'
import { RightPanel } from './right-panel'

interface OnboardingFlowProps {
  onComplete: (project: V2Project) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { createProject, error } = useProjects()

  const [step, setStep] = useState<OnboardingStep>('create')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const [name, setName] = useState('')
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [visibility, setVisibility] = useState<ProjectVisibility>('private')
  const [providerConfigs, setProviderConfigs] = useState<ProviderConfig[]>([])

  const [customName, setCustomName] = useState('')
  const [customDescription, setCustomDescription] = useState('')

  useEffect(() => {
    if (!isTransitioning) {
      const t = setTimeout(() => setIsVisible(true), 50)
      return () => clearTimeout(t)
    }
  }, [isTransitioning, step])

  const transitionToStep = (next: OnboardingStep) => {
    setIsVisible(false)
    setIsTransitioning(true)
    setTimeout(() => { setStep(next); setIsTransitioning(false); setIsVisible(false) }, 150)
  }

  const handleUseCaseSelect = (id: string) => {
    if (id === 'other') {
      setSelectedId('other')
      setSelectedUseCase(null)
      setCustomName('')
      setCustomDescription('')
      return
    }
    const uc = USE_CASES.find(u => u.id === id)
    if (uc) { setSelectedId(id); setSelectedUseCase({ name: uc.name, description: uc.description }) }
  }

  const handleUseCaseContinue = () => {
    if (selectedId === 'other' && customName.trim()) {
      setSelectedUseCase({ name: customName.trim(), description: customDescription.trim() })
    }
    transitionToStep('providers')
  }

  const handleOpenProject = async () => {
    setIsSubmitting(true)
    const project = await createProject(name.trim(), selectedUseCase ? serializeUseCase(selectedUseCase) : undefined, visibility)
    setIsSubmitting(false)
    if (project) {
      // Save provider configs locally
      if (providerConfigs.length > 0) {
        localStorage.setItem(`dynamo:providers:${project.id}`, JSON.stringify(providerConfigs))
      }
      onComplete(project)
    }
  }

  const handleSkip = async () => {
    setIsSubmitting(true)
    const project = await createProject(name.trim(), selectedUseCase ? serializeUseCase(selectedUseCase) : undefined, 'private')
    setIsSubmitting(false)
    if (project) {
      if (providerConfigs.length > 0) {
        localStorage.setItem(`dynamo:providers:${project.id}`, JSON.stringify(providerConfigs))
      }
      onComplete(project)
    }
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* ── Left panel ── */}
      <div className="flex flex-col justify-between flex-1 min-w-0 p-16 pr-0">
        <StepIndicator current={step} />

        {/* Form content */}
        <div
          className={cn(
            'max-w-lg transition-[opacity,transform] duration-150',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
          )}
          style={{ transitionTimingFunction: 'cubic-bezier(0.6, 0.04, 0.98, 0.34)' }}
        >
          {step === 'create' && (
            <StepCreate
              name={name}
              onNameChange={setName}
              onContinue={() => transitionToStep('usecase')}
            />
          )}

          {step === 'usecase' && (
            <StepUseCase
              selectedId={selectedId}
              selectedUseCase={selectedUseCase}
              customName={customName}
              customDescription={customDescription}
              onSelect={handleUseCaseSelect}
              onCustomNameChange={setCustomName}
              onCustomDescriptionChange={setCustomDescription}
              onBack={() => transitionToStep('create')}
              onSkip={() => { setSelectedUseCase(null); setSelectedId(null); transitionToStep('providers') }}
              onContinue={handleUseCaseContinue}
            />
          )}

          {step === 'providers' && (
            <StepProviders
              providers={providerConfigs}
              onProvidersChange={setProviderConfigs}
              onBack={() => transitionToStep('usecase')}
              onSkip={() => transitionToStep('permissions')}
              onContinue={() => transitionToStep('permissions')}
            />
          )}

          {step === 'permissions' && (
            <StepPermissions
              visibility={visibility}
              onVisibilityChange={setVisibility}
              isSubmitting={isSubmitting}
              error={error}
              onBack={() => transitionToStep('providers')}
              onSkip={handleSkip}
              onSubmit={handleOpenProject}
            />
          )}
        </div>

        {/* Bottom */}
        <a href="#" className="flex items-center gap-1.5 text-[0.8125rem] text-gray-400 hover:text-gray-600 transition-colors">
          <CircleHelp className="h-3.5 w-3.5" strokeWidth={1.5} />
          Help & Documentation
        </a>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 min-w-0 p-16 pl-0">
        <div className="h-full rounded-2xl bg-gray-100 flex items-center justify-center">
          <RightPanel step={step} name={name} selectedId={selectedId} customName={customName} customDescription={customDescription} visibility={visibility} />
        </div>
      </div>
    </div>
  )
}
