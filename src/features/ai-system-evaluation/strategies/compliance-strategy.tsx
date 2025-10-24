// Compliance Strategy Implementation
// Implements EvaluationStrategy interface for compliance test type

import { ShieldBan, ShieldCheck, MessageCircleOff, CircleCheckBig } from 'lucide-react'
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
  ComplianceEvaluationResult,
  ComplianceEvaluationSummary,
  FinalOutcome,
  GroundTruth,
  PerturbationMetrics
} from '../types/compliance-evaluation'
import { Badge } from '@/components/ui/badge'
import { HighlightedText } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { HighlightedMarkdownRenderer } from '../components/results/conversation-view-components/shared-components'

export class ComplianceStrategy implements EvaluationStrategy {
  readonly testType = 'compliance'
  readonly displayName = 'Compliance'

  /**
   * Transform database records to frontend result format
   */
  transformPrompts(dbRecords: any[]): ComplianceEvaluationResult[] {
    return dbRecords.map((record) => {
      const result = {
        // Base fields (both camelCase and snake_case for compatibility)
        policyId: record.policy_id,
        policy_id: record.policy_id,
        policyName: record.policy_name,
        policy_name: record.policy_name,
        topic: record.topic,
        promptTitle: record.prompt_title,
        prompt_title: record.prompt_title,
        promptIndex: record.prompt_index,
        prompt_index: record.prompt_index,
        policyContext: record.policy_context,
        policy_context: record.policy_context,
        behaviorType: record.behavior_type,
        behavior_type: record.behavior_type,
        basePrompt: record.base_prompt,
        base_prompt: record.base_prompt,

        // Compliance-specific fields
        actualPrompt: record.actual_prompt,
        actual_prompt: record.actual_prompt,
        perturbationType: record.perturbation_type || null,
        perturbation_type: record.perturbation_type || null,
        groundTruth: record.ground_truth as GroundTruth,
        ground_truth: record.ground_truth as GroundTruth,
        behaviorUsed: record.behavior_used,
        behavior_used: record.behavior_used,
        behaviorPhrases: record.behavior_phrases ? {
          phrases: record.behavior_phrases.phrases || [],
          positions: record.behavior_phrases.positions
        } : undefined,
        behavior_phrases: record.behavior_phrases,

        // System response (from ai_system_response)
        systemResponse: record.ai_system_response?.content || '',
        system_response: record.ai_system_response?.content || '',

        // Judgement and outcome
        complianceJudgement: record.ai_system_response?.judgement || record.compliance_judgement || null,
        compliance_judgement: record.ai_system_response?.judgement || record.compliance_judgement || null,
        judgeModelConfidence: record.ai_system_response?.confidenceScore || null,
        judgeModelAnswerPhrases: record.ai_system_response?.answerPhrases || null,
        finalOutcome: record.final_outcome as FinalOutcome,
        final_outcome: record.final_outcome as FinalOutcome,

        // Guardrails
        inputGuardrailJudgement: record.input_guardrail?.judgement || null,
        input_guardrail_judgement: record.input_guardrail?.judgement || null,
        inputGuardrailReason: record.input_guardrail?.reason || null,
        inputGuardrailDetails: record.input_guardrail?.details || null,

        outputGuardrailJudgement: record.output_guardrail?.judgement || null,
        output_guardrail_judgement: record.output_guardrail?.judgement || null,
        outputGuardrailReason: record.output_guardrail?.reason || null,
        outputGuardrailDetails: record.output_guardrail?.details || null,

        // Metrics (from ai_system_response)
        runtimeMs: record.runtime_ms,
        runtime_ms: record.runtime_ms,
        inputTokens: record.ai_system_response?.inputTokens || record.input_tokens,
        input_tokens: record.ai_system_response?.inputTokens || record.input_tokens,
        outputTokens: record.ai_system_response?.outputTokens || record.output_tokens,
        output_tokens: record.ai_system_response?.outputTokens || record.output_tokens,
        totalTokens: (record.ai_system_response?.inputTokens || record.input_tokens || 0) +
                     (record.ai_system_response?.outputTokens || record.output_tokens || 0),
        total_tokens: (record.ai_system_response?.inputTokens || record.input_tokens || 0) +
                      (record.ai_system_response?.outputTokens || record.output_tokens || 0)
      }
      return result
    })
  }

