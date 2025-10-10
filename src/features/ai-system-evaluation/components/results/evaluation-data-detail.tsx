import { InfoIcon } from 'lucide-react'
import type { JailbreakEvaluationResult } from '../../types/jailbreak-evaluation'
import BlockIcon from '@/assets/icons/Block.svg'
import StatusCompleteIcon from '@/assets/icons/StatusComplete.svg'

interface EvaluationDataDetailProps {
  record: JailbreakEvaluationResult
  hasGuardrails?: boolean
}

function InfoIconOutline() {
  return <InfoIcon className="w-4 h-4 text-gray-400" />
}

// Use the same blocked/allowed icon logic from the table
function getStatusIcon(status: string) {
  return status === 'Blocked' ?
    <img src={BlockIcon} alt="Blocked" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} /> :
    <img src={StatusCompleteIcon} alt="Allowed" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
}

function getModelStatusIcon(status: string) {
  return status === 'Blocked' ?
    <img src={BlockIcon} alt="Blocked" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(25%) sepia(85%) saturate(5963%) hue-rotate(346deg) brightness(93%) contrast(90%)' }} /> :
    <img src={StatusCompleteIcon} alt="Answered" className="w-4 h-4" style={{ filter: 'brightness(0) saturate(100%) invert(39%) sepia(80%) saturate(1969%) hue-rotate(96deg) brightness(96%) contrast(95%)' }} />
}

export function EvaluationDataDetail({ record, hasGuardrails = true }: EvaluationDataDetailProps) {
  return (
    <div className="h-full overflow-y-auto py-4">
      <div className="max-w-2xl mx-auto px-4 space-y-6">

        {/* Evaluation Summary */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Evaluation Summary
          </h3>
          <div className={`grid grid-cols-1 gap-3 ${hasGuardrails ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>

            {/* Attack Type */}
            <div className="border border-gray-200 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-450 text-gray-600">Attack Type</span>
                <InfoIconOutline />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[0.8125rem]  font-450 text-gray-900 truncate">
                  {record.attackType}
                </span>
              </div>
            </div>

            {/* Guardrail Response - Only show if guardrails are attached */}
            {hasGuardrails && (
              <div className="border border-gray-200 rounded-lg p-2 space-y-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-450 text-gray-600">Guardrail Response</span>
                  <InfoIconOutline />
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(record.guardrailJudgement)}
                  <span className="text-[0.8125rem]  font-450 text-gray-900">
                    {record.guardrailJudgement}
                  </span>
                </div>
              </div>
            )}

            {/* Model Response */}
            <div className="border border-gray-200 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-450 text-gray-600">Model Response</span>
                <InfoIconOutline />
              </div>
              <div className="flex items-center gap-2">
                {getModelStatusIcon(record.modelJudgement)}
                <span className="text-[0.8125rem]  font-450 text-gray-900">
                  {record.modelJudgement}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Base Prompt */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Base Prompt
          </h3>
          <div className="text-[0.8125rem]  text-gray-900 leading-relaxed">
            {record.basePrompt}
          </div>
          <div className="border border-gray-200 rounded-md p-2 space-y-2">
            <div className="flex py-1">
              <div className="w-36 text-xs font-450 text-gray-500">
                Behavior Type:
              </div>
              <div className="flex-1 text-xs text-gray-900">
                {record.behaviorType}
              </div>
            </div>
            <div className="flex py-1">
              <div className="w-36 text-xs font-450 text-gray-500">
                Policy:
              </div>
              <div className="flex-1 text-xs text-gray-900">
                {record.policyName}
              </div>
            </div>
          </div>
        </section>

        {/* Adversarial Prompt */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Adversarial Prompt
          </h3>
          <div className="border border-gray-200 rounded p-2 space-y-2">
            <div className="w-full">
              <p className="text-[0.8125rem]  font-400 leading-5 text-gray-900 whitespace-pre-wrap">
                {record.adversarialPrompt}
              </p>
            </div>
          </div>
        </section>

        {/* Guardrail Judgement - Only show if guardrails are attached */}
        {hasGuardrails && (
          <section className="space-y-2">
            <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
              Guardrail Judgement
            </h3>
            <div className="border border-gray-200 rounded-md p-1">
              <div className="flex items-center gap-2 p-2 rounded hover:bg-gray-50">
                {getStatusIcon(record.guardrailJudgement)}
                <span className="text-xs text-gray-900 flex-1">
                  <span className="font-450">Guardrail Result:</span>
                  <span className="ml-1">{record.guardrailJudgement}</span>
                </span>
              </div>
            </div>
          </section>
        )}

        {/* AI System Response */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            AI System Response
          </h3>
          <div className="text-[0.8125rem]  text-gray-900 leading-relaxed">
            {record.systemResponse}
          </div>
          <div className="border border-gray-200 rounded-md p-1">
            <div className="flex items-center gap-2 p-2">
              {getModelStatusIcon(record.modelJudgement)}
              <span className="text-xs text-gray-900">
                <span className="font-450">Model Judgement:</span>
                <span className="ml-1">{record.modelJudgement}</span>
              </span>
            </div>
          </div>
        </section>

        {/* Attack Outcome */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Attack Outcome
          </h3>
          <div className={`border rounded-lg p-4 ${
            record.attackOutcome === "Attack Success"
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                record.attackOutcome === "Attack Success"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}>
                {record.attackOutcome}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              {record.attackOutcome === "Attack Success" ? (
                hasGuardrails ? (
                  <>
                    <strong className="text-red-700">Attack Success:</strong> The adversarial prompt bypassed the guardrail
                    (guardrail: {record.guardrailJudgement}) and the model provided an answer
                    (model: {record.modelJudgement}).
                  </>
                ) : (
                  <>
                    <strong className="text-red-700">Attack Success:</strong> The model provided an answer to a disallowed behavior
                    (model: {record.modelJudgement}).
                  </>
                )
              ) : (
                hasGuardrails ? (
                  <>
                    <strong className="text-green-700">Attack Failure:</strong> Either the guardrail blocked the prompt
                    (guardrail: {record.guardrailJudgement}) or the model refused to answer
                    (model: {record.modelJudgement}).
                  </>
                ) : (
                  <>
                    <strong className="text-green-700">Attack Failure:</strong> The model refused to answer the disallowed behavior
                    (model: {record.modelJudgement}).
                  </>
                )
              )}
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}
