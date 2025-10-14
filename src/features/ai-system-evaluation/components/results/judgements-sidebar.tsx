import type { JailbreakEvaluationResult, GuardrailEvaluationDetail } from '../../types/jailbreak-evaluation'
import { InfoIcon } from 'lucide-react'
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

// Chevron down icon
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
    <path d="M5 7.5L10 12.5L15 7.5" stroke="#6B7894" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

interface GuardrailDetailCardProps {
  detail: GuardrailEvaluationDetail
}

function GuardrailDetailCard({ detail }: GuardrailDetailCardProps) {
  return (
    <div className="flex gap-2 items-start px-1 py-2 border-b border-gray-200 last:border-b-0">
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
            {detail.violations && detail.violations.length > 0 && (
              <>
                <span className="font-425">•</span>
                <span className="font-425">Violates:</span>
                <span className="font-425">{detail.violations.length} Behavior{detail.violations.length > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <ChevronDownIcon />
      </div>
    </div>
  )
}

export function JudgementsSidebar({ record }: JudgementsSidebarProps) {
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
                  {record.inputGuardrailDetails.map((detail, idx) => (
                    <GuardrailDetailCard key={`input-${idx}`} detail={detail} />
                  ))}
                </>
              )}

              {/* Output Guardrail Details */}
              {record.outputGuardrailDetails && record.outputGuardrailDetails.length > 0 && (
                <>
                  {record.outputGuardrailDetails.map((detail, idx) => (
                    <GuardrailDetailCard key={`output-${idx}`} detail={detail} />
                  ))}
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
                      {record.judgeModelConfidence !== undefined && (
                        <>
                          <span className="font-425">Confidence:</span>
                          <span className="font-425">{record.judgeModelConfidence.toFixed(2)}</span>
                        </>
                      )}
                      {record.outputTokens !== undefined && (
                        <>
                          <span className="font-425">•</span>
                          <span className="font-425">Tokens:</span>
                          <span className="font-425">{record.outputTokens.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <ChevronDownIcon />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
