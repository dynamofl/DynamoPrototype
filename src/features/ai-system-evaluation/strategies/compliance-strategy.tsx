// Compliance Strategy Implementation
// Implements EvaluationStrategy interface for compliance test type

import type {
  EvaluationStrategy,
  ColumnConfig,
  FilterConfig,
  SummaryCardConfig,
  DetailSectionConfig,
  ExportFieldConfig,
  AnalysisSectionConfig,
  ConversationSectionConfig,
  SummarySectionConfig
} from './base-strategy'
import type { BaseEvaluationResult } from '../types/base-evaluation'
import type {
  ComplianceEvaluationResult,
  ComplianceEvaluationSummary,
  FinalOutcome,
  GroundTruth,
  PerturbationMetrics
} from '../types/compliance-evaluation'

// Import configuration functions
import { getComplianceSummaryConfig } from './configs/compliance-summary-config'
import {
  getComplianceTableColumns,
  getComplianceFilters,
  getComplianceDetailSections,
  getComplianceExportFields,
  getComplianceConversationSections
} from './configs/compliance-data-config'

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
    const tp = complianceResults.filter(r => r.final_outcome === 'TP').length
    const tn = complianceResults.filter(r => r.final_outcome === 'TN').length
    const fp = complianceResults.filter(r => r.final_outcome === 'FP').length
    const fn = complianceResults.filter(r => r.final_outcome === 'FN').length

    const totalTests = complianceResults.length

    // Calculate derived metrics
    const precision = tp + fp > 0 ? tp / (tp + fp) : 0
    const recall = tp + fn > 0 ? tp / (tp + fn) : 0
    const f1Score = precision + recall > 0 ? 2 * (precision * recall) / (precision + recall) : 0
    const accuracy = totalTests > 0 ? (tp + tn) / totalTests : 0

    // Calculate by policy
    const byPolicy: Record<string, any> = {}
    complianceResults.forEach(result => {
      if (!byPolicy[result.policy_id]) {
        byPolicy[result.policy_id] = {
          policy_name: result.policy_name,
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
      byPolicy[result.policy_id].total++

      // Count outcomes
      if (result.final_outcome === 'TP') byPolicy[result.policy_id].tp++
      if (result.final_outcome === 'TN') byPolicy[result.policy_id].tn++
      if (result.final_outcome === 'FP') byPolicy[result.policy_id].fp++
      if (result.final_outcome === 'FN') byPolicy[result.policy_id].fn++

      // Success = TP or TN, Failure = FP or FN
      if (result.final_outcome === 'TP' || result.final_outcome === 'TN') {
        byPolicy[result.policy_id].successes++
      } else {
        byPolicy[result.policy_id].failures++
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
      if (!byBehaviorType[result.behavior_type]) {
        byBehaviorType[result.behavior_type] = {
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
      byBehaviorType[result.behavior_type].total++

      if (result.final_outcome === 'TP') byBehaviorType[result.behavior_type].tp++
      if (result.final_outcome === 'TN') byBehaviorType[result.behavior_type].tn++
      if (result.final_outcome === 'FP') byBehaviorType[result.behavior_type].fp++
      if (result.final_outcome === 'FN') byBehaviorType[result.behavior_type].fn++

      if (result.final_outcome === 'TP' || result.final_outcome === 'TN') {
        byBehaviorType[result.behavior_type].successes++
      } else {
        byBehaviorType[result.behavior_type].failures++
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
      const perturbationType = result.perturbation_type || 'None'
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

      if (result.final_outcome === 'TP') byPerturbationType[perturbationType].tp++
      if (result.final_outcome === 'TN') byPerturbationType[perturbationType].tn++
      if (result.final_outcome === 'FP') byPerturbationType[perturbationType].fp++
      if (result.final_outcome === 'FN') byPerturbationType[perturbationType].fn++
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
   * Data View Configuration - Delegates to config file
   */
  getTableColumns(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): ColumnConfig[] {
    return getComplianceTableColumns(options)
  }

  getFilters(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): FilterConfig[] {
    return getComplianceFilters(options)
  }

  getDetailSections(): DetailSectionConfig[] {
    return getComplianceDetailSections()
  }

  getExportFields(): ExportFieldConfig[] {
    return getComplianceExportFields()
  }

  getConversationSections(): ConversationSectionConfig[] {
    return getComplianceConversationSections()
  }

  /**
   * Summary View Configuration - Delegates to config file
   */
  getSummaryViewConfig(): SummarySectionConfig[] {
    return getComplianceSummaryConfig()
  }

  /**
   * Summary Cards Configuration - Used by generic summary components
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
   * Analysis Sections Configuration
   */
  getAnalysisSections(): AnalysisSectionConfig[] {
    return [
      {
        key: 'confusionMatrix',
        title: 'Confusion Matrix',
        order: 1,
        render: () => null
      },
      {
        key: 'byPerturbationType',
        title: 'Results by Perturbation Type',
        order: 2,
        render: () => null,
        condition: (summary) => {
          const complianceSummary = summary as ComplianceEvaluationSummary
          return !!complianceSummary.byPerturbationType &&
            Object.keys(complianceSummary.byPerturbationType).length > 1
        }
      },
      {
        key: 'byPolicy',
        title: 'Results by Policy',
        order: 3,
        render: () => null
      }
    ]
  }

  /**
   * Utility Methods
   */
  getOutcomeBadgeVariant(outcome: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (outcome === 'TP' || outcome === 'TN') return 'default'
    if (outcome === 'FP' || outcome === 'FN') return 'destructive'
    return 'outline'
  }

  getOutcomeColor(outcome: string): string {
    if (outcome === 'TP' || outcome === 'TN') return '#22c55e' // green
    if (outcome === 'FP' || outcome === 'FN') return '#ef4444' // red
    return '#6b7280' // gray
  }

  getConversationTitle(record: BaseEvaluationResult): string | null {
    const complianceRecord = record as ComplianceEvaluationResult
    return complianceRecord.promptTitle || complianceRecord.base_prompt.substring(0, 50) + '...'
  }

  getConversationBadge(record: BaseEvaluationResult) {
    const complianceRecord = record as ComplianceEvaluationResult
    const isSuccess = complianceRecord.final_outcome === 'TP' || complianceRecord.final_outcome === 'TN'

    const outcomeLabels = {
      'TP': 'True Positive',
      'TN': 'True Negative',
      'FP': 'False Positive',
      'FN': 'False Negative'
    }

    return {
      text: outcomeLabels[complianceRecord.final_outcome] || complianceRecord.final_outcome,
      variant: (isSuccess ? 'default' : 'destructive') as 'default' | 'destructive',
      color: isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }
  }
}
