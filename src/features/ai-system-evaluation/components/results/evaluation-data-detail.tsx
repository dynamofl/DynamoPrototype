import { InfoIcon } from 'lucide-react'
import type { JailbreakEvaluationResult } from '../../types/jailbreak-evaluation'
import BlockIcon from '@/assets/icons/Block.svg'
import StatusCompleteIcon from '@/assets/icons/StatusComplete.svg'
import { MarkdownRenderer } from '@/components/patterns/ui-patterns/markdown-renderer'

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
          <div className={`grid grid-cols-1 gap-3 ${
            record.inputGuardrailJudgement && record.outputGuardrailJudgement
              ? 'md:grid-cols-2 lg:grid-cols-4'
              : record.inputGuardrailJudgement || record.outputGuardrailJudgement
              ? 'md:grid-cols-3'
              : 'md:grid-cols-2'
          }`}>

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

            {/* Input Guardrail - Only show if available */}
            {record.inputGuardrailJudgement && (
              <div className="border border-gray-200 rounded-lg p-2 space-y-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-450 text-gray-600">Input Guardrail</span>
                  <InfoIconOutline />
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(record.inputGuardrailJudgement)}
                  <span className="text-[0.8125rem]  font-450 text-gray-900">
                    {record.inputGuardrailJudgement}
                  </span>
                </div>
              </div>
            )}

            {/* Output Guardrail - Only show if available */}
            {record.outputGuardrailJudgement && (
              <div className="border border-gray-200 rounded-lg p-2 space-y-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-450 text-gray-600">Output Guardrail</span>
                  <InfoIconOutline />
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(record.outputGuardrailJudgement)}
                  <span className="text-[0.8125rem]  font-450 text-gray-900">
                    {record.outputGuardrailJudgement}
                  </span>
                </div>
              </div>
            )}

            {/* Judge Model Response */}
            <div className="border border-gray-200 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-450 text-gray-600">Judge Model</span>
                <InfoIconOutline />
              </div>
              <div className="flex items-center gap-2">
                {getModelStatusIcon(record.judgeModelJudgement || record.modelJudgement)}
                <span className="text-[0.8125rem]  font-450 text-gray-900">
                  {record.judgeModelJudgement || record.modelJudgement}
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
              {(() => {
                const adversarial = record.adversarialPrompt

                // If it's a simple text object: { text: string }
                if (adversarial && typeof adversarial === 'object' && 'text' in adversarial) {
                  return (
                    <p className="text-[0.8125rem] font-400 leading-5 text-gray-900 whitespace-pre-wrap">
                      {adversarial.text}
                    </p>
                  )
                }

                // If it's an array of conversation turns: ConversationTurn[]
                if (Array.isArray(adversarial)) {
                  return (
                    <div className="space-y-3">
                      {adversarial.map((turn, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="text-xs font-450 text-gray-600">
                            {turn.role === 'user' ? 'User' : turn.role === 'assistant' ? 'Assistant' : 'System'}:
                          </div>
                          <p className="text-[0.8125rem] font-400 leading-5 text-gray-900 whitespace-pre-wrap pl-3 border-l-2 border-gray-300">
                            {turn.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                }

                // If it's a plain string (for backward compatibility)
                if (typeof adversarial === 'string') {
                  return (
                    <p className="text-[0.8125rem] font-400 leading-5 text-gray-900 whitespace-pre-wrap">
                      {adversarial}
                    </p>
                  )
                }

                // Fallback for unexpected formats
                return (
                  <p className="text-[0.8125rem] font-400 leading-5 text-gray-500 italic">
                    No adversarial prompt available
                  </p>
                )
              })()}
            </div>
          </div>
        </section>

        {/* Three-Layer Judgements - OVERALL results */}
        {(record.inputGuardrailJudgement || record.outputGuardrailJudgement || record.judgeModelJudgement || record.modelJudgement) && (
          <section className="space-y-2">
            <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
              Overall Evaluation Judgements
            </h3>
            <div className="border border-gray-200 rounded-md p-1 space-y-1">
              {/* Input Guardrail */}
              {record.inputGuardrailJudgement && (
                <div className="p-2 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.inputGuardrailJudgement)}
                    <span className="text-xs text-gray-900 flex-1">
                      <span className="font-450">Input Guardrail:</span>
                      <span className="ml-1">{record.inputGuardrailJudgement}</span>
                    </span>
                  </div>
                  {record.inputGuardrailReason && (
                    <p className="text-xs text-gray-600 mt-1 ml-6">{record.inputGuardrailReason}</p>
                  )}
                  {/* Overall Violations */}
                  {record.inputGuardrailViolations && record.inputGuardrailViolations.length > 0 && (
                    <div className="mt-2 ml-6 space-y-1">
                      <p className="text-xs font-450 text-gray-700">Violations:</p>
                      {record.inputGuardrailViolations.map((violation, idx) => (
                        <div key={idx} className="text-xs text-gray-600 pl-2 border-l-2 border-red-200">
                          <span className="font-450 text-red-700">"{violation.phrase}"</span>
                          <span className="text-gray-500"> violates: </span>
                          <span className="text-gray-700">{violation.violatedBehaviors.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Output Guardrail */}
              {record.outputGuardrailJudgement && (
                <div className="p-2 rounded hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(record.outputGuardrailJudgement)}
                    <span className="text-xs text-gray-900 flex-1">
                      <span className="font-450">Output Guardrail:</span>
                      <span className="ml-1">{record.outputGuardrailJudgement}</span>
                    </span>
                  </div>
                  {record.outputGuardrailReason && (
                    <p className="text-xs text-gray-600 mt-1 ml-6">{record.outputGuardrailReason}</p>
                  )}
                  {/* Overall Violations */}
                  {record.outputGuardrailViolations && record.outputGuardrailViolations.length > 0 && (
                    <div className="mt-2 ml-6 space-y-1">
                      <p className="text-xs font-450 text-gray-700">Violations:</p>
                      {record.outputGuardrailViolations.map((violation, idx) => (
                        <div key={idx} className="text-xs text-gray-600 pl-2 border-l-2 border-red-200">
                          <span className="font-450 text-red-700">"{violation.phrase}"</span>
                          <span className="text-gray-500"> violates: </span>
                          <span className="text-gray-700">{violation.violatedBehaviors.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Judge Model */}
              <div className="p-2 rounded hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  {getModelStatusIcon(record.judgeModelJudgement || record.modelJudgement)}
                  <span className="text-xs text-gray-900 flex-1">
                    <span className="font-450">Judge Model:</span>
                    <span className="ml-1">{record.judgeModelJudgement || record.modelJudgement}</span>
                  </span>
                </div>
                {record.judgeModelReason && (
                  <p className="text-xs text-gray-600 mt-1 ml-6">{record.judgeModelReason}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Per-Guardrail Detailed Results - NEW section for multi-guardrail evaluations */}
        {((record.inputGuardrailDetails && record.inputGuardrailDetails.length > 0) ||
          (record.outputGuardrailDetails && record.outputGuardrailDetails.length > 0)) && (
          <section className="space-y-2">
            <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
              Per-Guardrail Detailed Results
            </h3>

            {/* Input Guardrails Details */}
            {record.inputGuardrailDetails && record.inputGuardrailDetails.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-450 text-gray-700">Input Guardrails ({record.inputGuardrailDetails.length})</p>
                <div className="space-y-2">
                  {record.inputGuardrailDetails.map((detail, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(detail.judgement)}
                        <span className="text-sm font-450 text-gray-900">{detail.guardrailName}</span>
                        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded ${
                          detail.judgement === 'Blocked'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {detail.judgement}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{detail.reason}</p>
                      {detail.violations && detail.violations.length > 0 && (
                        <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
                          <p className="text-xs font-450 text-gray-700">Violations:</p>
                          {detail.violations.map((violation, vIdx) => (
                            <div key={vIdx} className="text-xs pl-2 border-l-2 border-red-300 bg-white p-2 rounded">
                              <div className="font-450 text-red-700 mb-1">"{violation.phrase}"</div>
                              <div className="text-gray-600">
                                <span className="text-gray-500">Violates: </span>
                                {violation.violatedBehaviors.map((behavior, bIdx) => (
                                  <span key={bIdx} className="inline-block bg-red-50 text-red-700 px-1.5 py-0.5 rounded mr-1 mb-1 text-xs">
                                    {behavior}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output Guardrails Details */}
            {record.outputGuardrailDetails && record.outputGuardrailDetails.length > 0 && (
              <div className="space-y-2 mt-4">
                <p className="text-xs font-450 text-gray-700">Output Guardrails ({record.outputGuardrailDetails.length})</p>
                <div className="space-y-2">
                  {record.outputGuardrailDetails.map((detail, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(detail.judgement)}
                        <span className="text-sm font-450 text-gray-900">{detail.guardrailName}</span>
                        <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded ${
                          detail.judgement === 'Blocked'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {detail.judgement}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{detail.reason}</p>
                      {detail.violations && detail.violations.length > 0 && (
                        <div className="mt-2 space-y-1 border-t border-gray-200 pt-2">
                          <p className="text-xs font-450 text-gray-700">Violations:</p>
                          {detail.violations.map((violation, vIdx) => (
                            <div key={vIdx} className="text-xs pl-2 border-l-2 border-red-300 bg-white p-2 rounded">
                              <div className="font-450 text-red-700 mb-1">"{violation.phrase}"</div>
                              <div className="text-gray-600">
                                <span className="text-gray-500">Violates: </span>
                                {violation.violatedBehaviors.map((behavior, bIdx) => (
                                  <span key={bIdx} className="inline-block bg-red-50 text-red-700 px-1.5 py-0.5 rounded mr-1 mb-1 text-xs">
                                    {behavior}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* AI System Response */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            AI System Response
          </h3>
          <div>
            <MarkdownRenderer content={record.systemResponse} />
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
