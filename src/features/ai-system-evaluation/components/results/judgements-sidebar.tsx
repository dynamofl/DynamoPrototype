import type { JailbreakEvaluationResult, GuardrailEvaluationDetail } from '../../types/jailbreak-evaluation'
import { InfoIcon, ChevronsUpDown, ChevronsDownUp } from 'lucide-react'
import { useState, useEffect } from 'react'
import BlockIcon from '@/assets/icons/Block.svg'
import StatusCompleteIcon from '@/assets/icons/StatusComplete.svg'

interface JudgementsSidebarProps {
  record: JailbreakEvaluationResult
}

// Info Icon component
const InfoIconOutline = () => <InfoIcon className="w-4 h-4 text-gray-400" />

// Status icons using the same logic from the original component
function getStatusIcon(status: string) {
  return status === 'Blocked' ?
    <img src={BlockIcon} alt="Blocked" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} /> :
    <img src={StatusCompleteIcon} alt="Allowed" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
}

function getModelStatusIcon(status: string) {
  return status === 'Blocked' ?
    <img src={BlockIcon} alt="Blocked" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} /> :
    <img src={StatusCompleteIcon} alt="Answered" className="w-5 h-5" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
}

interface GuardrailDetailCardProps {
  detail: GuardrailEvaluationDetail
  uniqueKey: string
  isExpanded: boolean
  onToggle: (key: string) => void
}

