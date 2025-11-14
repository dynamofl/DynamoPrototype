// Jailbreak Strategy Implementation
// Implements EvaluationStrategy interface for jailbreak test type

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
import type { BaseEvaluationResult, BaseEvaluationSummary } from '../types/base-evaluation'
import type {
  JailbreakEvaluationResult,
  JailbreakEvaluationSummary,
  AttackType,
  AdversarialPrompt
} from '../types/jailbreak-evaluation'
import { calculateSummaryFromResults } from '../lib/calculate-summary'

// Import configuration functions
import { getJailbreakSummaryConfig } from './configs/jailbreak-summary-config'
import {
  getJailbreakTableColumns,
  getJailbreakFilters,
  getJailbreakDetailSections,
  getJailbreakExportFields,
  getJailbreakConversationSections
} from './configs/jailbreak-data-config'

export class JailbreakStrategy implements EvaluationStrategy {
  readonly testType = 'jailbreak'
  readonly displayName = 'Jailbreak'

  /**
   * Transform database records to frontend result format
   */
  transformPrompts(dbRecords: any[]): BaseEvaluationResult[] {
    const transformed = dbRecords.map(record => {
      // Check if already transformed (has camelCase properties)
      if ('basePrompt' in record && 'behaviorType' in record && 'attackType' in record) {
        const result = record as JailbreakEvaluationResult
        // Ensure jailbreakPrompt is set even for already-transformed records
        if (!result.jailbreakPrompt) {
          const adversarialPrompt = result.adversarialPrompt
          result.jailbreakPrompt = Array.isArray(adversarialPrompt)
            ? adversarialPrompt.map((turn: any) => `${turn.role}: ${turn.content}`).join('\n\n')
            : adversarialPrompt?.text || ''
        }
        return result
      }

      // Transform snake_case DB record to camelCase
      const adversarialPrompt = record.adversarial_prompt as AdversarialPrompt
      // Extract jailbreak prompt text from adversarialPrompt
      const jailbreakPrompt = Array.isArray(adversarialPrompt)
        ? adversarialPrompt.map((turn: any) => `${turn.role}: ${turn.content}`).join('\n\n')
        : adversarialPrompt?.text || ''

      return {
        id: record.id,
        evaluationId: record.evaluation_id,
        promptIndex: record.prompt_index,
        policyId: record.policy_id,
        policyName: record.policy_name,
        topic: record.topic,
        promptTitle: record.prompt_title,
        policyContext: record.policy_context,
        behaviorType: record.behavior_type,
        basePrompt: record.base_prompt,
        attackType: record.attack_type as AttackType,
        adversarialPrompt,
        jailbreakPrompt,
        systemResponse: record.ai_system_response?.content || record.system_response || '',
        system_response: record.ai_system_response || record.system_response,

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
    return transformed as unknown as BaseEvaluationResult[]
  }

  /**
   * Calculate summary metrics from results
   */
  calculateSummary(results: BaseEvaluationResult[]): BaseEvaluationSummary {
    return calculateSummaryFromResults(results as unknown as JailbreakEvaluationResult[]) as BaseEvaluationSummary
  }

  /**
   * Data View Configuration - Delegates to config file
   */
  getTableColumns(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): ColumnConfig[] {
    return getJailbreakTableColumns(options)
  }

  getFilters(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): FilterConfig[] {
    return getJailbreakFilters(options)
  }

  getDetailSections(): DetailSectionConfig[] {
    return getJailbreakDetailSections()
  }

  getExportFields(): ExportFieldConfig[] {
    return getJailbreakExportFields()
  }

  getConversationSections(): ConversationSectionConfig[] {
    return getJailbreakConversationSections()
  }

  /**
   * Summary View Configuration - Delegates to config file
   */
  getSummaryViewConfig(): SummarySectionConfig[] {
    return getJailbreakSummaryConfig()
  }

  /**
   * Summary Cards Configuration - Used by generic summary components
   */
  getSummaryCards(): SummaryCardConfig[] {
    return [
      {
        title: 'Total Tests',
        getValue: (summary) => (summary as JailbreakEvaluationSummary).totalTests ?? 0,
        format: 'number',
        color: 'blue',
        description: 'Total number of jailbreak attempts'
      },
      {
        title: 'Attack Success Rate',
        getValue: (summary) => (summary as JailbreakEvaluationSummary).successRate ?? 0,
        format: 'percentage',
        color: 'red',
        description: 'Percentage of successful attacks'
      },
      {
        title: 'Attack Failures',
        getValue: (summary) => (summary as JailbreakEvaluationSummary).attackFailures ?? 0,
        format: 'number',
        color: 'green',
        description: 'Number of failed attacks'
      },
      {
        title: 'Attack Successes',
        getValue: (summary) => (summary as JailbreakEvaluationSummary).attackSuccesses ?? 0,
        format: 'number',
        color: 'red',
        description: 'Number of successful attacks'
      }
    ]
  }

  /**
   * Analysis Sections Configuration
   */
  getAnalysisSections(): AnalysisSectionConfig[] {
    return [
      {
        key: 'byPolicy',
        title: 'Attack Success by Policy',
        order: 1,
        render: () => null
      },
      {
        key: 'byAttackType',
        title: 'Attack Success by Attack Type',
        order: 2,
        render: () => null
      },
      {
        key: 'byBehaviorType',
        title: 'Attack Success by Behavior Type',
        order: 3,
        render: () => null
      }
    ]
  }

  /**
   * Utility Methods
   */
  getOutcomeBadgeVariant(outcome: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    if (outcome === 'Attack Failure') return 'default'
    if (outcome === 'Attack Success') return 'destructive'
    return 'outline'
  }

  getOutcomeColor(outcome: string): string {
    if (outcome === 'Attack Failure') return '#22c55e' // green
    if (outcome === 'Attack Success') return '#ef4444' // red
    return '#6b7280' // gray
  }

  getConversationTitle(record: BaseEvaluationResult): string | null {
    const jailbreakRecord = record as unknown as JailbreakEvaluationResult
    return jailbreakRecord.promptTitle || null
  }

  getConversationBadge(record: BaseEvaluationResult) {
    const jailbreakRecord = record as unknown as JailbreakEvaluationResult
    const isAttackSuccess = jailbreakRecord.attackOutcome === 'Attack Success'

    return {
      text: jailbreakRecord.attackOutcome,
      variant: (isAttackSuccess ? 'destructive' : 'default') as 'default' | 'destructive',
      color: isAttackSuccess ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
    }
  }
}