  /**
   * Calculate summary metrics from results
   */
  calculateSummary(results: BaseEvaluationResult[]): ComplianceEvaluationSummary {
    const complianceResults = results as ComplianceEvaluationResult[]

    // Calculate confusion matrix
    const tp = complianceResults.filter(r => r.finalOutcome === 'TP').length
    const tn = complianceResults.filter(r => r.finalOutcome === 'TN').length
    const fp = complianceResults.filter(r => r.finalOutcome === 'FP').length
    const fn = complianceResults.filter(r => r.finalOutcome === 'FN').length

    const totalTests = complianceResults.length

    // Calculate derived metrics
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0
    const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0
    const accuracy = totalTests > 0 ? (tp + tn) / totalTests : 0

    // Calculate by policy
    const byPolicy: Record<string, any> = {}
    complianceResults.forEach(result => {
      if (!byPolicy[result.policyId]) {
        byPolicy[result.policyId] = {
          policy_name: result.policyName,
          total: 0,
          tp: 0,
          tn: 0,
          fp: 0,
          fn: 0,
          successes: 0,
          failures: 0,
          success_rate: 0
        }
      }
      byPolicy[result.policyId].total++

      // Count outcomes
      if (result.finalOutcome === 'TP') byPolicy[result.policyId].tp++
      if (result.finalOutcome === 'TN') byPolicy[result.policyId].tn++
      if (result.finalOutcome === 'FP') byPolicy[result.policyId].fp++
      if (result.finalOutcome === 'FN') byPolicy[result.policyId].fn++

      // Success = TP or TN, Failure = FP or FN
      if (result.finalOutcome === 'TP' || result.finalOutcome === 'TN') {
        byPolicy[result.policyId].successes++
      } else {
        byPolicy[result.policyId].failures++
      }
    })

    // Calculate success rates for policies
    Object.keys(byPolicy).forEach(policyId => {
      const policy = byPolicy[policyId]
      policy.success_rate = policy.total > 0 ? (policy.successes / policy.total) * 100 : 0
    })

    // Calculate by behavior type
    const byBehaviorType: Record<string, any> = {}
    complianceResults.forEach(result => {
      if (!byBehaviorType[result.behaviorType]) {
        byBehaviorType[result.behaviorType] = {
          total: 0,
          tp: 0,
          tn: 0,
          fp: 0,
          fn: 0,
          successes: 0,
          failures: 0,
          success_rate: 0
        }
      }
      byBehaviorType[result.behaviorType].total++

      if (result.finalOutcome === 'TP') byBehaviorType[result.behaviorType].tp++
      if (result.finalOutcome === 'TN') byBehaviorType[result.behaviorType].tn++
      if (result.finalOutcome === 'FP') byBehaviorType[result.behaviorType].fp++
      if (result.finalOutcome === 'FN') byBehaviorType[result.behaviorType].fn++

      if (result.finalOutcome === 'TP' || result.finalOutcome === 'TN') {
        byBehaviorType[result.behaviorType].successes++
      } else {
        byBehaviorType[result.behaviorType].failures++
      }
    })

    // Calculate success rates for behavior types
    Object.keys(byBehaviorType).forEach(behaviorType => {
      const stats = byBehaviorType[behaviorType]
      stats.success_rate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0
    })

    // Calculate by perturbation type
    const byPerturbationType: Record<string, PerturbationMetrics> = {}
    complianceResults.forEach(result => {
      const perturbationType = result.perturbationType || 'None'
      if (!byPerturbationType[perturbationType]) {
        byPerturbationType[perturbationType] = {
          perturbation_type: perturbationType,
          total: 0,
          tp: 0,
          tn: 0,
          fp: 0,
          fn: 0,
          accuracy: 0
        }
      }
      byPerturbationType[perturbationType].total++

      if (result.finalOutcome === 'TP') byPerturbationType[perturbationType].tp++
      if (result.finalOutcome === 'TN') byPerturbationType[perturbationType].tn++
      if (result.finalOutcome === 'FP') byPerturbationType[perturbationType].fp++
      if (result.finalOutcome === 'FN') byPerturbationType[perturbationType].fn++
    })

    // Calculate accuracy for perturbation types
    Object.keys(byPerturbationType).forEach(perturbationType => {
      const metrics = byPerturbationType[perturbationType]
      metrics.accuracy = metrics.total > 0
        ? (metrics.tp + metrics.tn) / metrics.total
        : 0
    })

    return {
      total_tests: totalTests,
      tp,
      tn,
      fp,
      fn,
      precision,
      recall,
      f1_score: f1Score,
      f1Score: f1Score,
      accuracy,
      by_policy: byPolicy,
      by_behavior_type: byBehaviorType,
      by_perturbation_type: byPerturbationType,
      byPerturbationType: byPerturbationType
    }
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
        render: (record) => (
          <div className="truncate max-w-md group-hover:underline" title={record.base_prompt}>
            {record.base_prompt}
          </div>
        )
      },
      {
        key: 'topic',
        label: 'Topic',
        render: (record) => (
          <Badge variant="outline" className="text-xs">
            {record.topic || 'General'}
          </Badge>
        )
      },

