// Compliance Strategy Implementation
// Implements EvaluationStrategy interface for compliance test type

import { MessagesSquare, ShieldBan, ShieldCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
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

export class ComplianceStrategy implements EvaluationStrategy {
  readonly testType = 'compliance'
  readonly displayName = 'Compliance'

  /**
   * Transform database records to frontend result format
   */
  transformPrompts(dbRecords: any[]): ComplianceEvaluationResult[] {
    return dbRecords.map(record => ({
      // Base fields
      policyId: record.policy_id,
      policyName: record.policy_name,
      topic: record.topic,
      promptTitle: record.prompt_title,
      policyContext: record.policy_context,
      behaviorType: record.behavior_type,
      basePrompt: record.base_prompt,
      base_prompt: record.base_prompt,
      behavior_type: record.behavior_type,

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
    }))
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
  getTableColumns(hasGuardrails = true): ColumnConfig[] {
    const columns: ColumnConfig[] = [
      {
        key: 'icon',
        label: '',
        width: 'w-8',
        className: 'pr-[0px]',
        render: () => <MessagesSquare className="h-4 w-4 text-gray-500" strokeWidth="2" />
      },
      {
        key: 'basePrompt',
        label: 'Test Prompts',
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
      },
      {
        key: 'behaviorType',
        label: 'Behavior Type',
        render: (record) => (
          <Badge variant="secondary">
            {record.behavior_type}
          </Badge>
        )
      },
      {
        key: 'perturbationType',
        label: 'Perturbation',
        render: (record) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return (
            <Badge variant="outline" className="text-xs">
              {complianceRecord.perturbationType || 'None'}
            </Badge>
          )
        }
      }
    ]

    // Add guardrail columns if applicable
    if (hasGuardrails) {
      columns.push(
        {
          key: 'inputGuardrail',
          label: 'Input Guardrail',
          render: (record) => {
            if (!record.input_guardrail_judgement) return <span className="text-gray-400">—</span>
            const isBlocked = record.input_guardrail_judgement === 'Blocked'
            return (
              <div className="flex items-center gap-2">
                {isBlocked ?
                  <ShieldBan className="w-4 h-4 text-red-600" /> :
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                }
                <span>{record.input_guardrail_judgement}</span>
              </div>
            )
          }
        },
        {
          key: 'outputGuardrail',
          label: 'Output Guardrail',
          render: (record) => {
            if (!record.output_guardrail_judgement) return <span className="text-gray-400">—</span>
            const isBlocked = record.output_guardrail_judgement === 'Blocked'
            return (
              <div className="flex items-center gap-2">
                {isBlocked ?
                  <ShieldBan className="w-4 h-4 text-red-600" /> :
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                }
                <span>{record.output_guardrail_judgement}</span>
              </div>
            )
          }
        }
      )
    }

    // Final outcome column
    columns.push({
      key: 'finalOutcome',
      label: 'Final Outcome',
      render: (record) => {
        const complianceRecord = record as ComplianceEvaluationResult
        const outcome = complianceRecord.finalOutcome

        const outcomeConfig = {
          'TP': { label: 'True Positive', color: 'bg-green-50 text-green-800 border-green-200', icon: CheckCircle2 },
          'TN': { label: 'True Negative', color: 'bg-green-50 text-green-800 border-green-200', icon: CheckCircle2 },
          'FP': { label: 'False Positive', color: 'bg-red-50 text-red-800 border-red-200', icon: XCircle },
          'FN': { label: 'False Negative', color: 'bg-red-50 text-red-800 border-red-200', icon: AlertCircle }
        }

        const config = outcomeConfig[outcome] || outcomeConfig['TP']
        const Icon = config.icon

        return (
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <Badge variant="outline" className={`text-xs ${config.color}`}>
              {outcome}
            </Badge>
          </div>
        )
      }
    })

    return columns
  }

  /**
   * Get filter configurations
   */
  getFilters(hasGuardrails = true): FilterConfig[] {
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

    if (hasGuardrails) {
      filters.push(
        {
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
        },
        {
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
        }
      )
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
        key: 'perturbationType',
        label: 'Perturbation Type',
        getValue: (record) => (record as ComplianceEvaluationResult).perturbationType || 'None',
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
        key: 'finalOutcome',
        label: 'Final Outcome',
        getValue: (record) => (record as ComplianceEvaluationResult).finalOutcome,
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
                {complianceRecord.actualPrompt}
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
                <div className="text-sm font-425 leading-relaxed text-gray-900">
                  {complianceRecord.systemResponse || 'No response'}
                </div>
              </div>
            </>
          )
        }
      },
      {
        key: 'metadata',
        title: 'Ground Truth & Outcome',
        order: 4,
        render: (record: BaseEvaluationResult, ctx?: HighlightingContext) => {
          const complianceRecord = record as ComplianceEvaluationResult
          return (
            <>
              <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
                Ground Truth & Outcome
              </h3>
              <div className="px-2 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-450">Ground Truth:</span>
                  <span className={`px-2 py-1 rounded text-xs font-450 ${
                    complianceRecord.groundTruth === 'Compliant'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}>
                    {complianceRecord.groundTruth}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-450">Final Outcome:</span>
                  <span className={`px-2 py-1 rounded text-xs font-450 ${
                    complianceRecord.finalOutcome === 'TP' || complianceRecord.finalOutcome === 'TN'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}>
                    {complianceRecord.finalOutcome}
                  </span>
                </div>
                {complianceRecord.behaviorUsed && (
                  <div className="mt-2">
                    <span className="text-sm font-450">Behavior Used:</span>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-700">
                      {complianceRecord.behaviorUsed}
                    </div>
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
