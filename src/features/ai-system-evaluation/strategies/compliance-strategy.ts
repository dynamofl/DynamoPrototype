// Compliance Evaluation Strategy
// Implements the strategy pattern for compliance test type

import type {
  EvaluationStrategy,
  ColumnConfig,
  FilterConfig,
  SummaryCardConfig,
  DetailSectionConfig,
  AnalysisSectionConfig,
  ExportFieldConfig
} from './base-strategy'
import type { BaseEvaluationResult, BaseEvaluationSummary } from '../types/base-evaluation'
import type { ComplianceEvaluationResult, ComplianceEvaluationSummary } from '../types/compliance-evaluation'

export class ComplianceStrategy implements EvaluationStrategy {
  readonly testType = 'compliance'
  readonly displayName = 'Compliance Test'

  /**
   * Transform database records to frontend result format
   */
  transformPrompts(dbRecords: any[]): ComplianceEvaluationResult[] {
    return dbRecords.map(record => ({
      // Base fields
      id: record.id,
      evaluation_id: record.evaluation_id,
      prompt_index: record.prompt_index,
      policy_id: record.policy_id,
      policy_name: record.policy_name,
      topic: record.topic,
      prompt_title: record.prompt_title,
      policy_context: record.policy_context,
      base_prompt: record.base_prompt,
      behavior_type: record.behavior_type,
      status: record.status,
      created_at: record.created_at,
      started_at: record.started_at,
      completed_at: record.completed_at,
      error_message: record.error_message,
      runtime_ms: record.runtime_ms,

      // Compliance-specific fields
      actual_prompt: record.actual_prompt,
      perturbation_type: record.perturbation_type,
      ground_truth: record.ground_truth,
      behavior_used: record.behavior_used,
      behavior_phrases: record.behavior_phrases,
      compliance_judgement: record.compliance_judgement,
      final_outcome: record.final_outcome,

      // AI response
      system_response: record.ai_system_response?.message || record.system_response,

      // Guardrail fields
      input_guardrail_judgement: record.input_guardrail?.judgement,
      input_guardrail_reason: record.input_guardrail?.reason,
      input_guardrail_details: record.input_guardrail?.details,
      output_guardrail_judgement: record.output_guardrail?.judgement,
      output_guardrail_reason: record.output_guardrail?.reason,
      output_guardrail_details: record.output_guardrail?.details,

      // Performance metrics
      input_tokens: record.ai_system_response?.input_tokens,
      output_tokens: record.ai_system_response?.output_tokens,
      total_tokens: record.ai_system_response?.total_tokens
    }))
  }

  /**
   * Calculate summary metrics from results
   */
  calculateSummary(results: BaseEvaluationResult[]): ComplianceEvaluationSummary {
    const complianceResults = results as ComplianceEvaluationResult[]
    const total_tests = complianceResults.length

    // Count outcomes
    const tp = complianceResults.filter(r => r.final_outcome === 'TP').length
    const tn = complianceResults.filter(r => r.final_outcome === 'TN').length
    const fp = complianceResults.filter(r => r.final_outcome === 'FP').length
    const fn = complianceResults.filter(r => r.final_outcome === 'FN').length

    // Calculate metrics
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0
    const f1_score = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0
    const accuracy = total_tests > 0 ? (tp + tn) / total_tests : 0

    // By policy (using camelCase for shared component compatibility)
    const by_policy: Record<string, any> = {}
    complianceResults.forEach(r => {
      if (!by_policy[r.policy_id]) {
        by_policy[r.policy_id] = {
          policyName: r.policy_name,
          total: 0,
          successes: 0,
          failures: 0,
          successRate: 0
        }
      }
      by_policy[r.policy_id].total++
      if (r.final_outcome === 'TP' || r.final_outcome === 'TN') {
        by_policy[r.policy_id].successes++
      } else {
        by_policy[r.policy_id].failures++
      }
    })

    // Calculate success rates
    Object.values(by_policy).forEach((policy: any) => {
      policy.successRate = policy.total > 0 ? policy.successes / policy.total : 0
    })

    // By behavior type (using camelCase for shared component compatibility)
    const by_behavior_type: Record<string, any> = {}
    complianceResults.forEach(r => {
      const behaviorType = r.behavior_type || 'Unknown'
      if (!by_behavior_type[behaviorType]) {
        by_behavior_type[behaviorType] = {
          total: 0,
          successes: 0,
          failures: 0,
          successRate: 0
        }
      }
      by_behavior_type[behaviorType].total++
      if (r.final_outcome === 'TP' || r.final_outcome === 'TN') {
        by_behavior_type[behaviorType].successes++
      } else {
        by_behavior_type[behaviorType].failures++
      }
    })

    // Calculate success rates
    Object.values(by_behavior_type).forEach((behavior: any) => {
      behavior.successRate = behavior.total > 0 ? behavior.successes / behavior.total : 0
    })

    // By perturbation type
    const by_perturbation_type: Record<string, any> = {}
    complianceResults.forEach(r => {
      const perturbationType = r.perturbation_type || 'None'
      if (!by_perturbation_type[perturbationType]) {
        by_perturbation_type[perturbationType] = {
          perturbation_type: perturbationType,
          total: 0,
          tp: 0,
          tn: 0,
          fp: 0,
          fn: 0,
          accuracy: 0
        }
      }
      by_perturbation_type[perturbationType].total++
      if (r.final_outcome === 'TP') by_perturbation_type[perturbationType].tp++
      if (r.final_outcome === 'TN') by_perturbation_type[perturbationType].tn++
      if (r.final_outcome === 'FP') by_perturbation_type[perturbationType].fp++
      if (r.final_outcome === 'FN') by_perturbation_type[perturbationType].fn++
    })

    // Calculate accuracy per perturbation
    Object.values(by_perturbation_type).forEach((pert: any) => {
      pert.accuracy = pert.total > 0 ? (pert.tp + pert.tn) / pert.total : 0
    })

    // By ground truth
    const by_ground_truth: Record<'Compliant' | 'Non-Compliant', any> = {
      'Compliant': { total: 0, tp: 0, tn: 0, fp: 0, fn: 0 },
      'Non-Compliant': { total: 0, tp: 0, tn: 0, fp: 0, fn: 0 }
    }

    complianceResults.forEach(r => {
      by_ground_truth[r.ground_truth].total++
      if (r.final_outcome === 'TP') by_ground_truth[r.ground_truth].tp++
      if (r.final_outcome === 'TN') by_ground_truth[r.ground_truth].tn++
      if (r.final_outcome === 'FP') by_ground_truth[r.ground_truth].fp++
      if (r.final_outcome === 'FN') by_ground_truth[r.ground_truth].fn++
    })

    return {
      total_tests,
      tp,
      tn,
      fp,
      fn,
      precision,
      recall,
      f1_score,
      accuracy,
      by_policy,
      by_behavior_type,
      by_perturbation_type,
      by_ground_truth
    }
  }

