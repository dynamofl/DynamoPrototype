import type { JailbreakEvaluationResult, GuardrailEvaluationDetail } from '../../types/jailbreak-evaluation'
import { InfoIcon, ChevronsUpDown, ChevronsDownUp, MessageCircleOff, CircleCheckBig, ShieldBan, ShieldCheck, Circle, ArrowUpRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { SeverityIcon } from './severity-icon'
import { getAttackSeverityLevel } from '../../lib/attack-severity'
import { GuardrailViewSheet } from '@/features/guardrails/components'
import { useGuardrailsSupabase } from '@/features/guardrails/lib/useGuardrailsSupabase'

interface JudgementsSidebarProps {
  record: JailbreakEvaluationResult
  aiSystemName?: string
  expandedKeys?: Set<string>
  onExpandedKeysChange?: (keys: Set<string>) => void
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  selectedBehaviors?: Set<string> | null
}

// Info Icon component
const InfoIconOutline = () => <InfoIcon className="w-4 h-4 text-gray-400" />

// Status icons using Lucide icons
function getStatusIcon(status: string) {
  return status === 'Blocked' ?
    
    <div className='p-1.5 bg-red-50 rounded-full'><ShieldBan className="w-4 h-4 text-red-600" /></div> :
    <div className='p-1.5 bg-green-50 rounded-full'><ShieldCheck className="w-4 h-4 text-green-600" /></div>
}

function getModelStatusIcon(status: string) {
  return status === 'Refused' ?
     <div className='p-1.5 bg-red-50 rounded-full'><MessageCircleOff className="w-4 h-4 text-red-600" /></div> :
   <div className='p-1.5 bg-green-50 rounded-full'><CircleCheckBig className="w-4 h-4 text-green-600" /></div>
}

interface GuardrailDetailCardProps {
  detail: GuardrailEvaluationDetail
  type: 'input' | 'output'
  isExpanded: boolean
  onToggle: (key: string) => void
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  selectedBehaviors?: Set<string> | null
  onPreviewPolicy?: (guardrailId: string) => void
}

interface ResponseJudgementCardProps {
  record: JailbreakEvaluationResult
  aiSystemName: string
  isExpanded: boolean
  onToggle: (key: string) => void
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  selectedBehaviors?: Set<string> | null
}

function ResponseJudgementCard({ record, aiSystemName, isExpanded, onToggle, hoveredBehavior, onBehaviorHover, selectedBehaviors }: ResponseJudgementCardProps) {
  const hasAnswerPhrases = record.judgeModelAnswerPhrases && record.judgeModelAnswerPhrases.length > 0

  const handleClick = () => {
    if (!hasAnswerPhrases) return
    onToggle('judge-model')
  }

  return (
    <div className={`bg-gray-0 border border-gray-200 rounded-lg px-1 py-2 flex flex-col gap-3 w-full ${isExpanded ? 'shadow-md' : 'hover:bg-gray-50'}`}>
      <div
        className={`flex gap-2 items-start px-1 ${hasAnswerPhrases ? 'cursor-pointer' : ''}`}
        onClick={handleClick}
      >
        {getModelStatusIcon(record.judgeModelJudgement || record.modelJudgement)}
        <div className="flex-1 flex flex-col gap-1 items-start justify-center min-w-0">
          <div className="flex flex-col gap-0.5 items-start justify-center w-full">
            <div className="flex gap-0.5 items-start text-[0.875rem] leading-5 text-gray-900">
              <span className="text-[0.8125rem] font-450">{aiSystemName}</span>
            </div>
            <div className="flex gap-1 items-center text-xs leading-4 text-gray-600">
              <>
                  <span className="font-400">{record.judgeModelJudgement || record.modelJudgement}</span>

              </>
              {/* {hasAnswerPhrases && (
                <>
                  <span className="font-400">•</span>
                  <span className="font-400">{record.judgeModelAnswerPhrases!.length} Phrases</span>
                </>
              )} */}
              {record.judgeModelConfidence !== undefined && record.judgeModelConfidence !== null && (
                <>
                                  <span className="font-400">•</span>

                  <span className="font-400">Confidence:</span>
                  <span className="font-400">{record.judgeModelConfidence.toFixed(2)}</span>
                </>
              )}
              {record.outputTokens !== undefined && (
                <>
                  {record.judgeModelConfidence !== undefined && record.judgeModelConfidence !== null && <span className="font-425">•</span>}
                  <span className="font-400">Tokens:</span>
                  <span className="font-400">{record.outputTokens.toLocaleString()}</span>
                </>
              )}
              
            </div>
          </div>
        </div>
        {hasAnswerPhrases && (
          <div className="flex gap-2 items-center">
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
            className="flex flex-col gap-2 overflow-hidden"
          >
            {record.judgeModelAnswerPhrases!.map((answerPhrase, idx) => {
              // For answer phrases, use the reasoning as the behavior
              const judgeModelName = aiSystemName // AI system name for judge model
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
    </div>
  )
}

function GuardrailDetailCard({ detail, type, isExpanded, onToggle, hoveredBehavior, onBehaviorHover, selectedBehaviors, onPreviewPolicy }: GuardrailDetailCardProps) {
  // Use guardrailId as the unique key to avoid index mismatch issues with sorting
  const uniqueKey = `${type}-${detail.guardrailId}`
  // Get violations array and count total behaviors across all violations
  const violations = detail.violations || []
  const totalBehaviors = violations.reduce((sum, v) => sum + v.violatedBehaviors.length, 0)

  // Only show expand/collapse for judgements with violations
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
              <>
                <span className="font-400">{detail.judgement}</span>
              </>

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
              // Deduplicate behaviors
              const uniqueBehaviors = new Set<string>()
              violations.forEach((violation) => {
                violation.violatedBehaviors.forEach((behavior) => {
                  uniqueBehaviors.add(behavior)
                })
              })

              return Array.from(uniqueBehaviors).map((behavior) => {
                // Check if this behavior is being hovered
                const isHovered = hoveredBehavior !== null && hoveredBehavior !== undefined &&
                  hoveredBehavior.behavior === behavior &&
                  hoveredBehavior.guardrailName === detail.guardrailName
                // Check if this behavior is selected (from phrase click)
                const isSelected = selectedBehaviors !== null && selectedBehaviors !== undefined && selectedBehaviors.has(behavior)

                return (
                  <div
                    key={behavior}
                    className="flex gap-2 items-start px-2 cursor-pointer"
                    onMouseEnter={() => onBehaviorHover?.({ behavior, guardrailName: detail.guardrailName })}
                    onMouseLeave={() => onBehaviorHover?.(null)}
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

export function JudgementsSidebar({
  record,
  aiSystemName = 'AI System',
  expandedKeys: externalExpandedKeys,
  onExpandedKeysChange,
  hoveredBehavior,
  onBehaviorHover,
  selectedBehaviors
}: JudgementsSidebarProps) {
  // Use internal state if no external state is provided
  const [internalExpandedKeys, setInternalExpandedKeys] = useState<Set<string>>(new Set())
  const [viewPolicySheetOpen, setViewPolicySheetOpen] = useState(false)
  const [selectedGuardrailId, setSelectedGuardrailId] = useState<string | null>(null)

  // Fetch guardrails data
  const { guardrails } = useGuardrailsSupabase()

  // Determine which state to use
  const expandedKeys = externalExpandedKeys !== undefined ? externalExpandedKeys : internalExpandedKeys
  const setExpandedKeys = onExpandedKeysChange || setInternalExpandedKeys

  // Reset expansion state when record changes
  useEffect(() => {
    if (onExpandedKeysChange) {
      // Only reset if using external state
      onExpandedKeysChange(new Set())
    } else {
      setInternalExpandedKeys(new Set())
    }
  }, [record, onExpandedKeysChange])

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

  // Sort function for guardrail details: Blocked first, high confidence first, more violations first
  const sortGuardrailDetails = (details: GuardrailEvaluationDetail[]) => {
    return [...details].sort((a, b) => {
      // 1. Blocked first
      if (a.judgement === 'Blocked' && b.judgement !== 'Blocked') return -1
      if (a.judgement !== 'Blocked' && b.judgement === 'Blocked') return 1

      // 2. Higher confidence first
      const aConfidence = a.confidenceScore ?? 0
      const bConfidence = b.confidenceScore ?? 0
      if (aConfidence !== bConfidence) return bConfidence - aConfidence

      // 3. More violations first
      const aViolations = a.violations?.reduce((sum, v) => sum + v.violatedBehaviors.length, 0) ?? 0
      const bViolations = b.violations?.reduce((sum, v) => sum + v.violatedBehaviors.length, 0) ?? 0
      return bViolations - aViolations
    })
  }

  // Find the selected guardrail
  const selectedGuardrail = guardrails.find(g => g.id === selectedGuardrailId) || null

  return (
    <div className="h-full overflow-y-auto bg-gray-0">
      <div className="flex flex-col gap-6 items-start py-5 px-4">
        {/* Title */}
        <div className="flex flex-col gap-3 items-start w-full">
        <h2 className="text-sm font-450 leading-5 text-gray-900">Evaluation Judgement</h2>

        {/* Summary Cards */}
        <div className="flex gap-2 items-center w-full">
          {/* Prompt */}
          <div className="flex-1 min-w-36 bg-gray-100  rounded-lg p-2 flex flex-col gap-1">
            <div className="flex gap-0.5 items-start">
              <span className="text-xs font-400 leading-4 text-gray-900">Attack</span>
            </div>
            <div className="flex gap-1 items-center">
              <SeverityIcon level={getAttackSeverityLevel(record.attackType)} size="sm" />
              <span className="text-[0.8125rem] font-450  text-gray-900">
                {record.attackType}
              </span>
            </div>
          </div>

          {/* Guardrails - Only show if guardrails are present */}
          {(record.inputGuardrailJudgement || record.outputGuardrailJudgement ||
            record.inputGuardrailDetails?.length || record.outputGuardrailDetails?.length) && (
            <div className="flex-1 bg-gray-100 rounded-lg p-2 flex flex-col gap-1">
              <div className="flex gap-0.5 items-start">
                <span className="text-xs font-400 leading-4 text-gray-900">Guardrails</span>
              </div>
              <div className="flex gap-1 items-center">
                {(record.inputGuardrailJudgement || record.outputGuardrailJudgement) === 'Blocked' ? (
                  <ShieldBan className="w-3.5 h-3.5 text-red-600" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                )}
                <span className="text-[0.8125rem] font-450 leading-5 text-gray-900">
                  {record.inputGuardrailJudgement || record.outputGuardrailJudgement}
                </span>
              </div>
            </div>
          )}

          {/* Model */}
          <div className="flex-1 bg-gray-100  rounded-lg p-2 flex flex-col gap-1">
            <div className="flex gap-0.5 items-start">
              <span className="text-xs font-400 leading-4 text-gray-900">AI System</span>
            </div>
            <div className="flex gap-1 items-center">
              {((record.judgeModelJudgement || record.modelJudgement) === 'Blocked' ||
                (record.judgeModelJudgement || record.modelJudgement) === 'Refused') ? (
                <MessageCircleOff className="w-3.5 h-3.5 text-red-600" />
              ) : (
                <CircleCheckBig className="w-3.5 h-3.5 text-green-600" />
              )}
              <span className="text-[0.8125rem] font-450 leading-5 text-gray-900">
                {record.judgeModelJudgement || record.modelJudgement}
              </span>
            </div>
          </div>
        </div>
        </div>

        {/* Guardrail Judgement Section */}
        {((record.inputGuardrailDetails && record.inputGuardrailDetails.length > 0) ||
        (record.outputGuardrailDetails && record.outputGuardrailDetails.length > 0)) && (
          <div className="flex flex-col gap-2 items-start w-full">
            <h3 className="text-xs font-450 leading-4 text-gray-600">
              Guardrail Judgement
            </h3>
            <div className="flex flex-col gap-2 w-full">
              {/* Input Guardrail Details */}
              {record.inputGuardrailDetails && record.inputGuardrailDetails.length > 0 && (
                <>
                  {sortGuardrailDetails(record.inputGuardrailDetails).map((detail) => {
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
                        selectedBehaviors={selectedBehaviors}
                        onPreviewPolicy={handlePreviewPolicy}
                      />
                    )
                  })}
                </>
              )}

              {/* Output Guardrail Details */}
              {record.outputGuardrailDetails && record.outputGuardrailDetails.length > 0 && (
                <>
                  {sortGuardrailDetails(record.outputGuardrailDetails).map((detail) => {
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

        {/* Response Judgement Section */}
        {(record.judgeModelJudgement || record.modelJudgement) && (
          <div className="flex flex-col gap-2 items-start w-full">
            <h3 className="text-xs font-450 leading-4 text-gray-600">
              Response Judgement
            </h3>
            <ResponseJudgementCard
              record={record}
              aiSystemName={aiSystemName}
              isExpanded={expandedKeys.has('judge-model')}
              onToggle={handleToggle}
              hoveredBehavior={hoveredBehavior}
              onBehaviorHover={onBehaviorHover}
              selectedBehaviors={selectedBehaviors}
            />
          </div>
        )}
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
