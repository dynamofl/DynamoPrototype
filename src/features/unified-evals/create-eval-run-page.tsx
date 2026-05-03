import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, PanelRight, PanelRightClose, Play } from 'lucide-react'
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
import { EvalTypeStepV2 } from './components/eval-type-step-v2'
import {
  EvalTypeStepV3,
  ALL_EVAL_ITEMS_BY_ID_V3,
} from './components/eval-type-step-v3'
import { PolicySelectionStepV3 } from './components/policy-selection-step-v3'
import { SelectUseCaseStepV1 } from './components/select-use-case-step-v1'
import { SelectUseCaseStepV2 } from './components/select-use-case-step-v2'
import { SelectUseCaseStepV3 } from './components/select-use-case-step-v3'
import { UseCasePreview } from './components/use-case-preview'
import { UseCasePreviewEmpty } from './components/use-case-preview-empty'
import { PolicyPreview } from './components/policy-preview'
import { PolicyPreviewEmpty } from './components/policy-preview-empty'
import { EvalCriteriaPreview } from './components/eval-criteria-preview'
import { EvalCriteriaPreviewEmpty } from './components/eval-criteria-preview-empty'
import { CreateNewPolicyStep } from './components/create-new-policy-step'
import { CreatePolicyProcessingStep } from './components/create-policy-processing-step'
import {
  CreatePolicyEditStep,
  behaviorsFromStrings,
  type BehaviorItem,
  type ReferenceFile,
} from './components/create-policy-edit-step'
import { createGeneratedPolicyId } from './types/generated-policy'
import { useDesignVersion } from './hooks/useDesignVersion'
import { USECASE_OPTIONS } from './constants'

