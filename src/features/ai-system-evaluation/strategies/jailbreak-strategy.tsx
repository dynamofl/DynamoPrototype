// Jailbreak Strategy Implementation
// Implements EvaluationStrategy interface for jailbreak test type

import { MessagesSquare, ShieldBan, ShieldCheck, MessageCircleOff, CircleCheckBig, Zap } from 'lucide-react'
import type {
  EvaluationStrategy,
  ColumnConfig,
  FilterConfig,
  SummaryCardConfig,
  DetailSectionConfig,
  ExportFieldConfig,
  AnalysisSectionConfig,
  ConversationSectionConfig,
  HighlightingContext
} from './base-strategy'
import type { BaseEvaluationResult, BaseEvaluationSummary } from '../types/base-evaluation'
import type {
  JailbreakEvaluationResult,
  JailbreakEvaluationSummary,
  AttackType,
  AdversarialPrompt
} from '../types/jailbreak-evaluation'
import { Badge } from '@/components/ui/badge'
import { SeverityIcon } from '../components/results/severity-icon'
import { getAttackSeverityLevel } from '../lib/attack-severity'
import { calculateSummaryFromResults } from '../lib/calculate-summary'
import { HighlightedText } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { HighlightedMarkdownRenderer } from '../components/results/conversation-view-components/shared-components'

export class JailbreakStrategy implements EvaluationStrategy {
  readonly testType = 'jailbreak'
  readonly displayName = 'Jailbreak'

  /**
   * Transform database records to frontend result format
   */
  transformPrompts(dbRecords: any[]): JailbreakEvaluationResult[] {
    const transformed = dbRecords.map(record => {
      // Check if already transformed (has camelCase properties)
      if ('basePrompt' in record && 'behaviorType' in record && 'attackType' in record) {
        return record as JailbreakEvaluationResult
      }

      // Transform snake_case DB record to camelCase
      return {
        policyId: record.policy_id,
        policyName: record.policy_name,
        topic: record.topic,
        promptTitle: record.prompt_title,
        policyContext: record.policy_context,
        behaviorType: record.behavior_type,
        basePrompt: record.base_prompt,
        attackType: record.attack_type as AttackType,
        adversarialPrompt: record.adversarial_prompt as AdversarialPrompt,
        systemResponse: record.ai_system_response?.content || record.system_response || '',

        // Input guardrail
        inputGuardrailJudgement: record.input_guardrail?.judgement || null,
        inputGuardrailReason: record.input_guardrail?.reason || null,
        inputGuardrailDetails: record.input_guardrail?.details || null,

        // Output guardrail
        outputGuardrailJudgement: record.output_guardrail?.judgement || null,
        outputGuardrailReason: record.output_guardrail?.reason || null,
        outputGuardrailDetails: record.output_guardrail?.details || null,

        // Judge model (look in ai_system_response first, then fallback to judge_model)
        judgeModelJudgement: record.ai_system_response?.judgement || record.judge_model?.judgement || null,
        judgeModelReason: record.ai_system_response?.reason || record.judge_model?.reason || null,
        judgeModelAnswerPhrases: record.ai_system_response?.answerPhrases || null,

        // Legacy fields for backward compatibility
        guardrailJudgement: record.input_guardrail?.judgement || record.output_guardrail?.judgement || 'Allowed',
        modelJudgement: record.ai_system_response?.judgement || 'Answered',

        // Attack outcomes
        attackOutcome: record.attack_outcome || 'Attack Failure',
        aiSystemAttackOutcome: record.ai_system_attack_outcome || record.attack_outcome || 'Attack Failure',

        // Metrics
        runtimeMs: record.runtime_ms,
        inputTokens: record.ai_system_response?.input_tokens,
        outputTokens: record.ai_system_response?.output_tokens,
        totalTokens: (record.ai_system_response?.input_tokens || 0) + (record.ai_system_response?.output_tokens || 0)
      }
    })
    return transformed
  }

  /**
   * Calculate summary metrics from results
   */
  calculateSummary(results: BaseEvaluationResult[]): JailbreakEvaluationSummary {
    return calculateSummaryFromResults(results as JailbreakEvaluationResult[])
  }

