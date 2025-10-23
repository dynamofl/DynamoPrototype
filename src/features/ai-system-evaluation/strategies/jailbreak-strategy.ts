// Jailbreak Evaluation Strategy
// Implements the strategy pattern for jailbreak test type

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
import type { JailbreakEvaluationResult, JailbreakEvaluationSummary } from '../types/jailbreak-evaluation'

export class JailbreakStrategy implements EvaluationStrategy {
  readonly testType = 'jailbreak'
  readonly displayName = 'Jailbreak Test'

  /**
   * Transform database records to frontend result format
   */
  transformPrompts(dbRecords: any[]): JailbreakEvaluationResult[] {
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

      // Jailbreak-specific fields
      adversarial_prompt: record.adversarial_prompt,
      attack_type: record.attack_type,
      attack_outcome: record.attack_outcome,

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
  calculateSummary(results: BaseEvaluationResult[]): JailbreakEvaluationSummary {
    const jailbreakResults = results as JailbreakEvaluationResult[]
    const total_tests = jailbreakResults.length
    const blocked_count = jailbreakResults.filter(r => r.attack_outcome === 'Blocked').length
    const failed_count = jailbreakResults.filter(r => r.attack_outcome === 'Failed').length
    const block_rate = total_tests > 0 ? blocked_count / total_tests : 0

    // By policy (using camelCase for backward compatibility with existing components)
    const byPolicy: Record<string, any> = {}
    jailbreakResults.forEach(r => {
      if (!byPolicy[r.policy_id]) {
        byPolicy[r.policy_id] = {
          policyName: r.policy_name,
          total: 0,
          successes: 0,
          failures: 0,
          successRate: 0
        }
      }
      byPolicy[r.policy_id].total++
      if (r.attack_outcome === 'Blocked') {
        byPolicy[r.policy_id].successes++
      } else {
        byPolicy[r.policy_id].failures++
      }
    })

    // Calculate success rates
    Object.values(byPolicy).forEach((policy: any) => {
      policy.successRate = policy.total > 0 ? policy.successes / policy.total : 0
    })

    // By behavior type
    const byBehaviorType: Record<string, any> = {}
    jailbreakResults.forEach(r => {
      const behaviorType = r.behavior_type || 'Unknown'
      if (!byBehaviorType[behaviorType]) {
        byBehaviorType[behaviorType] = {
          total: 0,
          successes: 0,
          failures: 0,
          successRate: 0
        }
      }
      byBehaviorType[behaviorType].total++
      if (r.attack_outcome === 'Blocked') {
        byBehaviorType[behaviorType].successes++
      } else {
        byBehaviorType[behaviorType].failures++
      }
    })

    // Calculate success rates
    Object.values(byBehaviorType).forEach((behavior: any) => {
      behavior.successRate = behavior.total > 0 ? behavior.successes / behavior.total : 0
    })

    // By attack type
    const byAttackType: Record<string, any> = {}
    jailbreakResults.forEach(r => {
      const attackType = r.attack_type || 'None'
      if (!byAttackType[attackType]) {
        byAttackType[attackType] = {
          total: 0,
          blocked: 0,
          failed: 0,
          blockRate: 0
        }
      }
      byAttackType[attackType].total++
      if (r.attack_outcome === 'Blocked') {
        byAttackType[attackType].blocked++
      } else {
        byAttackType[attackType].failed++
      }
    })

    // Calculate block rates
    Object.values(byAttackType).forEach((attack: any) => {
      attack.blockRate = attack.total > 0 ? attack.blocked / attack.total : 0
    })

    return {
      totalTests: total_tests,
      attackSuccesses: failed_count,
      attackFailures: blocked_count,
      successRate: 1 - block_rate,
      byPolicy,
      byBehaviorType,
      byAttackType
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
        key: 'attack_type',
        label: 'Attack Type',
        sortable: true,
        render: (record) => (record as JailbreakEvaluationResult).attack_type || 'None'
      },
      {
        key: 'attack_outcome',
        label: 'Outcome',
        sortable: true,
        render: (record) => (record as JailbreakEvaluationResult).attack_outcome || '-'
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
          { value: 'Blocked', label: 'Blocked' },
          { value: 'Failed', label: 'Failed' }
        ],
        filterFn: (record, value) => {
          if (value === 'all') return true
          return (record as JailbreakEvaluationResult).attack_outcome === value
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
      },
      {
        key: 'attack_type',
        label: 'Attack Type',
        type: 'select',
        filterFn: (record, value) => {
          if (value === 'all') return true
          return (record as JailbreakEvaluationResult).attack_type === value
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
        getValue: (summary) => (summary as JailbreakEvaluationSummary).total_tests,
        format: 'number',
        color: 'gray'
      },
      {
        title: 'Block Rate',
        getValue: (summary) => (summary as JailbreakEvaluationSummary).block_rate,
        format: 'percentage',
        color: 'green'
      },
      {
        title: 'Blocked',
        getValue: (summary) => (summary as JailbreakEvaluationSummary).blocked_count,
        format: 'number',
        color: 'green'
      },
      {
        title: 'Failed',
        getValue: (summary) => (summary as JailbreakEvaluationSummary).failed_count,
        format: 'number',
        color: 'red'
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
          const r = record as JailbreakEvaluationResult
          return `Base Prompt: ${r.base_prompt}\n\nAdversarial Prompt: ${typeof r.adversarial_prompt === 'string' ? r.adversarial_prompt : JSON.stringify(r.adversarial_prompt)}`
        }
      },
      {
        title: 'Attack Information',
        order: 2,
        render: (record) => {
          const r = record as JailbreakEvaluationResult
          return `Attack Type: ${r.attack_type}\nOutcome: ${r.attack_outcome}`
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
          const s = summary as JailbreakEvaluationSummary
          return JSON.stringify(s.by_policy, null, 2)
        }
      },
      {
        key: 'attack_type_breakdown',
        title: 'By Attack Type',
        order: 2,
        render: (summary) => {
          const s = summary as JailbreakEvaluationSummary
          return JSON.stringify(s.by_attack_type, null, 2)
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
      { key: 'attack_type', label: 'Attack Type', getValue: (r) => (r as JailbreakEvaluationResult).attack_type },
      { key: 'attack_outcome', label: 'Outcome', getValue: (r) => (r as JailbreakEvaluationResult).attack_outcome || '' },
      { key: 'base_prompt', label: 'Base Prompt', getValue: (r) => r.base_prompt },
      { key: 'adversarial_prompt', label: 'Adversarial Prompt', getValue: (r) => {
        const adv = (r as JailbreakEvaluationResult).adversarial_prompt
        return typeof adv === 'string' ? adv : JSON.stringify(adv)
      }},
      { key: 'system_response', label: 'AI Response', getValue: (r) => r.system_response || '' }
    ]
  }

  /**
   * Get outcome badge variant
   */
  getOutcomeBadgeVariant(outcome: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (outcome) {
      case 'Blocked':
        return 'default'
      case 'Failed':
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
      case 'Blocked':
        return '#10b981' // green
      case 'Failed':
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  }
}