const TOTAL_STEPS = 3

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
  const [referenceFiles, setReferenceFiles] = useState<ReferenceFile[]>([])
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)
  const [v3PreviewOpen, setV3PreviewOpen] = useState(false)
  const [v3PreviewUseCase, setV3PreviewUseCase] = useState<string | null>(null)
  const [v3PreviewPolicyId, setV3PreviewPolicyId] = useState<string | null>(null)
  const [v3PreviewEvalItemId, setV3PreviewEvalItemId] = useState<string | null>(
    null,
  )

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

  const handleObjectiveSubmit = (
    enrichedContext: string,
    files: ReferenceFile[],
  ) => {
    lastObjectiveRef.current = enrichedContext
    setReferenceFiles(files)
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

  const isV3 = designVersion === 'v3'
  const totalSteps = TOTAL_STEPS

  const handleBack = () => {
    if (currentStep === 0) {
      navigate('/unified-evals')
    } else {
      setCurrentStep((s) => s - 1)
    }
  }

  const handleContinue = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1)
    }
  }

  const isLastStep = currentStep === totalSteps - 1
  const continueDisabled =
    (currentStep === 0 && !selectedUseCase) ||
    (currentStep === 1 && selectedPolicyIds.size === 0)
  const wizardTemplates = [...extraTemplates, ...POLICY_TEMPLATES]
  const useSplitFooter = designVersion === 'v2' || isV3

  const evalRunFooter = (
    <EvalRunFooter
      onBack={handleBack}
      onContinue={handleContinue}
      continueDisabled={continueDisabled}
      continueLabel={isLastStep ? 'Start Eval Run' : 'Continue'}
      continueIcon={isLastStep ? <Play className="h-3 w-3" /> : undefined}
      currentStep={currentStep}
      totalSteps={totalSteps}
      showStepIndicator={!useSplitFooter}
    />
  )

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
          <div className="flex flex-1 items-start overflow-y-auto">
            <CreatePolicyEditStep
              name={policyDraft.name}
              description={policyDraft.description}
              allowed={policyDraft.allowed}
              referenceFiles={referenceFiles}
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

  if (isV3) {
    const showPreview = v3PreviewOpen
    const layoutTransition = { duration: 0.35, ease: 'easeInOut' as const }
    const previewPolicyTemplate =
      v3PreviewPolicyId
        ? wizardTemplates.find((t) => t.id === v3PreviewPolicyId) ?? null
        : null
    const previewEvalItem = v3PreviewEvalItemId
      ? ALL_EVAL_ITEMS_BY_ID_V3[v3PreviewEvalItemId] ?? null
      : null

    const previewTitle =
      currentStep === 0
        ? 'Use Case Preview'
        : currentStep === 1
          ? 'Policy Preview'
          : 'Eval Criteria Preview'

    const previewUseCaseOption = v3PreviewUseCase
      ? USECASE_OPTIONS.find((o) => o.value === v3PreviewUseCase) ?? null
      : null

    let previewBody: ReactNode
    if (currentStep === 0) {
      previewBody = previewUseCaseOption ? (
        <UseCasePreview option={previewUseCaseOption} />
      ) : (
        <UseCasePreviewEmpty />
      )
    } else if (currentStep === 1) {
      previewBody = previewPolicyTemplate ? (
        <PolicyPreview template={previewPolicyTemplate} />
      ) : (
        <div className="flex h-full items-center justify-center">
          <PolicyPreviewEmpty />
        </div>
      )
    } else {
      previewBody = previewEvalItem ? (
        <EvalCriteriaPreview item={previewEvalItem} />
      ) : (
        <div className="flex h-full items-center justify-center">
          <EvalCriteriaPreviewEmpty />
        </div>
      )
    }

    const handleTogglePolicyPreview = (template: PolicyTemplate) => {
      if (v3PreviewPolicyId === template.id) {
        setV3PreviewPolicyId(null)
        setV3PreviewOpen(false)
      } else {
        setV3PreviewPolicyId(template.id)
        setV3PreviewOpen(true)
      }
    }

    const handleToggleEvalPreview = (id: string) => {
      if (v3PreviewEvalItemId === id) {
        setV3PreviewEvalItemId(null)
        setV3PreviewOpen(false)
      } else {
        setV3PreviewEvalItemId(id)
        setV3PreviewOpen(true)
      }
    }

    return (
      <div className="flex h-screen flex-col gap-3 bg-gray-100 p-3">
        <div className="flex flex-1 gap-3 overflow-hidden">
          <motion.div
            initial={false}
            animate={{ maxWidth: showPreview ? '40rem' : '100vw' }}
            transition={layoutTransition}
            className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-0 shadow-sm"
          >
            <div className="flex h-12 items-center justify-between border-b border-gray-200 px-4">
              <p className="text-sm font-medium text-gray-900">
                Create your First Evaluation
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate('/unified-evals')}
                >
                  Exit Eval Creation
                </Button>
                <Button
                  variant="outline"
                  className={showPreview ? 'h-8 w-8 p-0' : 'gap-1.5 whitespace-nowrap'}
                  aria-label={showPreview ? 'Hide Preview' : 'Show Preview'}
                  onClick={() => setV3PreviewOpen((open) => !open)}
                >
                  {showPreview ? (
                    <PanelRightClose className="h-3.5 w-3.5" />
                  ) : (
                    <>
                      Show Preview
                      <PanelRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
            {currentStep === 0 ? (
              <SelectUseCaseStepV3
                options={USECASE_OPTIONS}
                selectedValue={selectedUseCase}
                previewValue={showPreview ? v3PreviewUseCase : null}
                onSelect={(value) => {
                  setSelectedUseCase(value)
                  if (v3PreviewOpen) {
                    setV3PreviewUseCase(value)
                  }
                }}
                onTogglePreview={(value) => {
                  if (v3PreviewUseCase === value) {
                    setV3PreviewUseCase(null)
                    setV3PreviewOpen(false)
                  } else {
                    setV3PreviewUseCase(value)
                    setV3PreviewOpen(true)
                  }
                }}
                onAddNewCase={() => setView('create-policy')}
                animateOnMount={animateOnMount}
                footer={evalRunFooter}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            ) : currentStep === 1 ? (
              <PolicySelectionStepV3
                templates={wizardTemplates}
                selectedIds={selectedPolicyIds}
                previewTemplateId={showPreview ? v3PreviewPolicyId : null}
                onToggle={togglePolicy}
                onTogglePreview={handleTogglePolicyPreview}
                onCreateNewPolicy={() => setView('create-policy')}
                animateOnMount={animateOnMount}
                footer={evalRunFooter}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            ) : (
              <EvalTypeStepV3
                selectedAttackIds={selectedAttackIds}
                previewItemId={showPreview ? v3PreviewEvalItemId : null}
                onToggleAttack={toggleAttack}
                onTogglePreview={handleToggleEvalPreview}
                animateOnMount={animateOnMount}
                footer={evalRunFooter}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            )}
          </motion.div>

          <AnimatePresence initial={false}>
            {showPreview ? (
              <motion.div
                key="preview-card"
                layout
                initial={{ flexGrow: 0, opacity: 0 }}
                animate={{ flexGrow: 1, opacity: 1 }}
                exit={{ flexGrow: 0, opacity: 0 }}
                transition={layoutTransition}
                className="flex min-w-0 basis-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-0 shadow-sm"
              >
                <div className="flex h-12 items-center border-b border-gray-200 px-4">
                  <p className="text-sm font-medium text-gray-900">
                    {previewTitle}
                  </p>
                </div>
                <div className="flex-1 overflow-y-auto">{previewBody}</div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
        <DesignVersionPalette version={designVersion} onChange={setDesignVersion} />
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
        {useSplitFooter ? (
          <div className="flex flex-1 overflow-hidden">
            {currentStep === 0 ? (
              <SelectUseCaseStepV2
                options={USECASE_OPTIONS}
                selectedValue={selectedUseCase}
                onSelect={setSelectedUseCase}
                onAddNewCase={() => setView('create-policy')}
                animateOnMount={animateOnMount}
                footer={evalRunFooter}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            ) : currentStep === 1 ? (
              <PolicySelectionStepV2
                templates={wizardTemplates}
                selectedIds={selectedPolicyIds}
                onToggle={togglePolicy}
                onCreateNewPolicy={() => setView('create-policy')}
                animateOnMount={animateOnMount}
                footer={evalRunFooter}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            ) : (
              <EvalTypeStepV2
                selectedAttackIds={selectedAttackIds}
                onToggleAttack={toggleAttack}
                animateOnMount={animateOnMount}
                footer={evalRunFooter}
                currentStep={currentStep}
                totalSteps={totalSteps}
              />
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-1 items-stretch justify-center overflow-y-auto">
              {currentStep === 0 ? (
                <SelectUseCaseStepV1
                  options={USECASE_OPTIONS}
                  selectedValue={selectedUseCase}
                  onSelect={setSelectedUseCase}
                  onAddNewCase={() => setView('create-policy')}
                  animateOnMount={animateOnMount}
                />
              ) : currentStep === 1 ? (
                <PolicySelectionStep
                  templates={wizardTemplates}
                  selectedIds={selectedPolicyIds}
                  onToggle={togglePolicy}
                  onCreateNewPolicy={() => setView('create-policy')}
                  animateOnMount={animateOnMount}
                />
              ) : (
                <EvalTypeStep
                  selectedAttackIds={selectedAttackIds}
                  onToggleAttack={toggleAttack}
                  animateOnMount={animateOnMount}
                />
              )}
            </div>
            {evalRunFooter}
          </>
        )}
      </div>
      <DesignVersionPalette version={designVersion} onChange={setDesignVersion} />
    </div>
  )
}
