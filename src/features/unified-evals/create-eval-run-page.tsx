import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { POLICY_TEMPLATES } from '@/v2/features/projects/components/policies/constants'
import type { PolicyTemplate } from '@/v2/features/projects/components/policies/types'
import {
  PolicyGeneratorService,
  type PolicyWarning,
} from '@/lib/agents/policy-generator-service'
import { EvalRunHeader } from './components/eval-run-header'
import { EvalRunFooter } from './components/eval-run-footer'
import { PolicySelectionStep } from './components/policy-selection-step'
import { PolicySelectionStepV2 } from './components/policy-selection-step-v2'
import { DesignVersionPalette } from './components/design-version-palette'
import { EvalTypeStep } from './components/eval-type-step'
import { CreateNewPolicyStep } from './components/create-new-policy-step'
import { CreatePolicyProcessingStep } from './components/create-policy-processing-step'
import {
  CreatePolicyEditStep,
  behaviorsFromStrings,
  type BehaviorItem,
} from './components/create-policy-edit-step'
import { createGeneratedPolicyId } from './types/generated-policy'
import { useDesignVersion } from './hooks/useDesignVersion'

const TOTAL_STEPS = 2

type View =
  | 'wizard'
  | 'create-policy'
  | 'create-policy-processing'
  | 'create-policy-edit'

interface PolicyDraft {
  name: string
  description: string
  allowed: BehaviorItem[]
  disallowed: BehaviorItem[]
}

const EMPTY_DRAFT: PolicyDraft = {
  name: '',
  description: '',
  allowed: [],
  disallowed: [],
}