function GuardrailDetailCard({ detail, uniqueKey, isExpanded, onToggle }: GuardrailDetailCardProps) {
  // Extract all violated behaviors from violations array
  const violatedBehaviors = detail.violations
    ? Array.from(new Set(detail.violations.flatMap(v => v.violatedBehaviors)))
    : []

  // Only show expand/collapse for judgements with violations
  const hasViolations = violatedBehaviors.length > 0

  const handleClick = () => {
    if (!hasViolations) return
    onToggle(uniqueKey)
  }

  return (
    <div className="flex flex-col border-b border-gray-200 last:border-b-0">
      <div
        className={`flex gap-2 items-start px-1 py-2 ${hasViolations ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={handleClick}
      >
        {getStatusIcon(detail.judgement)}
        <div className="flex-1 flex flex-col gap-1 items-start justify-center min-w-0">
          <div className="flex flex-col gap-0.5 items-start justify-center w-full">
            <div className="flex gap-0.5 items-start text-[0.8125rem] leading-5 text-gray-900">
              <span className="font-425">{detail.guardrailName}:</span>
              <span className="font-550 tracking-[0.065px]">{detail.judgement}</span>
            </div>
            <div className="flex gap-1 items-center text-xs leading-4 text-gray-600">
              {detail.confidenceScore !== undefined && (
                <>
                  <span className="font-425">Confidence:</span>
                  <span className="font-425">{detail.confidenceScore.toFixed(2)}</span>
                </>
              )}
              {hasViolations && (
                <>
                  <span className="font-425">•</span>
                  <span className="font-425">Violates:</span>
                  <span className="font-425">{violatedBehaviors.length} Behavior{violatedBehaviors.length > 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>
        </div>
        {hasViolations && (
          <div className="flex gap-2 items-center">
            {isExpanded ? (
              <ChevronsDownUp className="w-4 h-4 shrink-0 text-gray-400" />
            ) : (
              <ChevronsUpDown className="w-4 h-4 shrink-0 text-gray-400" />
            )}
          </div>
        )}
      </div>

      {/* Violated Behaviors List */}
      {isExpanded && hasViolations && (
        <div className="px-1 pb-2 pl-8">
          <div className="flex flex-col gap-1">
            {violatedBehaviors.map((behavior, idx) => (
              <div key={idx} className="text-xs leading-4 text-gray-600 font-425">
                • {behavior}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function JudgementsSidebar({ record }: JudgementsSidebarProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  // Reset expansion state when record changes
  useEffect(() => {
    setExpandedKey(null)
  }, [record])

  const handleToggle = (key: string) => {
    setExpandedKey(prev => prev === key ? null : key)
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

  return (
    <div className="h-full overflow-y-auto bg-gray-0">
      <div className="flex flex-col gap-6 items-start p-6">
        {/* Title */}
        <h2 className="text-sm font-550 leading-5 text-gray-900">Evaluation Judgement</h2>

        {/* Summary Cards */}
        <div className="flex gap-2 items-center w-full">
          {/* Prompt */}
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col gap-1">
            <div className="flex gap-0.5 items-start">
              <span className="text-xs font-425 leading-4 text-gray-900">Prompt</span>
              <InfoIconOutline />
            </div>
            <div className="flex gap-0.5 items-center">
              <span className="text-[0.8125rem] font-550 leading-5 text-gray-900 tracking-[0.065px]">
                {record.attackType}
              </span>
            </div>
          </div>

          {/* Guardrails */}
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col gap-1">
            <div className="flex gap-0.5 items-start">
              <span className="text-xs font-425 leading-4 text-gray-900">Guardrails</span>
              <InfoIconOutline />
            </div>
            <div className="flex gap-0.5 items-center">
              <span className="text-[0.8125rem] font-550 leading-5 text-gray-900 tracking-[0.065px]">
                {record.inputGuardrailJudgement || record.outputGuardrailJudgement || 'N/A'}
              </span>
            </div>
          </div>

          {/* Model */}
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-col gap-1">
            <div className="flex gap-0.5 items-start">
              <span className="text-xs font-425 leading-4 text-gray-900">Model</span>
              <InfoIconOutline />
            </div>
            <div className="flex gap-0.5 items-center">
              <span className="text-[0.8125rem] font-550 leading-5 text-gray-900 tracking-[0.065px]">
                {record.judgeModelJudgement || record.modelJudgement}
              </span>
            </div>
          </div>
        </div>

        {/* Guardrail Judgement Section */}
        {((record.inputGuardrailDetails && record.inputGuardrailDetails.length > 0) ||
        (record.outputGuardrailDetails && record.outputGuardrailDetails.length > 0)) && (
          <div className="flex flex-col gap-2 items-start w-full">
            <h3 className="text-xs font-550 leading-4 text-gray-600">
              Guardrail Judgement
            </h3>
            <div className="bg-gray-0 border border-gray-200 rounded-md p-1 w-full">
              {/* Input Guardrail Details */}
              {record.inputGuardrailDetails && record.inputGuardrailDetails.length > 0 && (
                <>
                  {sortGuardrailDetails(record.inputGuardrailDetails).map((detail, idx) => {
                    const key = `input-${idx}`
                    return (
                      <GuardrailDetailCard
                        key={key}
                        detail={detail}
                        uniqueKey={key}
                        isExpanded={expandedKey === key}
                        onToggle={handleToggle}
                      />
                    )
                  })}
                </>
              )}

              {/* Output Guardrail Details */}
              {record.outputGuardrailDetails && record.outputGuardrailDetails.length > 0 && (
                <>
                  {sortGuardrailDetails(record.outputGuardrailDetails).map((detail, idx) => {
                    const key = `output-${idx}`
                    return (
                      <GuardrailDetailCard
                        key={key}
                        detail={detail}
                        uniqueKey={key}
                        isExpanded={expandedKey === key}
                        onToggle={handleToggle}
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
            <h3 className="text-xs font-550 leading-4 text-gray-600">
              Response Judgement
            </h3>
            <div className="bg-gray-0 border border-gray-200 rounded-md p-1 w-full">
              <div className="flex gap-2 items-start px-1 py-2 rounded-md">
                {getModelStatusIcon(record.judgeModelJudgement || record.modelJudgement)}
                <div className="flex-1 flex flex-col gap-1 items-start justify-center min-w-0">
                  <div className="flex flex-col gap-0.5 items-start justify-center w-full">
                    <div className="flex gap-0.5 items-start text-[0.8125rem] leading-5 text-gray-900">
                      <span className="font-425">gpt-4o-prod:</span>
                      <span className="font-550 tracking-[0.065px]">{record.judgeModelJudgement || record.modelJudgement}</span>
                    </div>
                    <div className="flex gap-1 items-center text-xs leading-4 text-gray-600">
                      {record.judgeModelConfidence !== undefined && record.judgeModelConfidence !== null && (
                        <>
                          <span className="font-425">Confidence:</span>
                          <span className="font-425">{record.judgeModelConfidence.toFixed(2)}</span>
                        </>
                      )}
                      {record.outputTokens !== undefined && (
                        <>
                          {record.judgeModelConfidence !== undefined && record.judgeModelConfidence !== null && <span className="font-425">•</span>}
                          <span className="font-425">Tokens:</span>
                          <span className="font-425">{record.outputTokens.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
