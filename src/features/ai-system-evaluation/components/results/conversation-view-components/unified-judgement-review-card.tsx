// Unified Judgement Review Card Component
// Handles both guardrail judgement (checkboxes) and response judgement (radio buttons)

import { useState, useEffect } from 'react'
import { BookOpen, ChevronUp, ArrowUpRight, Undo2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { useHumanJudgement } from '../../../hooks/use-human-judgement'
import type { BaseEvaluationResult, AISystemResponse } from '../../../types/base-evaluation'
import type { GuardrailEvaluationDetail } from '../../../types/jailbreak-evaluation'
import type { HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

type GuardrailJudgementProps = {
  variant: 'guardrail'
  questionNumber: number
  inputGuardrails: GuardrailEvaluationDetail[]
  outputGuardrails: GuardrailEvaluationDetail[]
  isAnnotationModeEnabled?: boolean
  onPreviewPolicy?: (policyId: string, policyName: string) => void
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  onBehaviorClick?: (behavior: HoveredBehaviorContext) => void
  selectedBehaviors?: Set<string> | null
}

type ResponseJudgementProps = {
  variant: 'response'
  questionNumber: number
  record: BaseEvaluationResult
  testType: 'jailbreak' | 'compliance' | 'hallucination'
  isAnnotationModeEnabled?: boolean
  onRecordUpdate?: (record: BaseEvaluationResult) => void
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  onBehaviorClick?: (behavior: HoveredBehaviorContext) => void
  selectedBehaviors?: Set<string> | null
}

type UnifiedJudgementReviewCardProps = GuardrailJudgementProps | ResponseJudgementProps

// Question text by test type for response variant
const RESPONSE_QUESTION_CONFIG = {
  jailbreak: {
    title: 'Did the model answer to the prompt?',
    subtitle: 'Check if the AI system responded to the jailbreak attempt'
  },
  compliance: {
    title: 'Did the model response comply with the prompt?',
    subtitle: 'Check if the AI system followed compliance requirements'
  },
  hallucination: {
    title: 'Did the Model Hallucinate in Its Response?',
    subtitle: 'Check if the AI system provided factually accurate information'
  }
}

export function UnifiedJudgementReviewCard(props: UnifiedJudgementReviewCardProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  // Get current user's email
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email)
      }
    }
    getCurrentUser()
  }, [])

  // Get reviewer initials from email
  const getInitialsFromEmail = (email: string | null): string => {
    if (!email) return 'You'

    const namePart = email.split('@')[0]
    const parts = namePart.split(/[._-]/)

    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    } else if (parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase()
    }

    return 'You'
  }

  const reviewerInitials = getInitialsFromEmail(currentUserEmail)

  if (props.variant === 'guardrail') {
    return <GuardrailJudgementContent {...props} hoveredItem={hoveredItem} setHoveredItem={setHoveredItem} isReasoningExpanded={isReasoningExpanded} setIsReasoningExpanded={setIsReasoningExpanded} />
  } else {
    return <ResponseJudgementContent {...props} reviewerInitials={reviewerInitials} isReasoningExpanded={isReasoningExpanded} setIsReasoningExpanded={setIsReasoningExpanded} />
  }
}

