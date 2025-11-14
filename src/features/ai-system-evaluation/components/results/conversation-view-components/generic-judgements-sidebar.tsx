// Generic Judgements Sidebar Component
// Uses strategy pattern to render different test types (jailbreak, compliance, etc.)

import { useState, useEffect } from 'react'
import { ChevronsUpDown, ChevronsDownUp, Circle, ArrowUpRight, ShieldBan, ShieldCheck, MessageCircleOff, CircleCheckBig, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BaseEvaluationResult, AISystemResponse } from '../../../types/base-evaluation'
import type { EvaluationStrategy } from '../../../strategies/base-strategy'
import type { GuardrailEvaluationDetail } from '../../../types/jailbreak-evaluation'
import type { ComplianceEvaluationResult } from '../../../types/compliance-evaluation'
import type { HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { GuardrailViewSheet } from '@/features/guardrails/components'
import { useGuardrailsSupabase } from '@/features/guardrails/lib/useGuardrailsSupabase'
import { SeverityIcon } from '../severity-icon'
import { getAttackSeverityLevel } from '../../../lib/attack-severity'
import { JudgementDisplay } from './judgement-display'
import { HumanJudgementInput } from './human-judgement-input'
import { useHumanJudgement } from '../../../hooks/use-human-judgement'
import { useUpdateAttackOutcome } from '../../../hooks/use-update-attack-outcome'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

interface GenericJudgementsSidebarProps {
  record: BaseEvaluationResult
  strategy: EvaluationStrategy
  aiSystemName?: string
  expandedKeys?: Set<string>
  onExpandedKeysChange?: (keys: Set<string>) => void
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  onBehaviorClick?: (behavior: HoveredBehaviorContext) => void
  selectedBehaviors?: Set<string> | null
  isAnnotationModeEnabled?: boolean
  testType?: 'jailbreak' | 'compliance'
  onRecordUpdate?: (record: BaseEvaluationResult) => void
}

// Status icons using Lucide icons
function getStatusIcon(status: string) {
  return status === 'Blocked' ?
    <div className='p-1.5 bg-red-50 rounded-full'><ShieldBan className="w-4 h-4 text-red-600" /></div> :
    <div className='p-1.5 bg-green-50 rounded-full'><ShieldCheck className="w-4 h-4 text-green-600" /></div>
}

interface GuardrailDetailCardProps {
  detail: GuardrailEvaluationDetail
  type: 'input' | 'output'
  isExpanded: boolean
  onToggle: (key: string) => void
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  onBehaviorClick?: (behavior: HoveredBehaviorContext) => void
  selectedBehaviors?: Set<string> | null
  onPreviewPolicy?: (guardrailId: string) => void
}

interface ResponseJudgementCardProps {
  record: any
  aiSystemName: string
  isExpanded: boolean
  onToggle: (key: string) => void
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  onBehaviorClick?: (behavior: HoveredBehaviorContext) => void
  selectedBehaviors?: Set<string> | null
  isAnnotationMode?: boolean
  testType?: 'jailbreak' | 'compliance'
  onRecordUpdate?: (record: BaseEvaluationResult) => void
}

function ResponseJudgementCard({
  record,
  aiSystemName,
  isExpanded,
  onToggle,
  hoveredBehavior,
  onBehaviorHover,
  onBehaviorClick,
  selectedBehaviors,
  isAnnotationMode = false,
  testType = 'jailbreak',
  onRecordUpdate
}: ResponseJudgementCardProps) {
  const hasAnswerPhrases = record.judgeModelAnswerPhrases && record.judgeModelAnswerPhrases.length > 0

  // Get judgement - works for both jailbreak and compliance
  const judgement = record.judgeModelJudgement || record.modelJudgement || (record as ComplianceEvaluationResult).compliance_judgement || 'Answered'

  // Get human judgement from system_response
  const systemResponse = record.system_response as AISystemResponse | undefined
  const humanJudgement = systemResponse?.human_judgement

  // Initialize human judgement hook
  const { updateJudgement, isLoading } = useHumanJudgement({
    promptId: record.id || '',
    testType,
    judgementType: 'ai_system_response'
  })

  const handleClick = () => {
    if (!hasAnswerPhrases) return
    onToggle('judge-model')
  }

  const handleHumanJudgementChange = async (value: string | null) => {
    try {
      const updatedRecord = await updateJudgement({ judgementValue: value })
      // Notify parent component of the update
      if (onRecordUpdate && updatedRecord) {
        onRecordUpdate(updatedRecord)
      }
    } catch (error) {
      // Error is already handled in the hook with toast
      console.error('Failed to update human judgement:', error)
    }
  }

  return (
    <motion.div className={`bg-gray-0 border border-gray-200 rounded-lg px-1  flex flex-col w-full ${
      isAnnotationMode
        ? 'shadow-md'
        : isExpanded
          ? 'shadow-md'
          : 'hover:bg-gray-50'
    }`}>
      {/* AI Evaluator Judgement */}
      <div
        className={`flex gap-2 items-start p-1 ${hasAnswerPhrases ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        <JudgementDisplay
          variant="ai"
          judgement={judgement}
          label="AI Evaluator Judgement"
          confidence={record.judgeModelConfidence}
          tokens={record.outputTokens}
          className="flex-1"
        />
        {hasAnswerPhrases && (
          <div className="flex gap-2 p-2 items-center">
            {isExpanded ? (
              <ChevronsDownUp className="w-4 h-4 shrink-0 text-gray-600" />
            ) : (
              <ChevronsUpDown className="w-4 h-4 shrink-0 text-gray-600" />
            )}
          </div>
        )}
      </div>

      {/* Answer Phrases List */}
      <AnimatePresence initial={false}>
        {isExpanded && hasAnswerPhrases && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex flex-col gap-2 overflow-hidden pb-3"
          >
            {record.judgeModelAnswerPhrases!.map((answerPhrase: any, idx: number) => {
              // For answer phrases, use 'Answer Phrase' as the guardrail name to match the hook
              const judgeModelName = 'Answer Phrase'
              const isHovered = hoveredBehavior !== null && hoveredBehavior !== undefined &&
                hoveredBehavior.behavior === answerPhrase.reasoning &&
                hoveredBehavior.guardrailName === judgeModelName
              const isSelected = selectedBehaviors !== null && selectedBehaviors !== undefined && selectedBehaviors.has(answerPhrase.reasoning)

              return (
                <div
                  key={idx}
                  className="flex gap-2 items-start px-2 cursor-pointer"
                  onMouseEnter={() => onBehaviorHover?.({ behavior: answerPhrase.reasoning, guardrailName: judgeModelName })}
                  onMouseLeave={() => onBehaviorHover?.(null)}
                  onClick={() => onBehaviorClick?.({ behavior: answerPhrase.reasoning, guardrailName: judgeModelName })}
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <Circle className={`w-2 h-2 transition-all ${
                      isHovered || isSelected
                        ? 'fill-gray-600 stroke-gray-600'
                        : 'fill-none stroke-gray-600'
                    }`} />
                  </div>
                  <div className={`flex-1 text-[0.8125rem] leading-5 transition-colors ${
                    isHovered || isSelected
                      ? 'text-gray-900'
                      : 'text-gray-600'
                  }`}>
                    {answerPhrase.reasoning}
                  </div>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Human Judgement Section */}
      <AnimatePresence initial={false}>
        {(isAnnotationMode || humanJudgement) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex flex-col gap-1 px-1 py-2 border-t border-gray-200 overflow-hidden"
          >
            <JudgementDisplay
              variant="human"
              judgement={humanJudgement?.judgement || null}
              label="Human Judgement"
              username={humanJudgement?.judgedBy}
              className="flex-1"
            />
            {isAnnotationMode && (
              <HumanJudgementInput
                question="Did the model answer the prompt?"
                value={humanJudgement?.judgement || null}
                onValueChange={handleHumanJudgementChange}
                yesLabel="Yes"
                noLabel="No"
                yesValue="Answered"
                noValue="Refused"
                disabled={isLoading}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function GuardrailDetailCard({
  detail,
  type,
  isExpanded,
  onToggle,
  hoveredBehavior,
  onBehaviorHover,
  onBehaviorClick,
  selectedBehaviors,
  onPreviewPolicy
}: GuardrailDetailCardProps) {
  const uniqueKey = `${type}-${detail.guardrailId}`
  const violations = detail.violations || []
  const totalBehaviors = violations.reduce((sum, v) => sum + v.violatedBehaviors.length, 0)
  const hasViolations = violations.length > 0
  const isAllowed = detail.judgement === 'Allowed'

  const handleClick = () => {
    if (!hasViolations) return
    onToggle(uniqueKey)
  }

  const handlePreviewPolicy = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPreviewPolicy?.(detail.guardrailId)
  }

  return (
    <div className={`bg-gray-0 border border-gray-200 rounded-lg px-1 py-2 flex flex-col gap-3 ${isExpanded ? 'shadow-md' : 'hover:bg-gray-50'}`}>
      <div
        className={`flex gap-2 items-start px-1 ${hasViolations ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        {getStatusIcon(detail.judgement)}
        <div className="flex-1 flex flex-col gap-1 items-start justify-center min-w-0">
          <div className="flex flex-col gap-0.5 items-start justify-center w-full">
            <div className="flex gap-0.5 items-start text-[0.875rem] leading-5 text-gray-900">
              <span className="text-[0.8125rem] font-450">{detail.guardrailName}</span>
            </div>
            <div className="flex gap-1 items-center text-xs leading-4 text-gray-600">
              <span className="font-400">{detail.judgement}</span>
              {hasViolations && (
                <>
                  <span className="font-400">•</span>
                  <span className="font-400">{totalBehaviors} Violation{totalBehaviors > 1 ? 's' : ''}</span>
                </>
              )}
              {detail.confidenceScore !== undefined && (
                <>
                  <span className="font-400">•</span>
                  <span className="font-400">Confidence:</span>
                  <span className="font-400">{detail.confidenceScore.toFixed(2)}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {isAllowed ? (
          <button
            onClick={handlePreviewPolicy}
            className="flex items-center gap-0.5 px-1 py-1 text-xs font-450 text-gray-600 hover:bg-gray-100 pl-2 rounded-full transition-colors"
          >
            Preview Policy
            <ArrowUpRight className='w-4 h-4'/>
          </button>
        ) : hasViolations ? (
          <div className="flex gap-2 items-center py-1">
            {isExpanded ? (
              <ChevronsDownUp className="w-4 h-4 shrink-0 text-gray-600" />
            ) : (
              <ChevronsUpDown className="w-4 h-4 shrink-0 text-gray-600" />
            )}
          </div>
        ) : null}
      </div>

      {/* Violation Phrases List */}
      <AnimatePresence initial={false}>
        {isExpanded && hasViolations && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="flex flex-col gap-2 overflow-hidden"
          >
            {(() => {
              const uniqueBehaviors = new Set<string>()
              violations.forEach((violation) => {
                violation.violatedBehaviors.forEach((behavior) => {
                  uniqueBehaviors.add(behavior)
                })
              })

              return Array.from(uniqueBehaviors).map((behavior) => {
                const isHovered = hoveredBehavior !== null && hoveredBehavior !== undefined &&
                  hoveredBehavior.behavior === behavior &&
                  hoveredBehavior.guardrailName === detail.guardrailName
                const isSelected = selectedBehaviors !== null && selectedBehaviors !== undefined && selectedBehaviors.has(behavior)

                return (
                  <div
                    key={behavior}
                    className="flex gap-2 items-start px-2 cursor-pointer"
                    onMouseEnter={() => onBehaviorHover?.({ behavior, guardrailName: detail.guardrailName })}
                    onMouseLeave={() => onBehaviorHover?.(null)}
                    onClick={() => onBehaviorClick?.({ behavior, guardrailName: detail.guardrailName })}
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <Circle className={`w-2 h-2 transition-all ${
                        isHovered || isSelected
                          ? 'fill-gray-600 stroke-gray-600'
                          : 'fill-none stroke-gray-600'
                      }`} />
                    </div>
                    <div className={`flex-1 text-[0.8125rem] leading-5 transition-colors ${
                      isHovered || isSelected
                        ? 'text-gray-900'
                        : 'text-gray-600'
                    }`}>
                      {behavior}
                    </div>
                  </div>
                )
              })
            })()}

            {/* Preview Policy Button at the end of violations */}
            <div className="flex justify-start ml-6 px-2 pt-1">
              <button
                onClick={handlePreviewPolicy}
                className="flex items-center gap-0.5 px-2 py-1 text-xs font-450 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                Preview All Behaviors
                <ArrowUpRight className='w-3.5 h-3.5'/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function GenericJudgementsSidebar({
  record,
  strategy,
  aiSystemName = 'AI System',
  expandedKeys: externalExpandedKeys,
  onExpandedKeysChange,
  hoveredBehavior,
  onBehaviorHover,
  onBehaviorClick,
  selectedBehaviors,
  isAnnotationModeEnabled = false,
  testType,
  onRecordUpdate
}: GenericJudgementsSidebarProps) {
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(new Set())
  const [viewPolicySheetOpen, setViewPolicySheetOpen] = useState(false)
  const [selectedGuardrailId, setSelectedGuardrailId] = useState<string | null>(null)
  const [outcomeManuallyUpdated, setOutcomeManuallyUpdated] = useState(false)

  const { guardrails } = useGuardrailsSupabase()

  // Initialize hook for updating attack outcome
  const { updateOutcome, isLoading: isUpdatingOutcome } = useUpdateAttackOutcome({
    promptId: (record as any).id || '',
    testType: testType || 'jailbreak'
  })

  const expandedKeys = externalExpandedKeys !== undefined ? externalExpandedKeys : internalExpandedKeys
  const setExpandedKeys = onExpandedKeysChange || setInternalExpandedKeys

  useEffect(() => {
    if (onExpandedKeysChange) {
      onExpandedKeysChange(new Set())
    } else {
      setInternalExpandedKeys(new Set())
    }
  }, [record, onExpandedKeysChange])

  // Reset outcomeManuallyUpdated when the record's human judgement changes
  // This ensures the alert re-appears if the user modifies their judgement
  useEffect(() => {
    const systemResponse = (record as any).system_response as AISystemResponse | undefined
    const humanJudgementData = systemResponse?.human_judgement
    // If outcome_updated is false in the database, reset local state
    // OR if the human judgement was changed and no longer needs an update
    if (humanJudgementData && !humanJudgementData.outcome_updated) {
      setOutcomeManuallyUpdated(false)
    }
  }, [(record as any).system_response?.human_judgement, (record as any).attackOutcome, (record as any).attack_outcome])

  const handleToggle = (key: string) => {
    const newKeys = new Set(expandedKeys)
    if (newKeys.has(key)) {
      newKeys.delete(key)
    } else {
      newKeys.add(key)
    }
    setExpandedKeys(newKeys)
  }

  const handlePreviewPolicy = (guardrailId: string) => {
    setSelectedGuardrailId(guardrailId)
    setViewPolicySheetOpen(true)
  }

  // Sort function for guardrail details
  const sortGuardrailDetails = (details: GuardrailEvaluationDetail[]) => {
    return [...details].sort((a, b) => {
      if (a.judgement === 'Blocked' && b.judgement !== 'Blocked') return -1
      if (a.judgement !== 'Blocked' && b.judgement === 'Blocked') return 1

      const aConfidence = a.confidenceScore ?? 0
      const bConfidence = b.confidenceScore ?? 0
      if (aConfidence !== bConfidence) return bConfidence - aConfidence

      const aViolations = a.violations?.reduce((sum, v) => sum + v.violatedBehaviors.length, 0) ?? 0
      const bViolations = b.violations?.reduce((sum, v) => sum + v.violatedBehaviors.length, 0) ?? 0
      return bViolations - aViolations
    })
  }

  const selectedGuardrail = guardrails.find(g => g.id === selectedGuardrailId) || null

  // Get guardrail details from record (works for both jailbreak and compliance)
  const inputGuardrailDetails = (record as any).inputGuardrailDetails || []
  const outputGuardrailDetails = (record as any).outputGuardrailDetails || []
  const hasGuardrails = inputGuardrailDetails.length > 0 || outputGuardrailDetails.length > 0

  // Get attack info for jailbreak evaluations
  const jbRecord = record as any
  const hasAttackType = 'attackType' in jbRecord

  // Check for judgement and attack outcome mismatch
  const systemResponse = (record as any).system_response as AISystemResponse | undefined
  const humanJudgementData = systemResponse?.human_judgement
  const humanJudgement = humanJudgementData?.judgement

  // Get current attack outcome
  // Support both jailbreak (attack_outcome) and compliance (final_outcome)
  const currentAttackOutcome = (record as any).attackOutcome || (record as any).attack_outcome || (record as any).final_outcome

  // Calculate expected outcome based on test type and human judgement
  let expectedAttackOutcome: string | null = null
  if (humanJudgement) {
    if (testType === 'jailbreak') {
      // For jailbreak: Attack Success/Failure
      if (humanJudgement === 'Answered') {
        expectedAttackOutcome = 'Attack Success'
      } else if (humanJudgement === 'Refused') {
        expectedAttackOutcome = 'Attack Failure'
      }
    } else {
      // For compliance: Calculate TP/TN/FP/FN based on ground_truth and judgement
      const complianceRecord = record as ComplianceEvaluationResult
      const groundTruth = complianceRecord.ground_truth

      if (groundTruth === 'Compliant' && humanJudgement === 'Answered') {
        expectedAttackOutcome = 'TP'
      } else if (groundTruth === 'Non-Compliant' && humanJudgement === 'Refused') {
        expectedAttackOutcome = 'TN'
      } else if (groundTruth === 'Compliant' && humanJudgement === 'Refused') {
        expectedAttackOutcome = 'FP'
      } else if (groundTruth === 'Non-Compliant' && humanJudgement === 'Answered') {
        expectedAttackOutcome = 'FN'
      }
    }
  }

  // Determine if attack outcome needs to be updated
  // Show alert if expected outcome (based on human judgement) doesn't match current outcome
  // This handles three cases:
  // 1. Human judgement contradicts AI judgement
  // 2. Human judgement matches AI judgement, but attack outcome doesn't match
  // 3. Attack outcome was manually changed and no longer matches human judgement
  const needsOutcomeUpdate = humanJudgement && expectedAttackOutcome && currentAttackOutcome !== expectedAttackOutcome

  // Check if outcome has been updated (from database or local state)
  const isOutcomeUpdated = humanJudgementData?.outcome_updated || outcomeManuallyUpdated

  // Handler to update attack outcome based on human judgement
  const handleUpdateOutcome = async () => {
    if (!humanJudgement) return

    try {
      const updatedRecord = await updateOutcome(humanJudgement)
      setOutcomeManuallyUpdated(true)

      // Notify parent component of the update
      if (onRecordUpdate && updatedRecord) {
        onRecordUpdate(updatedRecord)
      }
    } catch (error) {
      console.error('Failed to update attack outcome:', error)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-0" onWheel={(e) => e.stopPropagation()}>
      <div className="flex flex-col gap-6 items-start py-5 px-4">
        {/* Title */}
        <div className="flex flex-col gap-3 items-start w-full">
          <h2 className="text-sm font-450 leading-5 text-gray-900">Evaluation Outcome</h2>

          {/* Summary Cards */}
          <div className="flex gap-2 items-center w-full">
            {/* First Card: Attack Type (Jailbreak) or Base Prompt (Compliance) */}
            {hasAttackType ? (
              // Jailbreak: Attack Type Card
              <div className="flex-1 min-w-36 bg-gray-100 rounded-lg p-2 flex flex-col gap-1">
                <div className="flex gap-0.5 items-start">
                  <span className="text-xs font-400 leading-4 text-gray-900">Attack</span>
                </div>
                <div className="flex gap-1 items-center">
                  <SeverityIcon level={getAttackSeverityLevel(jbRecord.attackType)} size="sm" />
                  <span className="text-[0.8125rem] font-450 text-gray-900">
                    {jbRecord.attackType}
                  </span>
                </div>
              </div>
            ) : (
              // Compliance: Base Prompt Card (Ground Truth)
              (() => {
                const complianceRecord = record as ComplianceEvaluationResult
                const groundTruth = complianceRecord.ground_truth
                const isCompliant = groundTruth === 'Compliant'

                return (
                  <div className="flex-1 min-w-36 bg-gray-100 rounded-lg p-2 flex flex-col gap-1">
                    <div className="flex gap-0.5 items-start">
                      <span className="text-xs font-400 leading-4 text-gray-900">Prompt Ground Truth</span>
                    </div>
                    <div className="flex gap-1 items-center">
                      {isCompliant ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                      )}
                      <span className="text-[0.8125rem] font-450 text-gray-900">
                        {groundTruth}
                      </span>
                    </div>
                  </div>
                )
              })()
            )}

            {/* Guardrails Card (if present) */}
            {(jbRecord.inputGuardrailJudgement || jbRecord.outputGuardrailJudgement ||
              jbRecord.inputGuardrailDetails?.length || jbRecord.outputGuardrailDetails?.length) && (
              <div className="flex-1 bg-gray-100 rounded-lg p-2 flex flex-col gap-1">
                <div className="flex gap-0.5 items-start">
                  <span className="text-xs font-400 leading-4 text-gray-900">Guardrails</span>
                </div>
                <div className="flex gap-1 items-center">
                  {(jbRecord.inputGuardrailJudgement || jbRecord.outputGuardrailJudgement) === 'Blocked' ? (
                    <ShieldBan className="w-3.5 h-3.5 text-red-600" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  )}
                  <span className="text-[0.8125rem] font-450 leading-5 text-gray-900">
                    {jbRecord.inputGuardrailJudgement || jbRecord.outputGuardrailJudgement}
                  </span>
                </div>
              </div>
            )}

            {/* AI System Card (ALWAYS shown for both test types) */}
            <div className="flex-1 bg-gray-100 rounded-lg p-2 flex flex-col gap-1">
              <div className="flex gap-0.5 items-start">
                <span className="text-xs font-400 leading-4 text-gray-900">AI System</span>
              </div>
              <div className="flex gap-1 items-center">
                {(() => {
                  const judgement = hasAttackType
                    ? (jbRecord.judgeModelJudgement || jbRecord.modelJudgement)
                    : ((record as ComplianceEvaluationResult).compliance_judgement || 'Answered')

                  const isRefused = judgement === 'Blocked' || judgement === 'Refused'

                  return (
                    <>
                      {isRefused ? (
                        <MessageCircleOff className="w-3.5 h-3.5 text-red-600" />
                      ) : (
                        <CircleCheckBig className="w-3.5 h-3.5 text-green-600" />
                      )}
                      <span className="text-[0.8125rem] font-450 leading-5 text-gray-900">
                        {judgement}
                      </span>
                    </>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Guardrail Judgement Section */}
        {hasGuardrails && (
          <div className="flex flex-col gap-2 items-start w-full">
            <h3 className="text-xs font-450 leading-4 text-gray-600">
              Guardrail Judgement
            </h3>
            <div className="flex flex-col gap-2 w-full">
              {inputGuardrailDetails.length > 0 && (
                <>
                  {sortGuardrailDetails(inputGuardrailDetails).map((detail: GuardrailEvaluationDetail) => {
                    const key = `input-${detail.guardrailId}`
                    return (
                      <GuardrailDetailCard
                        key={key}
                        detail={detail}
                        type="input"
                        isExpanded={expandedKeys.has(key)}
                        onToggle={handleToggle}
                        hoveredBehavior={hoveredBehavior}
                        onBehaviorHover={onBehaviorHover}
                        onBehaviorClick={onBehaviorClick}
                        selectedBehaviors={selectedBehaviors}
                        onPreviewPolicy={handlePreviewPolicy}
                      />
                    )
                  })}
                </>
              )}

              {outputGuardrailDetails.length > 0 && (
                <>
                  {sortGuardrailDetails(outputGuardrailDetails).map((detail: GuardrailEvaluationDetail) => {
                    const key = `output-${detail.guardrailId}`
                    return (
                      <GuardrailDetailCard
                        key={key}
                        detail={detail}
                        type="output"
                        isExpanded={expandedKeys.has(key)}
                        onToggle={handleToggle}
                        hoveredBehavior={hoveredBehavior}
                        onBehaviorHover={onBehaviorHover}
                        onBehaviorClick={onBehaviorClick}
                        selectedBehaviors={selectedBehaviors}
                        onPreviewPolicy={handlePreviewPolicy}
                      />
                    )
                  })}
                </>
              )}
            </div>
          </div>
        )}

        {/* Response Judgement Section - For both Jailbreak and Compliance */}
        {(() => {
          const hasResponseJudgement = hasAttackType
            ? (jbRecord.judgeModelJudgement || jbRecord.modelJudgement)
            : ((record as ComplianceEvaluationResult).compliance_judgement)

          if (!hasResponseJudgement) return null

          return (
            <div className="flex flex-col gap-2 items-start w-full">
              <h3 className="text-xs font-450 leading-4 text-gray-600">
                AI System Response Judgement
              </h3>
              <ResponseJudgementCard
                record={record}
                aiSystemName={aiSystemName || 'AI System'}
                isExpanded={expandedKeys.has('judge-model')}
                onToggle={handleToggle}
                hoveredBehavior={hoveredBehavior}
                onBehaviorHover={onBehaviorHover}
                onBehaviorClick={onBehaviorClick}
                selectedBehaviors={selectedBehaviors}
                isAnnotationMode={isAnnotationModeEnabled}
                testType={testType}
                onRecordUpdate={onRecordUpdate}
              />

              {/* Attack Outcome Update Alert or Manual Update Info */}
              {needsOutcomeUpdate && !isOutcomeUpdated ? (
                <div className="w-full bg-amber-100/80 rounded-lg p-3 flex flex-col gap-2">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mx-1" />
                    <div className="flex flex-col gap-1 flex-1">
                      <p className="text-xs font-450 text-gray-900">Attack Outcome Update Required</p>
                      <p className="text-xs font-400 text-gray-600">
                        Human judgement contradicts with the current attack outcome. Would you like to update the attack outcome?
                      </p>
                      <Button
                      size="sm"
                    onClick={handleUpdateOutcome}
                    disabled={isUpdatingOutcome}
                    className="w-fit text-xs h-6 bg-amber-200/80 hover:bg-amber-200 text-amber-800 my-1"
                  >
                    {isUpdatingOutcome ? 'Updating...' : 'Update Attack Outcome'}
                  </Button>
                    </div>
                  </div>

                </div>
              ) : (humanJudgement && isOutcomeUpdated) ? (
                <div className="w-full bg-gray-100 rounded-lg p-3 flex gap-2 items-start">
                  <Info className="w-4 h-4 text-gray-600 flex-shrink-0" />
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-400 text-gray-600">
                      Attack outcome has been updated based on human review.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })()}
      </div>

      {/* Guardrail View Sheet */}
      <GuardrailViewSheet
        open={viewPolicySheetOpen}
        onOpenChange={setViewPolicySheetOpen}
        guardrail={selectedGuardrail}
      />
    </div>
  )
}
