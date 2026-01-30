// Guardrail Judgement Review Card Component
// Allows users to review guardrail judgements with checkboxes

import { useState } from 'react'
import { BookOpen, ChevronUp, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import type { GuardrailEvaluationDetail } from '../../../types/jailbreak-evaluation'
import type { HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { cn } from '@/lib/utils'

interface GuardrailJudgementReviewCardProps {
  inputGuardrails: GuardrailEvaluationDetail[]
  outputGuardrails: GuardrailEvaluationDetail[]
  isAnnotationModeEnabled?: boolean
  onPreviewPolicy?: (policyId: string, policyName: string) => void
  // Phrase highlighting props
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  onBehaviorClick?: (behavior: HoveredBehaviorContext) => void
  selectedBehaviors?: Set<string> | null
}

export function GuardrailJudgementReviewCard({
  inputGuardrails,
  outputGuardrails,
  isAnnotationModeEnabled = false,
  onPreviewPolicy,
  hoveredBehavior,
  onBehaviorHover,
  onBehaviorClick,
  selectedBehaviors
}: GuardrailJudgementReviewCardProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false)
  const [selectedGuardrails, setSelectedGuardrails] = useState<Set<string>>(new Set())
  const [hoveredGuardrail, setHoveredGuardrail] = useState<string | null>(null)

  // Combine all guardrails
  const allGuardrails = [...inputGuardrails, ...outputGuardrails]

  // Check both 'judgement' and 'outcome' properties, and handle case variations
  const isBlocked = (g: GuardrailEvaluationDetail) => {
    const judgement = (g as any).judgement || (g as any).outcome || ''
    return judgement === 'Blocked' || judgement === 'BLOCKED'
  }

  // Get all violated guardrails (these will all show LLM-Answer badge)
  const violatedGuardrails = allGuardrails.filter(isBlocked)
  const violatedGuardrailIds = new Set(violatedGuardrails.map(g => g.guardrailId))

  // Check if LLM selected none (no violations)
  const llmSelectedNone = violatedGuardrails.length === 0

  const handleGuardrailSelect = (guardrailId: string) => {
    if (!isAnnotationModeEnabled) return

    setSelectedGuardrails(prev => {
      const newSet = new Set(prev)
      if (guardrailId === 'none') {
        // If selecting "None", clear all other selections
        return newSet.has('none') ? new Set() : new Set(['none'])
      } else {
        // If selecting a guardrail, remove "None" if selected
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
    <div className="flex flex-col gap-4 w-full">
      {/* Question Section with Number */}
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs font-500 text-gray-700">1</span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-450 text-gray-900">
            Does the Input Prompt Violate Any of the Following Guardrails?
          </h3>
          <p className="text-sm font-400 text-gray-600">
            Select the most relevant guardrail if the input is non-compliant. If none apply, select None (Fully Compliant).
          </p>
        </div>
      </div>

      {/* Guardrail Options */}
      <div className="flex flex-col w-full">
        {allGuardrails.map((guardrail) => {
          const isSelected = selectedGuardrails.has(guardrail.guardrailId)
          const isLLMViolated = violatedGuardrailIds.has(guardrail.guardrailId)
          const isHovered = hoveredGuardrail === guardrail.guardrailId

          return (
            <div
              key={guardrail.guardrailId}
              className={cn(
                'flex items-center gap-3 px-3 py-3 transition-all border-b border-gray-100 last:border-b-0',
                isSelected && 'bg-blue-50',
                !isAnnotationModeEnabled && 'cursor-not-allowed opacity-50'
              )}
              onMouseEnter={() => setHoveredGuardrail(guardrail.guardrailId)}
              onMouseLeave={() => setHoveredGuardrail(null)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleGuardrailSelect(guardrail.guardrailId)}
                disabled={!isAnnotationModeEnabled}
                className="border-gray-400"
              />
              <span className="flex-1 text-sm font-400 text-gray-900">
                {guardrail.guardrailName}
              </span>

              {/* Preview Policy Button - shown on hover (hides badges) */}
              {isHovered && onPreviewPolicy ? (
                <button
                  onClick={(e) => handlePreviewClick(e, guardrail.guardrailId, guardrail.guardrailName)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-900 rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Preview
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              ) : (
                /* Badges - hidden on hover */
                <div className="flex items-center gap-1.5">
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs bg-blue-600 text-white hover:bg-blue-600">
                      You
                    </Badge>
                  )}
                  {isLLMViolated && (
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
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
            'flex items-center gap-3 px-3 py-3 transition-all',
            selectedGuardrails.has('none') && 'bg-blue-50',
            !isAnnotationModeEnabled && 'cursor-not-allowed opacity-50'
          )}
          onMouseEnter={() => setHoveredGuardrail('none')}
          onMouseLeave={() => setHoveredGuardrail(null)}
        >
          <Checkbox
            checked={selectedGuardrails.has('none')}
            onCheckedChange={() => handleGuardrailSelect('none')}
            disabled={!isAnnotationModeEnabled}
            className="border-gray-400"
          />
          <span className="flex-1 text-sm font-400 text-gray-900">
            None (Fully Compliant)
          </span>

          {/* Badges for None option */}
          <div className="flex items-center gap-1.5">
            {selectedGuardrails.has('none') && (
              <Badge variant="secondary" className="text-xs bg-blue-600 text-white hover:bg-blue-600">
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
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
          className="flex items-center gap-2 text-sm font-400 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Show LLM Predicted Violations</span>
          <ChevronUp className={cn(
            "w-4 h-4 transition-transform",
            !isReasoningExpanded && "rotate-180"
          )} />
        </button>

          {isReasoningExpanded && violatedGuardrails.length > 0 && (
          <div className="flex flex-col gap-4 pl-6">
            {violatedGuardrails.map((guardrail, gIdx) => {
              // Get unique violated behaviors from violations
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
                  {/* Policy Name */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-450 text-gray-500 uppercase">
                      What Policy It Has Violated
                    </span>
                    <span className="text-sm font-450 text-gray-900">
                      {guardrail.guardrailName}
                    </span>
                  </div>

                  {/* Behaviors */}
                  {behaviorsList.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-450 text-gray-500 uppercase">
                        What Behavior It Is
                      </span>
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
