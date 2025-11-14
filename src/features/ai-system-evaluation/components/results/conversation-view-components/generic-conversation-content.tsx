// Generic Conversation Content Component
// Displays the main content area without the sidebar

import { UserRoundCheck } from 'lucide-react'
import type { BaseEvaluationResult } from '../../../types/base-evaluation'
import type { EvaluationStrategy, HighlightingContext } from '../../../strategies/base-strategy'
import type { ComplianceEvaluationResult } from '../../../types/compliance-evaluation'

interface GenericConversationContentProps {
  record: BaseEvaluationResult
  strategy: EvaluationStrategy
  highlightingContext: HighlightingContext
  className?: string
  testType?: 'jailbreak' | 'compliance'
}

export function GenericConversationContent({
  record,
  strategy,
  highlightingContext,
  className = '',
  testType = 'jailbreak'
}: GenericConversationContentProps) {
  // Get conversation sections from strategy
  const sections = strategy.getConversationSections()
  const title = strategy.getConversationTitle(record)
  const badge = strategy.getConversationBadge(record)

  // Check if there's a human judgement
  const systemResponse = (record as any).system_response
  const hasHumanJudgement = systemResponse?.human_judgement?.judgement
  const humanJudgementData = systemResponse?.human_judgement

  // Get AI judgement
  const recordAny = record as any
  const hasAttackType = 'attackType' in recordAny
  const aiJudgement = hasAttackType
    ? (recordAny.judgeModelJudgement || recordAny.modelJudgement)
    : ((record as ComplianceEvaluationResult).compliance_judgement || 'Answered')

  // Check if human judgement conflicts with AI judgement
  const humanAiConflict = hasHumanJudgement && aiJudgement && hasHumanJudgement !== aiJudgement

  // Check for judgement conflict
  // Support both jailbreak (attack_outcome) and compliance (final_outcome)
  const currentAttackOutcome = (record as any).attackOutcome || (record as any).attack_outcome || (record as any).final_outcome
  let expectedAttackOutcome: string | null = null
  if (hasHumanJudgement) {
    if (testType === 'jailbreak') {
      // For jailbreak: Attack Success/Failure
      if (hasHumanJudgement === 'Answered') {
        expectedAttackOutcome = 'Attack Success'
      } else if (hasHumanJudgement === 'Refused') {
        expectedAttackOutcome = 'Attack Failure'
      }
    } else {
      // For compliance: Calculate TP/TN/FP/FN based on ground_truth and judgement
      const complianceRecord = record as ComplianceEvaluationResult
      const groundTruth = complianceRecord.ground_truth

      if (groundTruth === 'Compliant' && hasHumanJudgement === 'Answered') {
        expectedAttackOutcome = 'TP'
      } else if (groundTruth === 'Non-Compliant' && hasHumanJudgement === 'Refused') {
        expectedAttackOutcome = 'TN'
      } else if (groundTruth === 'Compliant' && hasHumanJudgement === 'Refused') {
        expectedAttackOutcome = 'FP'
      } else if (groundTruth === 'Non-Compliant' && hasHumanJudgement === 'Answered') {
        expectedAttackOutcome = 'FN'
      }
    }
  }
  const hasJudgementConflict = humanAiConflict && expectedAttackOutcome && currentAttackOutcome !== expectedAttackOutcome && !humanJudgementData?.outcome_updated

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  // Filter sections based on condition
  const visibleSections = sortedSections.filter(section =>
    !section.condition || section.condition(record)
  )

  return (
    <div className={`h-full overflow-y-auto border-l border-r border-gray-200 py-6 px-12 ${className}`} onWheel={(e) => e.stopPropagation()}>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header with Title and Badge */}
        {(title || badge || hasHumanJudgement || hasJudgementConflict) && (
          <section className="px-2 space-y-2 pb-2">
            {title && (
              <h2 className="text-lg font-450 leading-6 text-gray-900">
                {title}
              </h2>
            )}
            <div className="flex items-center gap-2">
              {badge && (
                <span
                  className={`px-2 py-1 rounded-full text-xs font-450 ${
                    badge.variant === 'destructive'
                      ? 'bg-red-50 text-red-700'
                      : badge.variant === 'default'
                      ? 'bg-green-50 text-green-700'
                      : badge.variant === 'outline'
                      ? 'bg-gray-50 text-gray-700 border border-gray-200'
                      : 'bg-gray-100 text-gray-700'
                  } ${badge.color || ''}`}
                >
                  {badge.text}
                </span>
              )}
              {hasJudgementConflict && (
                <span className="px-2 py-1 rounded-full text-xs font-450 bg-amber-100/80 text-amber-700">
                  Judgment Conflict
                </span>
              )}
              {hasHumanJudgement && !hasJudgementConflict && (
                <span className="px-2 py-1 rounded-full text-xs font-450 bg-blue-50 text-blue-700 flex items-center gap-1">
                  <UserRoundCheck className="w-3.5 h-3.5" />
                  Human Labeled
                </span>
              )}
            </div>
          </section>
        )}

        {/* Dynamic Sections from Strategy */}
        {visibleSections.map((section) => (
          <section key={section.key} className="space-y-3">
            {section.render(record, highlightingContext)}
          </section>
        ))}
      </div>
    </div>
  )
}