  /**
   * Get table columns configuration
   */
  getTableColumns(hasGuardrails?: boolean): ColumnConfig[] {
    const columns: ColumnConfig[] = [
      {
        key: 'prompt_index',
        label: '#',
        width: '60px',
        sortable: true,
        render: (record) => record.prompt_index + 1
      },
      {
        key: 'base_prompt',
        label: 'Test Conversations',
        sortable: true,
        className: 'font-450 text-gray-900',
        render: (record) => record.base_prompt
      },
      {
        key: 'topic',
        label: 'Topic',
        sortable: true,
        render: (record) => record.topic || '-'
      },
      {
        key: 'ground_truth',
        label: 'Expected',
        sortable: true,
        render: (record) => (record as ComplianceEvaluationResult).ground_truth
      },
      {
        key: 'perturbation_type',
        label: 'Perturbation',
        sortable: true,
        render: (record) => (record as ComplianceEvaluationResult).perturbation_type || 'None'
      },
      {
        key: 'final_outcome',
        label: 'Outcome',
        sortable: true,
        render: (record) => (record as ComplianceEvaluationResult).final_outcome || '-'
      }
    ]

    return columns
  }

  /**
   * Get filter configurations
   */
  getFilters(hasGuardrails?: boolean): FilterConfig[] {
    return [
      {
        key: 'outcome',
        label: 'Outcome',
        type: 'select',
        options: [
          { value: 'all', label: 'All' },
          { value: 'TP', label: 'TP (True Positive)' },
          { value: 'TN', label: 'TN (True Negative)' },
          { value: 'FP', label: 'FP (False Positive)' },
          { value: 'FN', label: 'FN (False Negative)' }
        ],
        filterFn: (record, value) => {
          if (value === 'all') return true
          return (record as ComplianceEvaluationResult).final_outcome === value
        }
      },
      {
        key: 'ground_truth',
        label: 'Expected',
        type: 'select',
        options: [
          { value: 'all', label: 'All' },
          { value: 'Compliant', label: 'Compliant' },
          { value: 'Non-Compliant', label: 'Non-Compliant' }
        ],
        filterFn: (record, value) => {
          if (value === 'all') return true
          return (record as ComplianceEvaluationResult).ground_truth === value
        }
      },
      {
        key: 'perturbation',
        label: 'Perturbation',
        type: 'select',
        filterFn: (record, value) => {
          if (value === 'all') return true
          const perturbation = (record as ComplianceEvaluationResult).perturbation_type || 'None'
          return perturbation === value
        }
      },
      {
        key: 'policy',
        label: 'Policy',
        type: 'select',
        filterFn: (record, value) => {
          if (value === 'all') return true
          return record.policy_id === value
        }
      }
    ]
  }