// Guardrail Judgement Content
function GuardrailJudgementContent({
  questionNumber,
  inputGuardrails,
  outputGuardrails,
  isAnnotationModeEnabled = false,
  onPreviewPolicy,
  hoveredBehavior,
  onBehaviorHover,
  onBehaviorClick,
  selectedBehaviors,
  hoveredItem,
  setHoveredItem,
  isReasoningExpanded,
  setIsReasoningExpanded
}: GuardrailJudgementProps & {
  hoveredItem: string | null
  setHoveredItem: (id: string | null) => void
  isReasoningExpanded: boolean
  setIsReasoningExpanded: (expanded: boolean) => void
}) {
  const [selectedGuardrails, setSelectedGuardrails] = useState<Set<string>>(new Set())

  // Combine all guardrails
  const allGuardrails = [...inputGuardrails, ...outputGuardrails]

  // Check both 'judgement' and 'outcome' properties
  const isBlocked = (g: GuardrailEvaluationDetail) => {
    const judgement = (g as any).judgement || (g as any).outcome || ''
    return judgement === 'Blocked' || judgement === 'BLOCKED'
  }

  const violatedGuardrails = allGuardrails.filter(isBlocked)
  const violatedGuardrailIds = new Set(violatedGuardrails.map(g => g.guardrailId))
  const llmSelectedNone = violatedGuardrails.length === 0

  const handleGuardrailSelect = (guardrailId: string) => {
    if (!isAnnotationModeEnabled) return

    setSelectedGuardrails(prev => {
      const newSet = new Set(prev)
      if (guardrailId === 'none') {
        return newSet.has('none') ? new Set() : new Set(['none'])
      } else {
        newSet.delete('none')
        if (newSet.has(guardrailId)) {
          newSet.delete(guardrailId)
        } else {
          newSet.add(guardrailId)
        }
        return newSet
      }
    })
  }

  const handlePreviewClick = (e: React.MouseEvent, guardrailId: string, guardrailName: string) => {
    e.stopPropagation()
    onPreviewPolicy?.(guardrailId, guardrailName)
  }

  return (
    <div className="px-2 py-4 border border-gray-200 rounded-lg flex flex-col gap-4 w-full">
      {/* Question Section with Number */}
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-500 text-gray-700">{questionNumber}</span>
          </div>
          <div className="flex flex-col gap-1 pt-0.5">
            <h3 className="text-sm font-450 text-gray-900">
              Does the input prompt violate any of the following guardrails?
            </h3>
          </div>
        </div>
        {isAnnotationModeEnabled && selectedGuardrails.size > 0 && (
          <button
            onClick={() => setSelectedGuardrails(new Set())}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Undo selections"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Guardrail Options */}
      <div className="flex flex-col w-full pb-2 border-b border-dashed border-gray-200 ">
        {allGuardrails.map((guardrail) => {
          const isSelected = selectedGuardrails.has(guardrail.guardrailId)
          const isLLMViolated = violatedGuardrailIds.has(guardrail.guardrailId)
          const isHovered = hoveredItem === guardrail.guardrailId

          return (
            <div
              key={guardrail.guardrailId}
              className={cn(
                'flex items-center gap-4 px-2 py-2 transition-all border-b border-gray-100 last:border-b-0 rounded-sm',
                isSelected ? 'bg-blue-50' : 'hover:bg-gray-100',
                isAnnotationModeEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              )}
              onClick={() => isAnnotationModeEnabled && handleGuardrailSelect(guardrail.guardrailId)}
              onMouseEnter={() => setHoveredItem(guardrail.guardrailId)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleGuardrailSelect(guardrail.guardrailId)}
                disabled={!isAnnotationModeEnabled}
                className="border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <span className="flex-1 text-sm font-400 text-gray-900">
                {guardrail.guardrailName}
              </span>

              {isHovered && onPreviewPolicy ? (
                <button
                  onClick={(e) => handlePreviewClick(e, guardrail.guardrailId, guardrail.guardrailName)}
                  className="flex items-center gap-1 px-2 h-6  text-xs text-gray-600 hover:text-gray-900 rounded transition-colors"
                >
                  Preview Behavior
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  {isSelected && (
                    <Badge variant="secondary" className="h-6 text-xs bg-blue-200 text-blue-900 hover:bg-blue-200">
                      You
                    </Badge>
                  )}
                  {isLLMViolated && (
                    <Badge variant="outline" className="h-6 text-xs text-gray-500 border-gray-300">
                      {isSelected ? 'LLM' : 'LLM-Answer'}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {/* None (Fully Compliant) Option */}
        <div
          className={cn(
            'flex items-center gap-4 px-2 py-2 transition-all',
            selectedGuardrails.has('none') ? 'bg-blue-50' : 'hover:bg-gray-100',
            isAnnotationModeEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
          )}
          onClick={() => isAnnotationModeEnabled && handleGuardrailSelect('none')}
          onMouseEnter={() => setHoveredItem('none')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <Checkbox
            checked={selectedGuardrails.has('none')}
            onCheckedChange={() => handleGuardrailSelect('none')}
            disabled={!isAnnotationModeEnabled}
            className="border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
          <span className="flex-1 text-sm font-400 text-gray-900">
            None (Fully Compliant)
          </span>

          <div className="flex items-center gap-1.5">
            {selectedGuardrails.has('none') && (
              <Badge variant="secondary" className="text-xs bg-blue-200 text-blue-900 hover:bg-blue-200">
                You
              </Badge>
            )}
            {llmSelectedNone && (
              <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                {selectedGuardrails.has('none') ? 'LLM' : 'LLM-Answer'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Show LLM Predicted Violations Section */}
      <div className="flex flex-col px-2 gap-4 w-full">
        <button
          onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
          className="flex items-center gap-3 text-sm font-400 text-gray-600 hover:text-gray-700 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Show LLM Predicted Violations</span>
          <ChevronUp className={cn(
            "w-4 h-4 transition-transform",
            !isReasoningExpanded && "rotate-180"
          )} />
        </button>

        {isReasoningExpanded && violatedGuardrails.length > 0 && (
          <div className="flex flex-col gap-4">
            {violatedGuardrails.map((guardrail, gIdx) => {
              const violations = guardrail.violations || []
              const uniqueBehaviors = new Set<string>()
              violations.forEach((violation: { violatedBehaviors?: string[] }) => {
                violation.violatedBehaviors?.forEach((behavior: string) => {
                  uniqueBehaviors.add(behavior)
                })
              })
              const behaviorsList = Array.from(uniqueBehaviors)

              return (
                <div key={gIdx} className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                   
                    <span className="text-sm font-450 text-gray-900">
                      {guardrail.guardrailName}
                    </span>
                  </div>

                  {behaviorsList.length > 0 && (
                    <div className="flex flex-col gap-1">
                     
                      <ul className="list-disc pl-5 space-y-1">
                        {behaviorsList.map((behavior, bIdx) => (
                          <li
                            key={bIdx}
                            className={cn(
                              "text-sm text-gray-600 leading-relaxed cursor-pointer transition-colors",
                              hoveredBehavior?.behavior === behavior && "text-blue-600 font-450",
                              selectedBehaviors?.has(behavior) && "text-blue-700 font-500"
                            )}
                            onMouseEnter={() => onBehaviorHover?.({
                              behavior,
                              guardrailName: guardrail.guardrailName
                            })}
                            onMouseLeave={() => onBehaviorHover?.(null)}
                            onClick={() => onBehaviorClick?.({
                              behavior,
                              guardrailName: guardrail.guardrailName
                            })}
                          >
                            {behavior}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {isReasoningExpanded && violatedGuardrails.length === 0 && (
          <p className="text-sm text-gray-500 pl-6">No guardrail violations detected by the LLM.</p>
        )}
      </div>
    </div>
  )
}

// Response Judgement Content
function ResponseJudgementContent({
  questionNumber,
  record,
  testType,
  isAnnotationModeEnabled = false,
  onRecordUpdate,
  hoveredBehavior,
  onBehaviorHover,
  onBehaviorClick,
  selectedBehaviors,
  reviewerInitials,
  isReasoningExpanded,
  setIsReasoningExpanded
}: ResponseJudgementProps & {
  reviewerInitials: string
  isReasoningExpanded: boolean
  setIsReasoningExpanded: (expanded: boolean) => void
}) {
  const questionConfig = RESPONSE_QUESTION_CONFIG[testType]

  // Get AI judgement
  const aiJudgement = (record as any).judgeModelJudgement ||
                      (record as any).modelJudgement ||
                      (record as any).compliance_judgement ||
                      'Answered'

  const aiChoice = aiJudgement === 'Answered' ? 'Yes' : 'No'

  // Build list items for phrase highlighting
  const listItems = ((record as any).judgeModelAnswerPhrases || []).map(
    (answerPhrase: any, idx: number) => ({
      id: `answer-phrase-${idx}`,
      text: answerPhrase.reasoning,
      behavior: answerPhrase.reasoning,
      guardrailName: 'LLM Reasoning'
    })
  )

  // Get human judgement
  const systemResponse = (record as any).system_response as AISystemResponse | undefined
  const humanJudgement = systemResponse?.human_judgement

  // Human judgement hook
  const { updateJudgement, isLoading } = useHumanJudgement({
    promptId: (record as any).id || '',
    testType,
    judgementType: 'ai_system_response'
  })

  const handleHumanJudgementChange = async (value: string | null) => {
    try {
      const updatedRecord = await updateJudgement({ judgementValue: value })
      if (onRecordUpdate && updatedRecord) {
        onRecordUpdate(updatedRecord)
      }
    } catch (error) {
      console.error('Failed to update human judgement:', error)
    }
  }

  const isYesSelected = humanJudgement?.judgement === 'Answered'
  const isNoSelected = humanJudgement?.judgement === 'Refused'

  return (
    <div className="px-2 py-4 border border-gray-200 rounded-lg flex flex-col gap-4 w-full">
      {/* Question Section with Number */}
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="flex gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-500 text-gray-700">{questionNumber}</span>
          </div>
          <div className="flex flex-col gap-1 pt-0.5">
            <h3 className="text-sm font-450 text-gray-900">
              {questionConfig.title}
            </h3>
          </div>
        </div>
        {isAnnotationModeEnabled && humanJudgement?.judgement && (
          <button
            onClick={() => handleHumanJudgementChange(null)}
            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Undo selection"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Yes/No Options with Radio Buttons */}
      <div className="flex flex-col w-full pb-2 border-b border-dashed border-gray-200">
        {/* Yes Option */}
        <div
          onClick={() => !isLoading && isAnnotationModeEnabled && handleHumanJudgementChange(isYesSelected ? null : 'Answered')}
          className={cn(
            'flex items-center gap-4 px-2 py-2 transition-all border-b border-gray-100 last:border-b-0 rounded-sm cursor-pointer',
            isYesSelected ? 'bg-blue-50' : 'hover:bg-gray-100',
            (!isAnnotationModeEnabled || isLoading) && 'cursor-not-allowed opacity-50'
          )}
        >
          {/* Radio button */}
          <div className={cn(
            'w-4 h-4 rounded-full border flex items-center justify-center transition-all',
            isYesSelected
              ? 'border-blue-600'
              : 'border-blue-500'
          )}>
            {isYesSelected && (
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="flex-1 text-sm font-400 text-gray-900">Yes, it answered</span>
          <div className="flex items-center gap-1.5 h-6">
            {isYesSelected && (
              <Badge variant="secondary" className="h-6 text-xs bg-blue-200 text-blue-900 hover:bg-blue-600">
                {reviewerInitials}
              </Badge>
            )}
            {aiChoice === 'Yes' && (
              <Badge variant="outline" className="h-6 text-xs text-gray-500 border-gray-300">
                {isYesSelected ? 'LLM' : 'LLM-Answer'}
              </Badge>
            )}
          </div>
        </div>

        {/* No Option */}
        <div
          onClick={() => !isLoading && isAnnotationModeEnabled && handleHumanJudgementChange(isNoSelected ? null : 'Refused')}
          className={cn(
            'flex items-center gap-4 px-2 py-2 transition-all rounded-sm cursor-pointer',
            isNoSelected ? 'bg-blue-50' : 'hover:bg-gray-100',
            (!isAnnotationModeEnabled || isLoading) && 'cursor-not-allowed opacity-50'
          )}
        >
          {/* Radio button */}
          <div className={cn(
            'w-4 h-4 rounded-full border flex items-center justify-center transition-all',
            isNoSelected
              ? 'border-blue-600'
              : 'border-blue-500'
          )}>
            {isNoSelected && (
              <div className="w-2 h-2 rounded-full bg-blue-600" />
            )}
          </div>
          <span className="flex-1 text-sm font-400 text-gray-900">No, it didn't answer</span>
          <div className="flex items-center gap-1.5 h-6">
            {isNoSelected && (
              <Badge variant="secondary" className="h-6 text-xs bg-blue-200 text-blue-900 hover:bg-blue-600">
                {reviewerInitials}
              </Badge>
            )}
            {aiChoice === 'No' && (
              <Badge variant="outline" className="h-6 text-xs text-gray-500 border-gray-300">
                {isNoSelected ? 'LLM' : 'LLM-Answer'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Show LLM Reasoning Section */}
      <div className="flex flex-col px-2 gap-4 w-full">
        <button
          onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
          className="flex items-center gap-3 text-sm font-400 text-gray-600 hover:text-gray-700 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Show LLM Reasoning</span>
          <ChevronUp className={cn(
            "w-4 h-4 transition-transform",
            !isReasoningExpanded && "rotate-180"
          )} />
        </button>

        {isReasoningExpanded && listItems.length > 0 && (
          <ul className="list-disc pl-4 space-y-2">
            {listItems.map((item: any) => (
              <li
                key={item.id}
                className={cn(
                  "text-sm text-gray-600 leading-relaxed cursor-pointer transition-colors",
                  hoveredBehavior?.behavior === item.behavior && "text-blue-600 font-450",
                  selectedBehaviors?.has(item.behavior || '') && "text-blue-700 font-500"
                )}
                onMouseEnter={() => onBehaviorHover?.({
                  behavior: item.behavior || '',
                  guardrailName: item.guardrailName || ''
                })}
                onMouseLeave={() => onBehaviorHover?.(null)}
                onClick={() => onBehaviorClick?.({
                  behavior: item.behavior || '',
                  guardrailName: item.guardrailName || ''
                })}
              >
                {item.text}
              </li>
            ))}
          </ul>
        )}

        {isReasoningExpanded && listItems.length === 0 && (
          <p className="text-sm text-gray-500 pl-6">No reasoning available from the LLM.</p>
        )}
      </div>
    </div>
  )
}