export function CreateEvalRunPage() {
  const navigate = useNavigate()
  const { version: designVersion, setVersion: setDesignVersion } = useDesignVersion()
  const [view, setView] = useState<View>('wizard')
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<Set<string>>(new Set())
  const [selectedAttackIds, setSelectedAttackIds] = useState<Set<string>>(new Set())
  const [hasAnimatedJourney, setHasAnimatedJourney] = useState(false)
  const [extraTemplates, setExtraTemplates] = useState<PolicyTemplate[]>([])
  const [policyDraft, setPolicyDraft] = useState<PolicyDraft>(EMPTY_DRAFT)
  const [policyWarnings, setPolicyWarnings] = useState<PolicyWarning[]>([])
  const [generationError, setGenerationError] = useState<string | null>(null)
  const lastObjectiveRef = useRef<string>('')

  useEffect(() => {
    setHasAnimatedJourney(true)
  }, [])

  const animateOnMount = !hasAnimatedJourney

  const togglePolicy = (templateId: string) => {
    setSelectedPolicyIds((prev) => {
      const next = new Set(prev)
      if (next.has(templateId)) next.delete(templateId)
      else next.add(templateId)
      return next
    })
  }

  const toggleAttack = (id: string) => {
    setSelectedAttackIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const runGeneration = useCallback(async (objective: string) => {
    setGenerationError(null)
    setView('create-policy-processing')
    try {
      const { policy, warnings } = await PolicyGeneratorService.generate(objective)
      setPolicyDraft({
        name: policy.name,
        description: policy.description,
        allowed: behaviorsFromStrings(policy.allowedBehaviors),
        disallowed: behaviorsFromStrings(policy.disallowedBehaviors),
      })
      setPolicyWarnings(warnings)
      setView('create-policy-edit')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate policy.'
      setGenerationError(message)
    }
  }, [])

  const handleObjectiveSubmit = (enrichedContext: string) => {
    lastObjectiveRef.current = enrichedContext
    void runGeneration(enrichedContext)
  }

  const handleProcessingRetry = () => {
    if (!lastObjectiveRef.current) {
      setView('create-policy')
      return
    }
    void runGeneration(lastObjectiveRef.current)
  }

  const handlePublishPolicy = () => {
    const trimmedName = policyDraft.name.trim() || 'Untitled Policy'
    const trimmedDescription = policyDraft.description.trim()
    const allowed = policyDraft.allowed
      .map((b) => b.text.trim())
      .filter((t) => t.length > 0)
    const disallowed = policyDraft.disallowed
      .map((b) => b.text.trim())
      .filter((t) => t.length > 0)

    const id = createGeneratedPolicyId()
    const newTemplate: PolicyTemplate = {
      id,
      name: trimmedName,
      category: 'Custom',
      description: trimmedDescription || 'Custom policy generated from your objective.',
      detail: trimmedDescription,
      allowed,
      disallowed,
    }

    setExtraTemplates((prev) => [newTemplate, ...prev])
    setSelectedPolicyIds((prev) => new Set([id, ...prev]))
    setPolicyDraft(EMPTY_DRAFT)
    setPolicyWarnings([])
    lastObjectiveRef.current = ''
    setCurrentStep(0)
    setView('wizard')
  }

  const handleBack = () => {
    if (currentStep === 0) {
      navigate('/unified-evals')
    } else {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleContinue = () => {
    if (currentStep === 0) {
      setCurrentStep(1)
    } else {
      // v3: Start Eval Run is a no-op until eval execution is built
    }
  }

  const isLastStep = currentStep === TOTAL_STEPS - 1
  const continueDisabled = currentStep === 0 && selectedPolicyIds.size === 0
  const wizardTemplates = [...extraTemplates, ...POLICY_TEMPLATES]

  if (view === 'create-policy') {
    return (
      <div className="flex h-screen flex-col bg-gray-100 p-3">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-0 shadow-sm">
          <EvalRunHeader
            title="Create New Policy"
            onBack={() => setView('wizard')}
          />
          <div className="flex flex-1 items-center justify-center overflow-y-auto">
            <CreateNewPolicyStep
              onSubmit={handleObjectiveSubmit}
              animateOnMount={animateOnMount}
            />
          </div>
        </div>
      </div>
    )
  }

  if (view === 'create-policy-processing') {
    return (
      <div className="flex h-screen flex-col bg-gray-100 p-3">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-0 shadow-sm">
          <EvalRunHeader
            title="Create New Policy"
            onBack={() => setView('create-policy')}
          />
          <div className="flex flex-1 items-start justify-center overflow-y-auto">
            <CreatePolicyProcessingStep
              state={generationError ? 'error' : 'pending'}
              errorMessage={generationError ?? undefined}
              onRetry={handleProcessingRetry}
              onBack={() => setView('create-policy')}
              animateOnMount={animateOnMount}
            />
          </div>
        </div>
      </div>
    )
  }

  if (view === 'create-policy-edit') {
    return (
      <div className="flex h-screen flex-col bg-gray-100 p-3">
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-0 shadow-sm">
          <EvalRunHeader
            title="Create New Policy"
            onBack={() => setView('create-policy')}
            actions={
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Check className="h-3 w-3" />
                  Auto Saved
                </span>
                <Button onClick={handlePublishPolicy}>
                  Publish & Go to Evaluation
                </Button>
              </div>
            }
          />
          <div className="flex flex-1 items-start justify-center overflow-y-auto">
            <CreatePolicyEditStep
              name={policyDraft.name}
              description={policyDraft.description}
              allowed={policyDraft.allowed}
              disallowed={policyDraft.disallowed}
              onNameChange={(name) => setPolicyDraft((prev) => ({ ...prev, name }))}
              onDescriptionChange={(description) =>
                setPolicyDraft((prev) => ({ ...prev, description }))
              }
              onAllowedChange={(allowed) =>
                setPolicyDraft((prev) => ({ ...prev, allowed }))
              }
              onDisallowedChange={(disallowed) =>
                setPolicyDraft((prev) => ({ ...prev, disallowed }))
              }
              animateOnMount={animateOnMount}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-gray-100 p-3">
      <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-0 shadow-sm">
        <EvalRunHeader
          title="Create New Eval Run"
          onClose={() => navigate('/unified-evals')}
        />
        <div className="flex flex-1 items-stretch justify-center overflow-y-auto">
          {currentStep === 0 ? (
            designVersion === 'v2' ? (
              <PolicySelectionStepV2
                templates={wizardTemplates}
                selectedIds={selectedPolicyIds}
                onToggle={togglePolicy}
                onCreateNewPolicy={() => setView('create-policy')}
                animateOnMount={animateOnMount}
              />
            ) : (
              <PolicySelectionStep
                templates={wizardTemplates}
                selectedIds={selectedPolicyIds}
                onToggle={togglePolicy}
                onCreateNewPolicy={() => setView('create-policy')}
                animateOnMount={animateOnMount}
              />
            )
          ) : (
            <EvalTypeStep
              selectedAttackIds={selectedAttackIds}
              onToggleAttack={toggleAttack}
              animateOnMount={animateOnMount}
            />
          )}
        </div>
        <EvalRunFooter
          onBack={handleBack}
          onContinue={handleContinue}
          continueDisabled={continueDisabled}
          continueLabel={isLastStep ? 'Start Eval Run' : 'Continue'}
          continueIcon={isLastStep ? <Play className="h-3 w-3" /> : undefined}
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
        />
      </div>
      <DesignVersionPalette version={designVersion} onChange={setDesignVersion} />
    </div>
  )
}