  /**
   * Get summary cards configuration
   */
  getSummaryCards(): SummaryCardConfig[] {
    return [
      {
        title: 'Total Tests',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).total_tests,
        format: 'number',
        color: 'gray'
      },
      {
        title: 'Accuracy',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).accuracy,
        format: 'percentage',
        color: 'green'
      },
      {
        title: 'F1 Score',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).f1_score,
        format: 'percentage',
        color: 'green'
      },
      {
        title: 'Precision',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).precision,
        format: 'percentage',
        color: 'amber'
      },
      {
        title: 'Recall',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).recall,
        format: 'percentage',
        color: 'amber'
      },
      {
        title: 'True Positives',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).tp,
        format: 'number',
        color: 'green',
        description: 'Correctly allowed'
      },
      {
        title: 'True Negatives',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).tn,
        format: 'number',
        color: 'green',
        description: 'Correctly blocked'
      },
      {
        title: 'False Positives',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).fp,
        format: 'number',
        color: 'red',
        description: 'Incorrectly blocked'
      },
      {
        title: 'False Negatives',
        getValue: (summary) => (summary as ComplianceEvaluationSummary).fn,
        format: 'number',
        color: 'red',
        description: 'Incorrectly allowed'
      }
    ]
  }

  /**
   * Get detail sections configuration
   */
  getDetailSections(): DetailSectionConfig[] {
    return [
      {
        title: 'Prompt Details',
        order: 1,
        render: (record) => {
          const r = record as ComplianceEvaluationResult
          return `Base Prompt: ${r.base_prompt}\n\nActual Prompt: ${r.actual_prompt}\n\nPerturbation: ${r.perturbation_type || 'None'}`
        }
      },
      {
        title: 'Ground Truth',
        order: 2,
        render: (record) => {
          const r = record as ComplianceEvaluationResult
          return `Expected: ${r.ground_truth}\nBehavior Type: ${r.behavior_type}\nBehavior Used: ${r.behavior_used || 'N/A'}`
        }
      },
      {
        title: 'Outcome',
        order: 3,
        render: (record) => {
          const r = record as ComplianceEvaluationResult
          const outcomeLabels = {
            'TP': 'True Positive (Correctly Allowed)',
            'TN': 'True Negative (Correctly Blocked)',
            'FP': 'False Positive (Incorrectly Blocked)',
            'FN': 'False Negative (Incorrectly Allowed)'
          }
          return `Final Outcome: ${r.final_outcome} - ${outcomeLabels[r.final_outcome]}`
        }
      }
    ]
  }

  /**
   * Get analysis sections configuration
   */
  getAnalysisSections(): AnalysisSectionConfig[] {
    return [
      {
        key: 'policy_breakdown',
        title: 'By Policy',
        order: 1,
        render: (summary) => {
          const s = summary as ComplianceEvaluationSummary
          return JSON.stringify(s.by_policy, null, 2)
        }
      },
      {
        key: 'perturbation_breakdown',
        title: 'By Perturbation Type',
        order: 2,
        render: (summary) => {
          const s = summary as ComplianceEvaluationSummary
          return JSON.stringify(s.by_perturbation_type, null, 2)
        },
        condition: (summary) => {
          const s = summary as ComplianceEvaluationSummary
          return !!s.by_perturbation_type && Object.keys(s.by_perturbation_type).length > 0
        }
      },
      {
        key: 'ground_truth_breakdown',
        title: 'By Expected Outcome',
        order: 3,
        render: (summary) => {
          const s = summary as ComplianceEvaluationSummary
          return JSON.stringify(s.by_ground_truth, null, 2)
        }
      }
    ]
  }

  /**
   * Get export fields configuration
   */
  getExportFields(): ExportFieldConfig[] {
    return [
      { key: 'prompt_index', label: 'Index', getValue: (r) => r.prompt_index },
      { key: 'policy_name', label: 'Policy', getValue: (r) => r.policy_name },
      { key: 'topic', label: 'Topic', getValue: (r) => r.topic || '' },
      { key: 'ground_truth', label: 'Expected', getValue: (r) => (r as ComplianceEvaluationResult).ground_truth },
      { key: 'perturbation_type', label: 'Perturbation', getValue: (r) => (r as ComplianceEvaluationResult).perturbation_type || 'None' },
      { key: 'final_outcome', label: 'Outcome', getValue: (r) => (r as ComplianceEvaluationResult).final_outcome || '' },
      { key: 'base_prompt', label: 'Base Prompt', getValue: (r) => r.base_prompt },
      { key: 'actual_prompt', label: 'Actual Prompt', getValue: (r) => (r as ComplianceEvaluationResult).actual_prompt },
      { key: 'behavior_used', label: 'Behavior Used', getValue: (r) => (r as ComplianceEvaluationResult).behavior_used || '' },
      { key: 'system_response', label: 'AI Response', getValue: (r) => r.system_response || '' }
    ]
  }

  /**
   * Get outcome badge variant
   */
  getOutcomeBadgeVariant(outcome: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (outcome) {
      case 'TP':
      case 'TN':
        return 'default'
      case 'FP':
      case 'FN':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  /**
   * Get outcome color for charts
   */
  getOutcomeColor(outcome: string): string {
    switch (outcome) {
      case 'TP':
        return '#10b981' // green
      case 'TN':
        return '#3b82f6' // blue
      case 'FP':
        return '#f59e0b' // amber
      case 'FN':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  }
}
