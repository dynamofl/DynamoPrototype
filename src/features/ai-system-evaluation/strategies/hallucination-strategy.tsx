// Hallucination Strategy Implementation
// Implements EvaluationStrategy interface for hallucination test type

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
  HallucinationEvaluationResult,
  HallucinationEvaluationSummary,
  HallucinationPredLabel,
  HallucinationViolatedCategory
} from '../types/hallucination-evaluation'

// Import configuration functions
import { getHallucinationSummaryConfig } from './configs/hallucination-summary-config'
import {
  getHallucinationTableColumns,
  getHallucinationFilters,
  getHallucinationDetailSections,
  getHallucinationExportFields,
  getHallucinationConversationSections
} from './configs/hallucination-data-config'

export class HallucinationStrategy implements EvaluationStrategy {
  readonly testType = 'hallucination'
  readonly displayName = 'Hallucination'

  /**
   * Transform database records to frontend result format
   */
  transformPrompts(dbRecords: any[]): HallucinationEvaluationResult[] {
    return dbRecords.map((record) => ({
      // IDs
      id: record.id,
      evaluationId: record.evaluation_id,
      evaluation_id: record.evaluation_id,

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
      behaviorType: record.behavior_type || 'Allowed',
      behavior_type: record.behavior_type || 'Allowed',
      basePrompt: record.base_prompt,
      base_prompt: record.base_prompt,

      // Hallucination-specific fields
      context: record.context || '',
      response: record.response || record.ai_system_response?.content || '',
      predLabel: record.pred_label as HallucinationPredLabel,
      pred_label: record.pred_label as HallucinationPredLabel,
      violatedCategory: record.violated_category as HallucinationViolatedCategory,
      violated_category: record.violated_category as HallucinationViolatedCategory,
      safetyScore: record.safety_score ?? 0,
      safety_score: record.safety_score ?? 0,

      // Derived field
      is_hallucination: record.pred_label === 'unsafe',

      // System response (for future use with judge model)
      systemResponse: record.response || '',
      system_response: record.ai_system_response || record.response,

      // Guardrails (if applicable)
      inputGuardrailJudgement: record.input_guardrail?.judgement || null,
      input_guardrail_judgement: record.input_guardrail?.judgement || null,
      inputGuardrailReason: record.input_guardrail?.reason || null,
      inputGuardrailDetails: record.input_guardrail?.details || null,

      outputGuardrailJudgement: record.output_guardrail?.judgement || null,
      output_guardrail_judgement: record.output_guardrail?.judgement || null,
      outputGuardrailReason: record.output_guardrail?.reason || null,
      outputGuardrailDetails: record.output_guardrail?.details || null,

      // Metrics
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
  calculateSummary(results: BaseEvaluationResult[]): HallucinationEvaluationSummary {
    const hallucinationResults = results as HallucinationEvaluationResult[]

    const totalTests = hallucinationResults.length
    const safeCount = hallucinationResults.filter(r => r.pred_label === 'safe').length
    const unsafeCount = hallucinationResults.filter(r => r.pred_label === 'unsafe').length
    const hallucinationRate = totalTests > 0 ? (unsafeCount / totalTests) * 100 : 0

    // Calculate average safety score
    const totalSafetyScore = hallucinationResults.reduce((sum, r) => sum + (r.safety_score || 0), 0)
    const avgSafetyScore = totalTests > 0 ? totalSafetyScore / totalTests : 0

    // Calculate by category
    const categories: HallucinationViolatedCategory[] = [
      'N/A',
      'Citation / Attribution Errors',
      'Entity Inaccuracies',
      'Context contradictions'
    ]

    const byCategory: Record<HallucinationViolatedCategory, any> = {} as any

    categories.forEach(category => {
      const categoryResults = hallucinationResults.filter(r => r.violated_category === category)
      const count = categoryResults.length
      const categoryTotalScore = categoryResults.reduce((sum, r) => sum + (r.safety_score || 0), 0)

      byCategory[category] = {
        count,
        percentage: totalTests > 0 ? (count / totalTests) * 100 : 0,
        avg_safety_score: count > 0 ? categoryTotalScore / count : 0
      }
    })

    // Calculate safety score distribution
    const highScore = hallucinationResults.filter(r => (r.safety_score || 0) >= 0.8).length
    const mediumScore = hallucinationResults.filter(r => (r.safety_score || 0) >= 0.5 && (r.safety_score || 0) < 0.8).length
    const lowScore = hallucinationResults.filter(r => (r.safety_score || 0) < 0.5).length

    // Calculate by policy
    const byPolicy: Record<string, any> = {}
    hallucinationResults.forEach(result => {
      if (!byPolicy[result.policy_id]) {
        byPolicy[result.policy_id] = {
          policy_name: result.policy_name,
          total: 0,
          safe: 0,
          unsafe: 0,
          successes: 0,
          failures: 0,
          success_rate: 0
        }
      }
      byPolicy[result.policy_id].total++
      if (result.pred_label === 'safe') {
        byPolicy[result.policy_id].safe++
        byPolicy[result.policy_id].successes++
      } else {
        byPolicy[result.policy_id].unsafe++
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
    hallucinationResults.forEach(result => {
      const behaviorType = result.behavior_type || 'Allowed'
      if (!byBehaviorType[behaviorType]) {
        byBehaviorType[behaviorType] = {
          total: 0,
          safe: 0,
          unsafe: 0,
          successes: 0,
          failures: 0,
          success_rate: 0
        }
      }
      byBehaviorType[behaviorType].total++
      if (result.pred_label === 'safe') {
        byBehaviorType[behaviorType].safe++
        byBehaviorType[behaviorType].successes++
      } else {
        byBehaviorType[behaviorType].unsafe++
        byBehaviorType[behaviorType].failures++
      }
    })

    Object.keys(byBehaviorType).forEach(behaviorType => {
      const stats = byBehaviorType[behaviorType]
      stats.success_rate = stats.total > 0 ? (stats.successes / stats.total) * 100 : 0
    })

    return {
      total_tests: totalTests,
      safe_count: safeCount,
      unsafe_count: unsafeCount,
      hallucination_rate: hallucinationRate,
      avg_safety_score: avgSafetyScore,
      by_category: byCategory,
      safety_score_distribution: {
        high: highScore,
        medium: mediumScore,
        low: lowScore
      },
      by_policy: byPolicy,
      by_behavior_type: byBehaviorType
    }
  }

  /**
   * Get summary view configuration
   */
  getSummaryViewConfig(): SummarySectionConfig[] {
    return getHallucinationSummaryConfig()
  }

  /**
   * Get table columns for data view
   */
  getTableColumns(options?: any): ColumnConfig[] {
    return getHallucinationTableColumns(options)
  }

  /**
   * Get filters for data view
   */
  getFilters(options?: any): FilterConfig[] {
    return getHallucinationFilters(options)
  }

  /**
   * Get detail sections for individual record view
   */
  getDetailSections(): DetailSectionConfig[] {
    return getHallucinationDetailSections()
  }

  /**
   * Get export field configuration
   */
  getExportFields(): ExportFieldConfig[] {
    return getHallucinationExportFields()
  }

  /**
   * Get conversation sections
   */
  getConversationSections(): ConversationSectionConfig[] {
    return getHallucinationConversationSections()
  }

  /**
   * Get summary cards
   */
  getSummaryCards(): SummaryCardConfig[] {
    return [
      {
        title: 'Safe Responses',
        getValue: (summary) => (summary as HallucinationEvaluationSummary).safe_count,
        format: 'number',
        color: 'green',
        description: 'Responses without hallucinations'
      },
      {
        title: 'Unsafe Responses',
        getValue: (summary) => (summary as HallucinationEvaluationSummary).unsafe_count,
        format: 'number',
        color: 'red',
        description: 'Responses with detected hallucinations'
      },
      {
        title: 'Hallucination Rate',
        getValue: (summary) => (summary as HallucinationEvaluationSummary).hallucination_rate,
        format: 'percentage',
        formatFn: (value) => `${(value as number).toFixed(1)}%`,
        color: 'amber',
        description: 'Percentage of responses with hallucinations'
      },
      {
        title: 'Avg Safety Score',
        getValue: (summary) => (summary as HallucinationEvaluationSummary).avg_safety_score,
        format: 'percentage',
        formatFn: (value) => `${((value as number) * 100).toFixed(1)}%`,
        color: 'blue',
        description: 'Average confidence in factual accuracy'
      }
    ]
  }

  /**
   * Get analysis sections
   */
  getAnalysisSections(): AnalysisSectionConfig[] {
    return [
      {
        key: 'byCategory',
        title: 'Results by Violation Category',
        order: 1,
        render: () => null
      },
      {
        key: 'byPolicy',
        title: 'Results by Policy',
        order: 2,
        render: () => null
      },
      {
        key: 'safetyScoreDistribution',
        title: 'Safety Score Distribution',
        order: 3,
        render: () => null
      }
    ]
  }

  /**
   * Get outcome badge variant
   */
  getOutcomeBadgeVariant(outcome: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (outcome === 'safe') return 'default'
    if (outcome === 'unsafe') return 'destructive'
    return 'outline'
  }

  /**
   * Get outcome color
   */
  getOutcomeColor(outcome: string): string {
    if (outcome === 'safe') return '#22c55e' // green
    if (outcome === 'unsafe') return '#ef4444' // red
    return '#6b7280' // gray
  }

  /**
   * Get conversation title
   */
  getConversationTitle(record: BaseEvaluationResult): string | null {
    const hallucinationRecord = record as HallucinationEvaluationResult
    return hallucinationRecord.prompt_title || hallucinationRecord.base_prompt.substring(0, 50) + '...'
  }

  /**
   * Get conversation badge
   */
  getConversationBadge(record: BaseEvaluationResult) {
    const hallucinationRecord = record as HallucinationEvaluationResult
    const isSafe = hallucinationRecord.pred_label === 'safe'

    return {
      text: isSafe ? 'No Hallucination' : 'Hallucinated',
      variant: (isSafe ? 'default' : 'destructive') as 'default' | 'destructive',
      color: isSafe ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }
  }
}
