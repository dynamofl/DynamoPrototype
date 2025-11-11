// Generic Evaluation Detail Component
// Uses strategy pattern to display detailed information for different test types

import { InfoIcon } from 'lucide-react'
import type { EvaluationStrategy } from '../../strategies/base-strategy'
import type { BaseEvaluationResult } from '../../types/base-evaluation'
import { Badge } from '@/components/ui/badge'

interface GenericEvaluationDetailProps {
  record: BaseEvaluationResult
  strategy: EvaluationStrategy
  hasGuardrails?: boolean
}

function InfoIconOutline() {
  return <InfoIcon className="w-4 h-4 text-gray-400" />
}

export function GenericEvaluationDetail({
  record,
  strategy,
  hasGuardrails = true
}: GenericEvaluationDetailProps) {
  // Get detail sections from strategy
  const sections = strategy.getDetailSections()

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  // Filter sections based on condition
  const visibleSections = sortedSections.filter(section =>
    !section.condition || section.condition(record)
  )

  return (
    <div className="h-full overflow-y-auto py-4">
      <div className="max-w-2xl mx-auto px-4 space-y-6">

        {/* Common Metadata Section */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
            Evaluation Info
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-gray-200 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-450 text-gray-600">Policy</span>
                <InfoIconOutline />
              </div>
              <div className="text-[0.8125rem] font-450 text-gray-900 truncate">
                {record.policy_name}
              </div>
            </div>

            {record.topic && (
              <div className="border border-gray-200 rounded-lg p-2 space-y-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-450 text-gray-600">Topic</span>
                  <InfoIconOutline />
                </div>
                <div className="text-[0.8125rem] font-450 text-gray-900">
                  <Badge variant="outline" className="text-xs">
                    {record.topic}
                  </Badge>
                </div>
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-2 space-y-2">
              <div className="flex items-center gap-1">
                <span className="text-xs font-450 text-gray-600">Behavior Type</span>
                <InfoIconOutline />
              </div>
              <div className="text-[0.8125rem] font-450 text-gray-900">
                <Badge variant="secondary">
                  {record.behavior_type}
                </Badge>
              </div>
            </div>

            {record.runtime_ms && (
              <div className="border border-gray-200 rounded-lg p-2 space-y-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-450 text-gray-600">Runtime</span>
                  <InfoIconOutline />
                </div>
                <div className="text-[0.8125rem] font-450 text-gray-900">
                  {record.runtime_ms}ms
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Strategy-specific sections */}
        {visibleSections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
              {section.title}
            </h3>
            <div className="text-[0.8125rem] text-gray-900 leading-relaxed whitespace-pre-wrap">
              {section.render(record)}
            </div>
          </section>
        ))}

        {/* AI Response Section */}
        {record.system_response && (
          <section className="space-y-2">
            <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
              AI Response
            </h3>
            <div className="border border-gray-200 rounded p-3 text-[0.8125rem] text-gray-900 leading-relaxed">
              {typeof record.system_response === 'string'
                ? record.system_response
                : record.system_response?.content || 'No response'}
            </div>
          </section>
        )}

        {/* Guardrail Details (if available) */}
        {hasGuardrails && (record.input_guardrail_judgement || record.output_guardrail_judgement) && (
          <section className="space-y-2">
            <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
              Guardrail Evaluation
            </h3>
            <div className="space-y-3">
              {record.input_guardrail_judgement && (
                <div className="border border-gray-200 rounded p-3 space-y-2">
                  <div className="font-450 text-gray-900">Input Guardrail</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={record.input_guardrail_judgement === 'Blocked' ? 'destructive' : 'default'}>
                      {record.input_guardrail_judgement}
                    </Badge>
                  </div>
                  {record.input_guardrail_reason && (
                    <div className="text-xs text-gray-600">
                      {record.input_guardrail_reason}
                    </div>
                  )}
                </div>
              )}

              {record.output_guardrail_judgement && (
                <div className="border border-gray-200 rounded p-3 space-y-2">
                  <div className="font-450 text-gray-900">Output Guardrail</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={record.output_guardrail_judgement === 'Blocked' ? 'destructive' : 'default'}>
                      {record.output_guardrail_judgement}
                    </Badge>
                  </div>
                  {record.output_guardrail_reason && (
                    <div className="text-xs text-gray-600">
                      {record.output_guardrail_reason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Performance Metrics (if available) */}
        {(record.input_tokens || record.output_tokens || record.total_tokens) && (
          <section className="space-y-2">
            <h3 className="text-[11px] font-450 text-gray-500 uppercase tracking-wide">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {record.input_tokens && (
                <div className="border border-gray-200 rounded p-2 space-y-1">
                  <div className="text-xs font-450 text-gray-600">Input Tokens</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {record.input_tokens.toLocaleString()}
                  </div>
                </div>
              )}
              {record.output_tokens && (
                <div className="border border-gray-200 rounded p-2 space-y-1">
                  <div className="text-xs font-450 text-gray-600">Output Tokens</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {record.output_tokens.toLocaleString()}
                  </div>
                </div>
              )}
              {record.total_tokens && (
                <div className="border border-gray-200 rounded p-2 space-y-1">
                  <div className="text-xs font-450 text-gray-600">Total Tokens</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {record.total_tokens.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