      {
        key: 'groundTruth',
        label: 'Ground Truth',
        render: (record) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return (
            <Badge variant="outline" className={
              complianceRecord.groundTruth === 'Compliant'
                ? 'bg-green-50 text-green-800 border-green-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }>
              {complianceRecord.groundTruth}
            </Badge>
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
          const complianceRecord = record as any
          if (!complianceRecord.input_guardrail_judgement && !complianceRecord.inputGuardrailJudgement) {
            return <span className="text-gray-400">—</span>
          }

          // Handle multiple guardrails with details
          const details = complianceRecord.inputGuardrailDetails || []
          if (details.length > 1) {
            const blockedCount = details.filter((d: any) => d.judgement === 'Blocked').length
            const totalCount = details.length
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
          const judgement = complianceRecord.input_guardrail_judgement || complianceRecord.inputGuardrailJudgement
          const isBlocked = judgement === 'Blocked'
          return (
            <div className="flex items-center gap-2">
              {isBlocked ?
                <ShieldBan className="w-4 h-4 text-red-600" /> :
                <ShieldCheck className="w-4 h-4 text-green-600" />
              }
              <span className="">{judgement}</span>
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
          const complianceRecord = record as any
          if (!complianceRecord.output_guardrail_judgement && !complianceRecord.outputGuardrailJudgement) {
            return <span className="text-gray-400">—</span>
          }

          // Handle multiple guardrails with details
          const details = complianceRecord.outputGuardrailDetails || []
          if (details.length > 1) {
            const blockedCount = details.filter((d: any) => d.judgement === 'Blocked').length
            const totalCount = details.length
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
          const judgement = complianceRecord.output_guardrail_judgement || complianceRecord.outputGuardrailJudgement
          const isBlocked = judgement === 'Blocked'
          return (
            <div className="flex items-center gap-2">
              {isBlocked ?
                <ShieldBan className="w-4 h-4 text-red-600" /> :
                <ShieldCheck className="w-4 h-4 text-green-600" />
              }
              <span className="">{judgement}</span>
            </div>
          )
        }
      })
    }

    // AI System Judgement column
    columns.push({
      key: 'aiSystemJudgement',
      label: 'AI System Judgement',
      render: (record) => {
        const complianceRecord = record as ComplianceEvaluationResult
        const judgement = complianceRecord.complianceJudgement || 'Answered'
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

    // Final outcome column
    columns.push({
      key: 'finalOutcome',
      label: 'Final Outcome',
      render: (record) => {
        const complianceRecord = record as ComplianceEvaluationResult
        const outcome = complianceRecord.finalOutcome

        const outcomeConfig = {
          'TP': { label: 'True Positive', color: 'bg-green-50 text-green-800' },
          'TN': { label: 'True Negative', color: 'bg-green-50 text-green-800' },
          'FP': { label: 'False Positive', color: 'bg-red-50 text-red-800' },
          'FN': { label: 'False Negative', color: 'bg-red-50 text-red-800' }
        }

        const config = outcomeConfig[outcome] || outcomeConfig['TP']

        return (
          <Badge
            variant="secondary"
            className={`text-xs ${config.color}`}
          >
            {config.label}
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
        key: 'finalOutcome',
        label: 'Final Outcome',
        type: 'multiselect',
        options: [
          { value: 'TP', label: 'True Positive (TP)' },
          { value: 'TN', label: 'True Negative (TN)' },
          { value: 'FP', label: 'False Positive (FP)' },
          { value: 'FN', label: 'False Negative (FN)' }
        ],
        filterFn: (record, values) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return values.includes(complianceRecord.finalOutcome)
        }
      },
      {
        key: 'groundTruth',
        label: 'Ground Truth',
        type: 'multiselect',
        options: [
          { value: 'Compliant', label: 'Compliant' },
          { value: 'Non-Compliant', label: 'Non-Compliant' }
        ],
        filterFn: (record, values) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return values.includes(complianceRecord.groundTruth)
        }
      },
      {
        key: 'perturbationType',
        label: 'Perturbation Type',
        type: 'multiselect',
        options: [
          { value: 'None', label: 'None' },
          { value: 'typos', label: 'Typos' },
          { value: 'casing', label: 'Casing Changes' },
          { value: 'synonyms', label: 'Synonyms' },
          { value: 'leetspeak', label: 'Leetspeak' }
        ],
        filterFn: (record, values) => {
          const complianceRecord = record as ComplianceEvaluationResult
          const perturbationType = complianceRecord.perturbationType || 'None'
          return values.includes(perturbationType)
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
        options: [], // Will be populated dynamically
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

    return filters
  }

  /**
   * Get summary cards configuration
   */
  getSummaryCards(): SummaryCardConfig[] {
    return [
      {
        title: 'True Positives (TP)',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).tp,
        format: 'number',
        color: 'green',
        description: 'AI responded when it should (allowed behavior)'
      },
      {
        title: 'True Negatives (TN)',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).tn,
        format: 'number',
        color: 'green',
        description: 'AI blocked when it should (disallowed behavior)'
      },
      {
        title: 'False Positives (FP)',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).fp,
        format: 'number',
        color: 'red',
        description: 'AI blocked when it shouldn\'t (allowed behavior)'
      },
      {
        title: 'False Negatives (FN)',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).fn,
        format: 'number',
        color: 'red',
        description: 'AI responded when it shouldn\'t (disallowed behavior)'
      },
      {
        title: 'F1 Score',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).f1Score,
        format: 'percentage',
        formatFn: (value) => `${((value as number) * 100).toFixed(1)}%`,
        color: 'blue',
        description: 'Harmonic mean of precision and recall'
      },
      {
        title: 'Accuracy',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).accuracy,
        format: 'percentage',
        formatFn: (value) => `${((value as number) * 100).toFixed(1)}%`,
        color: 'blue',
        description: 'Overall correctness rate'
      }
    ]
  }

  /**
   * Get detail sections for individual record view
   */
  getDetailSections(): DetailSectionConfig[] {
    return [
      {
        title: 'Actual Prompt',
        order: 1,
        render: (record) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return (
            <div className="space-y-2">
              <div className="bg-gray-50 p-4 rounded">
                {complianceRecord.actualPrompt}
              </div>
              {complianceRecord.perturbationType && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Perturbation Applied:</span>
                  <Badge>{complianceRecord.perturbationType}</Badge>
                </div>
              )}
            </div>
          )
        }
      },
      {
        title: 'Ground Truth Analysis',
        order: 2,
        render: (record) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Expected Outcome:</span>
                <Badge variant="outline" className={
                  complianceRecord.groundTruth === 'Compliant'
                    ? 'bg-green-50 text-green-800'
                    : 'bg-red-50 text-red-800'
                }>
                  {complianceRecord.groundTruth}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Actual Outcome:</span>
                <Badge
                  variant={
                    complianceRecord.finalOutcome === 'TP' || complianceRecord.finalOutcome === 'TN'
                      ? 'default'
                      : 'destructive'
                  }
                >
                  {complianceRecord.finalOutcome}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Behavior Type:</span>
                <Badge variant="secondary">{complianceRecord.behaviorType}</Badge>
              </div>
              {complianceRecord.behaviorUsed && (
                <div className="text-sm">
                  <span className="font-medium">Behavior Used:</span>
                  <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                    {complianceRecord.behaviorUsed}
                  </div>
                </div>
              )}
            </div>
          )
        }
      },
      {
        title: 'Perturbation Comparison',
        order: 3,
        render: (record) => {
          const complianceRecord = record as ComplianceEvaluationResult
          if (!complianceRecord.perturbationType) return null

          return (
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium">Base Prompt:</span>
                <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                  {complianceRecord.basePrompt}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium">Perturbed Prompt ({complianceRecord.perturbationType}):</span>
                <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                  {complianceRecord.actualPrompt}
                </div>
              </div>
            </div>
          )
        },
        condition: (record) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return !!complianceRecord.perturbationType
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
        key: 'confusionMatrix',
        title: 'Confusion Matrix',
        order: 1,
        render: () => null // Will be implemented in component
      },
      {
        key: 'byPerturbationType',
        title: 'Results by Perturbation Type',
        order: 2,
        render: () => null, // Will be implemented in component
        condition: (summary) => {
          const complianceSummary = summary as ComplianceEvaluationSummary
          return !!complianceSummary.byPerturbationType &&
            Object.keys(complianceSummary.byPerturbationType).length > 1 // More than just "None"
        }
      },
      {
        key: 'byPolicy',
        title: 'Results by Policy',
        order: 3,
        render: () => null // Will be implemented in component
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
        key: 'actualPrompt',
        label: 'Actual Prompt',
        getValue: (record) => (record as ComplianceEvaluationResult).actualPrompt,
        format: 'string'
      },
      {
        key: 'groundTruth',
        label: 'Ground Truth',
        getValue: (record) => (record as ComplianceEvaluationResult).groundTruth,
        format: 'string'
      },
      {
        key: 'systemResponse',
        label: 'System Response',
        getValue: (record) => record.system_response || '',
        format: 'string'
      },
      {
        key: 'aiSystemJudgement',
        label: 'AI System Judgement',
        getValue: (record) => (record as ComplianceEvaluationResult).complianceJudgement || 'Answered',
        format: 'string'
      },
      {
        key: 'finalOutcome',
        label: 'Final Outcome',
        getValue: (record) => {
          const outcome = (record as ComplianceEvaluationResult).finalOutcome
          const labels: Record<string, string> = {
            'TP': 'True Positive',
            'TN': 'True Negative',
            'FP': 'False Positive',
            'FN': 'False Negative'
          }
          return labels[outcome] || outcome
        },
        format: 'string'
      }
    ]
  }

  /**
   * Get outcome badge variant for styling
   */
  getOutcomeBadgeVariant(outcome: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (outcome === 'TP' || outcome === 'TN') return 'default'
    if (outcome === 'FP' || outcome === 'FN') return 'destructive'
    return 'outline'
  }

  /**
   * Get outcome color for visualizations
   */
  getOutcomeColor(outcome: string): string {
    if (outcome === 'TP' || outcome === 'TN') return '#22c55e' // green
    if (outcome === 'FP' || outcome === 'FN') return '#ef4444' // red
    return '#6b7280' // gray
  }

  /**
   * Get conversation sections for compliance test type
   */
  getConversationSections(): ConversationSectionConfig[] {
    return [
      {
        key: 'basePrompt',
        title: 'Base Prompt',
        order: 1,
        render: (record: BaseEvaluationResult, ctx?: HighlightingContext) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return (
            <>
              <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
                Base Prompt
              </h3>
              <div className="px-2 text-sm font-425 leading-5 text-gray-900">
                {complianceRecord.basePrompt}
              </div>
            </>
          )
        }
      },
      {
        key: 'actualPrompt',
        title: 'Actual Prompt',
        order: 2,
        render: (record: BaseEvaluationResult, ctx?: HighlightingContext) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return (
            <>
              <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
                Actual Prompt
                {complianceRecord.perturbationType && (
                  <span className="text-gray-500"> ({complianceRecord.perturbationType})</span>
                )}
              </h3>
              <div className="px-2 text-sm font-425 leading-5 text-gray-900">
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
                    {(complianceRecord as any).actualPrompt}
                  </HighlightedText>
                ) : (
                  (complianceRecord as any).actualPrompt
                )}
              </div>
              {complianceRecord.perturbationType && (
                <div className="px-2 text-xs text-gray-500 italic">
                  Perturbation applied: {complianceRecord.perturbationType}
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
          const complianceRecord = record as ComplianceEvaluationResult
          return (
            <>
              <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
                AI System Response
              </h3>
              <div className="px-2">
                {ctx ? (
                  <HighlightedMarkdownRenderer
                    content={(complianceRecord as any).systemResponse || 'No response'}
                    highlightPhrases={ctx.shouldHighlightResponse ? ctx.highlightPhrases : ctx.allOutputPhrases}
                    highlightColor={ctx.highlightColor}
                    hoveredBehavior={ctx.hoveredBehavior}
                    selectedBehaviors={ctx.selectedBehaviors}
                    onPhraseClick={(idx) => ctx.handlePhraseClick(idx, 'output')}
                    showHighlightByDefault={true}
                  />
                ) : (
                  <div className="text-sm font-425 leading-relaxed text-gray-900">
                    {(complianceRecord as any).systemResponse || 'No response'}
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
    const complianceRecord = record as ComplianceEvaluationResult
    return complianceRecord.promptTitle || complianceRecord.basePrompt.substring(0, 50) + '...'
  }

  /**
   * Get badge info for the conversation view header
   */
  getConversationBadge(record: BaseEvaluationResult) {
    const complianceRecord = record as ComplianceEvaluationResult
    const isSuccess = complianceRecord.finalOutcome === 'TP' || complianceRecord.finalOutcome === 'TN'

    const outcomeLabels = {
      'TP': 'True Positive',
      'TN': 'True Negative',
      'FP': 'False Positive',
      'FN': 'False Negative'
    }

    return {
      text: outcomeLabels[complianceRecord.finalOutcome] || complianceRecord.finalOutcome,
      variant: (isSuccess ? 'default' : 'destructive') as 'default' | 'destructive',
      color: isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }
  }
}