  /**
   * Get table columns configuration
   */
  getTableColumns(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): ColumnConfig[] {
    const { hasInputGuardrails = false, hasOutputGuardrails = false } = options || {}
    const columns: ColumnConfig[] = [
      {
        key: 'basePrompt',
        label: 'Test Conversations',
        className: 'font-450 text-gray-900',
        render: (record) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          return (
            <div className="truncate max-w-md group-hover:underline" title={jailbreakRecord.basePrompt}>
              {jailbreakRecord.basePrompt}
            </div>
          )
        }
      },
      {
        key: 'topic',
        label: 'Topic',
        render: (record) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          return (
            <Badge variant="outline" className="text-xs">
              {jailbreakRecord.topic || 'General'}
            </Badge>
          )
        }
      },
      {
        key: 'behaviorType',
        label: 'Behavior Type',
        render: (record) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          return (
            <Badge variant="secondary">
              {jailbreakRecord.behaviorType}
            </Badge>
          )
        }
      },
      {
        key: 'attackType',
        label: 'Attack Type',
        render: (record) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          return (
            <div className="flex items-center gap-2">
              <SeverityIcon level={getAttackSeverityLevel(jailbreakRecord.attackType)} size="sm" />
              <span className="">{jailbreakRecord.attackType}</span>
            </div>
          )
        }
      }
    ]

    // Add input guardrail column if applicable
    if (hasInputGuardrails) {
      columns.push({
        key: 'inputGuardrail',
        label: 'Input Guardrail',
        render: (record) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          if (!jailbreakRecord.inputGuardrailJudgement) {
            return <span className="text-gray-400">—</span>
          }

          // Handle multiple guardrails with details
          if (jailbreakRecord.inputGuardrailDetails && jailbreakRecord.inputGuardrailDetails.length > 1) {
            const blockedCount = jailbreakRecord.inputGuardrailDetails.filter(d => d.judgement === 'Blocked').length
            const totalCount = jailbreakRecord.inputGuardrailDetails.length
            const hasBlocked = blockedCount > 0

            return (
              <div className="flex items-center gap-2">
                {hasBlocked ?
                  <ShieldBan className="w-4 h-4 text-red-600" /> :
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                }
                <span className="text-xs">
                  {blockedCount > 0 ? `${blockedCount}/${totalCount} Blocked` : `${totalCount}/${totalCount} Allowed`}
                </span>
              </div>
            )
          }

          // Single guardrail
          const isBlocked = jailbreakRecord.inputGuardrailJudgement === 'Blocked'
          return (
            <div className="flex items-center gap-2">
              {isBlocked ?
                <ShieldBan className="w-4 h-4 text-red-600" /> :
                <ShieldCheck className="w-4 h-4 text-green-600" />
              }
              <span className="">{jailbreakRecord.inputGuardrailJudgement}</span>
            </div>
          )
        }
      })
    }

    // Add output guardrail column if applicable
    if (hasOutputGuardrails) {
      columns.push({
        key: 'outputGuardrail',
        label: 'Output Guardrail',
        render: (record) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          if (!jailbreakRecord.outputGuardrailJudgement) {
            return <span className="text-gray-400">—</span>
          }

          // Handle multiple guardrails with details
          if (jailbreakRecord.outputGuardrailDetails && jailbreakRecord.outputGuardrailDetails.length > 1) {
            const blockedCount = jailbreakRecord.outputGuardrailDetails.filter(d => d.judgement === 'Blocked').length
            const totalCount = jailbreakRecord.outputGuardrailDetails.length
            const hasBlocked = blockedCount > 0

            return (
              <div className="flex items-center gap-2">
                {hasBlocked ?
                  <ShieldBan className="w-4 h-4 text-red-600" /> :
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                }
                <span className="text-xs">
                  {blockedCount > 0 ? `${blockedCount}/${totalCount} Blocked` : `${totalCount}/${totalCount} Allowed`}
                </span>
              </div>
            )
          }

          // Single guardrail
          const isBlocked = jailbreakRecord.outputGuardrailJudgement === 'Blocked'
          return (
            <div className="flex items-center gap-2">
              {isBlocked ?
                <ShieldBan className="w-4 h-4 text-red-600" /> :
                <ShieldCheck className="w-4 h-4 text-green-600" />
              }
              <span className="">{jailbreakRecord.outputGuardrailJudgement}</span>
            </div>
          )
        }
      })
    }

    // Judge model column
    columns.push({
      key: 'judgeModel',
      label: 'Judge Model',
      render: (record) => {
        const jailbreakRecord = record as JailbreakEvaluationResult
        const judgement = jailbreakRecord.judgeModelJudgement || jailbreakRecord.modelJudgement
        const isRefused = judgement === 'Refused' || judgement === 'Blocked'
        return (
          <div className="flex items-center gap-2">
            {isRefused ?
              <MessageCircleOff className="w-4 h-4 text-red-600" /> :
              <CircleCheckBig className="w-4 h-4 text-green-600" />
            }
            <span className="">{judgement}</span>
          </div>
        )
      }
    })

    // Attack outcome column
    const hasAnyGuardrails = hasInputGuardrails || hasOutputGuardrails
    columns.push({
      key: 'attackOutcome',
      label: hasAnyGuardrails ? 'Attack Outcome' : 'AI System Attack Outcome',
      render: (record) => {
        const jailbreakRecord = record as JailbreakEvaluationResult
        const outcome = hasAnyGuardrails
          ? jailbreakRecord.attackOutcome
          : (jailbreakRecord.aiSystemAttackOutcome || jailbreakRecord.attackOutcome)

        return (
          <Badge
            variant="secondary"
            className={`text-xs ${
              outcome === 'Attack Failure'
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            {outcome}
          </Badge>
        )
      }
    })

    return columns
  }

  /**
   * Get filter configurations
   */
  getFilters(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): FilterConfig[] {
    const { hasInputGuardrails = false, hasOutputGuardrails = false } = options || {}
    const filters: FilterConfig[] = [
      {
        key: 'attackOutcome',
        label: 'Attack Outcome',
        type: 'multiselect',
        options: [
          { value: 'Attack Success', label: 'Attack Success' },
          { value: 'Attack Failure', label: 'Attack Failure' }
        ],
        filterFn: (record, values) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          return values.includes(jailbreakRecord.attackOutcome)
        }
      },
      {
        key: 'attackType',
        label: 'Attack Type',
        type: 'multiselect',
        options: [
          // Level 1
          { value: 'Typos', label: 'Typos' },
          { value: 'Casing Changes', label: 'Casing Changes' },
          { value: 'Synonyms', label: 'Synonyms' },
          // Level 2
          { value: 'DAN', label: 'DAN' },
          { value: 'PAP', label: 'PAP' },
          { value: 'GCG', label: 'GCG' },
          { value: 'Leetspeak', label: 'Leetspeak' },
          { value: 'ASCII Art', label: 'ASCII Art' },
          // Level 3
          { value: 'TAP', label: 'TAP' },
          { value: 'IRIS', label: 'IRIS' }
        ],
        filterFn: (record, values) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          return values.includes(jailbreakRecord.attackType)
        }
      },
      {
        key: 'behaviorType',
        label: 'Behavior Type',
        type: 'multiselect',
        options: [
          { value: 'Allowed', label: 'Allowed' },
          { value: 'Disallowed', label: 'Disallowed' }
        ],
        filterFn: (record, values) => values.includes(record.behavior_type)
      },
      {
        key: 'topic',
        label: 'Topic',
        type: 'multiselect',
        options: [], // Will be populated dynamically from results
        filterFn: (record, values) => {
          if (!record.topic) return values.length === 0
          return values.includes(record.topic)
        }
      }
    ]

    // Add input guardrail filter if applicable
    if (hasInputGuardrails) {
      filters.push({
        key: 'inputGuardrailJudgment',
        label: 'Input Guardrail',
        type: 'multiselect',
        options: [
          { value: 'Allowed', label: 'Allowed' },
          { value: 'Blocked', label: 'Blocked' }
        ],
        filterFn: (record, values) => {
          if (!record.input_guardrail_judgement) return false
          return values.includes(record.input_guardrail_judgement)
        }
      })
    }

    // Add output guardrail filter if applicable
    if (hasOutputGuardrails) {
      filters.push({
        key: 'outputGuardrailJudgment',
        label: 'Output Guardrail',
        type: 'multiselect',
        options: [
          { value: 'Allowed', label: 'Allowed' },
          { value: 'Blocked', label: 'Blocked' }
        ],
        filterFn: (record, values) => {
          if (!record.output_guardrail_judgement) return false
          return values.includes(record.output_guardrail_judgement)
        }
      })
    }

    filters.push({
      key: 'modelJudgment',
      label: 'Judge Model',
      type: 'multiselect',
      options: [
        { value: 'Answered', label: 'Answered' },
        { value: 'Refused', label: 'Refused' },
        { value: 'Blocked', label: 'Blocked' }
      ],
      filterFn: (record, values) => {
        const jailbreakRecord = record as JailbreakEvaluationResult
        const judgement = jailbreakRecord.judgeModelJudgement || jailbreakRecord.modelJudgement
        return values.includes(judgement)
      }
    })

    return filters
  }

  /**
   * Get summary cards configuration
   */
  getSummaryCards(): SummaryCardConfig[] {
    return [
      {
        title: 'Attack Successes',
        getValue: (summary) => {
          const jailbreakSummary = summary as JailbreakEvaluationSummary
          return jailbreakSummary.attackSuccesses || jailbreakSummary.aiSystem?.attackSuccesses || 0
        },
        format: 'number',
        color: 'red',
        description: 'Number of successful attacks'
      },
      {
        title: 'Attack Failures',
        getValue: (summary) => {
          const jailbreakSummary = summary as JailbreakEvaluationSummary
          return jailbreakSummary.attackFailures || jailbreakSummary.aiSystem?.attackFailures || 0
        },
        format: 'number',
        color: 'green',
        description: 'Number of blocked attacks'
      },
      {
        title: 'Success Rate',
        getValue: (summary) => {
          const jailbreakSummary = summary as JailbreakEvaluationSummary
          return jailbreakSummary.successRate || jailbreakSummary.aiSystem?.successRate || 0
        },
        format: 'percentage',
        formatFn: (value) => `${(value as number).toFixed(1)}%`,
        color: 'amber',
        description: 'Percentage of attacks that succeeded'
      }
    ]
  }

  /**
   * Get detail sections for individual record view
   */
  getDetailSections(): DetailSectionConfig[] {
    return [
      {
        title: 'Adversarial Prompt',
        order: 1,
        render: (record) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          const adversarialPrompt = jailbreakRecord.adversarialPrompt

          // Handle multi-turn conversations
          if (Array.isArray(adversarialPrompt)) {
            return (
              <div className="space-y-2">
                {adversarialPrompt.map((turn, i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded">
                    <div className="text-xs font-medium text-gray-600 mb-1">{turn.role}</div>
                    <div className="text-sm">{turn.content}</div>
                  </div>
                ))}
              </div>
            )
          }

          // Handle single-turn prompts
          const promptText = typeof adversarialPrompt === 'object' && 'text' in adversarialPrompt
            ? adversarialPrompt.text
            : String(adversarialPrompt)

          return (
            <div className="bg-gray-50 p-4 rounded">
              {promptText}
            </div>
          )
        }
      },
      {
        title: 'Attack Analysis',
        order: 2,
        render: (record) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Attack Type:</span>
                <div className="flex items-center gap-1">
                  <SeverityIcon level={getAttackSeverityLevel(jailbreakRecord.attackType)} size="sm" />
                  <Badge>{jailbreakRecord.attackType}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Outcome:</span>
                <Badge
                  variant={jailbreakRecord.attackOutcome === 'Attack Failure' ? 'default' : 'destructive'}
                >
                  {jailbreakRecord.attackOutcome}
                </Badge>
              </div>
            </div>
          )
        }
      }
    ]
  }

  /**
   * Get analysis sections for summary view
   */
  getAnalysisSections(): AnalysisSectionConfig[] {
    return [
      {
        key: 'byAttackType',
        title: 'Results by Attack Type',
        order: 1,
        render: (summary) => {
          // This will be implemented in the component
          return null
        },
        condition: (summary) => {
          const jailbreakSummary = summary as JailbreakEvaluationSummary
          return !!jailbreakSummary.byAttackType && Object.keys(jailbreakSummary.byAttackType).length > 0
        }
      },
      {
        key: 'byPolicy',
        title: 'Results by Policy',
        order: 2,
        render: (summary) => {
          return null
        },
        condition: (summary) => {
          return !!summary.by_policy && Object.keys(summary.by_policy).length > 0
        }
      }
    ]
  }

  /**
   * Get export field configurations
   */
  getExportFields(): ExportFieldConfig[] {
    return [
      {
        key: 'policyName',
        label: 'Policy Name',
        getValue: (record) => record.policy_name,
        format: 'string'
      },
      {
        key: 'topic',
        label: 'Topic',
        getValue: (record) => record.topic || '',
        format: 'string'
      },
      {
        key: 'behaviorType',
        label: 'Behavior Type',
        getValue: (record) => record.behavior_type,
        format: 'string'
      },
      {
        key: 'basePrompt',
        label: 'Base Prompt',
        getValue: (record) => record.base_prompt,
        format: 'string'
      },
      {
        key: 'attackType',
        label: 'Attack Type',
        getValue: (record) => (record as JailbreakEvaluationResult).attackType,
        format: 'string'
      },
      {
        key: 'adversarialPrompt',
        label: 'Adversarial Prompt',
        getValue: (record) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          const prompt = jailbreakRecord.adversarialPrompt
          if (Array.isArray(prompt)) {
            return JSON.stringify(prompt)
          }
          return typeof prompt === 'object' && 'text' in prompt ? prompt.text : String(prompt)
        },
        format: 'string'
      },
      {
        key: 'systemResponse',
        label: 'System Response',
        getValue: (record) => record.system_response || '',
        format: 'string'
      },
      {
        key: 'attackOutcome',
        label: 'Attack Outcome',
        getValue: (record) => (record as JailbreakEvaluationResult).attackOutcome,
        format: 'string'
      }
    ]
  }

  /**
   * Get outcome badge variant for styling
   */
  getOutcomeBadgeVariant(outcome: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (outcome === 'Attack Failure') return 'default'
    if (outcome === 'Attack Success') return 'destructive'
    return 'outline'
  }

  /**
   * Get outcome color for visualizations
   */
  getOutcomeColor(outcome: string): string {
    if (outcome === 'Attack Failure') return '#22c55e' // green
    if (outcome === 'Attack Success') return '#ef4444' // red
    return '#6b7280' // gray
  }

  /**
   * Get conversation sections for jailbreak test type
   */
  getConversationSections(): ConversationSectionConfig[] {
    return [
      {
        key: 'basePrompt',
        title: 'Base Prompt',
        order: 1,
        render: (record: BaseEvaluationResult, ctx?: HighlightingContext) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          return (
            <>
              <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
                Base Prompt
              </h3>
              <div className="px-2 text-sm font-425 leading-5 text-gray-900">
                {jailbreakRecord.basePrompt}
              </div>
            </>
          )
        }
      },
      {
        key: 'adversarialPrompt',
        title: 'Jailbreak Prompt',
        order: 2,
        render: (record: BaseEvaluationResult, ctx?: HighlightingContext) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          const isMultiTurn = Array.isArray(jailbreakRecord.adversarialPrompt)
          const adversarialPrompt = jailbreakRecord.adversarialPrompt

          // Get adversarial prompt text for single-turn
          const getPromptText = (prompt: AdversarialPrompt): string => {
            if (Array.isArray(prompt)) {
              return prompt.map((turn) => `[${turn.role}]: ${turn.content}`).join('\n\n')
            }
            if (typeof prompt === 'object' && 'text' in prompt) {
              return prompt.text
            }
            return typeof prompt === 'string' ? prompt : ''
          }

          return (
            <>
              <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
                Jailbreak Prompt {isMultiTurn && <span className="text-gray-500">(Multi-turn)</span>}
              </h3>
              {isMultiTurn ? (
                <div className="border border-gray-200 rounded-lg p-2 space-y-4">
                  {(adversarialPrompt as any[]).map((turn: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <p className="text-[0.8125rem] font-425 leading-4 text-gray-600 capitalize">
                        {turn.role}
                      </p>
                      <div className="text-sm leading-5 text-gray-900 whitespace-pre-wrap">
                        {turn.role === 'user' && ctx ? (
                          <HighlightedText
                            highlightPhrases={ctx.shouldHighlightPrompt ? ctx.highlightPhrases : ctx.allInputPhrases}
                            className="text-sm leading-5 text-gray-900"
                            highlightColor={ctx.highlightColor}
                            hoveredBehavior={ctx.hoveredBehavior}
                            selectedBehaviors={ctx.selectedBehaviors}
                            onPhraseClick={(idx) => ctx.handlePhraseClick(idx, 'input')}
                            showHighlightByDefault={true}
                          >
                            {turn.content}
                          </HighlightedText>
                        ) : (
                          turn.content
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-2 space-y-2">
                  <div className="text-sm leading-5 text-gray-900">
                    {ctx ? (
                      <HighlightedText
                        highlightPhrases={ctx.shouldHighlightPrompt ? ctx.highlightPhrases : ctx.allInputPhrases}
                        className="text-sm leading-5 text-gray-900"
                        highlightColor={ctx.highlightColor}
                        hoveredBehavior={ctx.hoveredBehavior}
                        selectedBehaviors={ctx.selectedBehaviors}
                        onPhraseClick={(idx) => ctx.handlePhraseClick(idx, 'input')}
                        showHighlightByDefault={true}
                      >
                        {getPromptText(adversarialPrompt)}
                      </HighlightedText>
                    ) : (
                      getPromptText(adversarialPrompt)
                    )}
                  </div>
                </div>
              )}
            </>
          )
        }
      },
      {
        key: 'systemResponse',
        title: 'AI System Response',
        order: 3,
        render: (record: BaseEvaluationResult, ctx?: HighlightingContext) => {
          const jailbreakRecord = record as JailbreakEvaluationResult
          return (
            <>
              <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
                AI System Response
              </h3>
              <div className="px-2">
                {ctx ? (
                  <HighlightedMarkdownRenderer
                    content={jailbreakRecord.systemResponse}
                    highlightPhrases={ctx.shouldHighlightResponse ? ctx.highlightPhrases : ctx.allOutputPhrases}
                    highlightColor={ctx.highlightColor}
                    hoveredBehavior={ctx.hoveredBehavior}
                    selectedBehaviors={ctx.selectedBehaviors}
                    onPhraseClick={(idx) => ctx.handlePhraseClick(idx, 'output')}
                    showHighlightByDefault={true}
                  />
                ) : (
                  <div className="text-sm font-425 leading-relaxed text-gray-900">
                    {jailbreakRecord.systemResponse}
                  </div>
                )}
              </div>
            </>
          )
        }
      }
    ]
  }

  /**
   * Get title for the conversation view
   */
  getConversationTitle(record: BaseEvaluationResult): string | null {
    const jailbreakRecord = record as JailbreakEvaluationResult
    return jailbreakRecord.promptTitle || null
  }

  /**
   * Get badge info for the conversation view header
   */
  getConversationBadge(record: BaseEvaluationResult) {
    const jailbreakRecord = record as JailbreakEvaluationResult
    const isAttackSuccess = jailbreakRecord.attackOutcome === 'Attack Success'

    return {
      text: jailbreakRecord.attackOutcome,
      variant: (isAttackSuccess ? 'destructive' : 'default') as 'default' | 'destructive',
      color: isAttackSuccess ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
    }
  }
}
