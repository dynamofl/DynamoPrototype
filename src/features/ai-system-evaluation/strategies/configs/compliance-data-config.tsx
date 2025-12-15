/**
 * Compliance Data View Configuration
 * Defines table columns, filters, export fields, and conversation/detail sections for compliance evaluations
 */

import { ShieldBan, ShieldCheck, MessageCircleOff, CircleCheckBig, CheckCircle2, XCircle } from 'lucide-react'
import type {
  ColumnConfig,
  FilterConfig,
  DetailSectionConfig,
  ExportFieldConfig,
  ConversationSectionConfig,
  HighlightingContext
} from '../base-strategy'
import type { BaseEvaluationResult } from '../../types/base-evaluation'
import type { ComplianceEvaluationResult } from '../../types/compliance-evaluation'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConversationFeedItem } from '../../components/results/conversation-view-components/conversation-feed-item'

/**
 * Get table columns configuration for compliance evaluations
 */
export function getComplianceTableColumns(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): ColumnConfig[] {
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
            complianceRecord.ground_truth === 'Compliant'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }>
            {complianceRecord.ground_truth}
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
      const recordAny = record as any

      // Check if prompt is still pending/running
      const isPending = recordAny.status === 'pending' || recordAny.status === 'running'

      if (isPending) {
        return (
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        )
      }

      const judgement = complianceRecord.compliance_judgement || 'Answered'
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
      const recordAny = record as any

      // Check if prompt is still pending/running
      const isPending = recordAny.status === 'pending' || recordAny.status === 'running'

      if (isPending) {
        return <Skeleton className="h-6 w-32 rounded-full" />
      }

      const outcome = complianceRecord.final_outcome

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
 * Get filter configurations for compliance evaluations
 */
export function getComplianceFilters(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): FilterConfig[] {
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
        return values.includes(complianceRecord.final_outcome)
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
        return values.includes(complianceRecord.ground_truth)
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
        const perturbationType = complianceRecord.perturbation_type || 'None'
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
 * Get detail sections for individual record view
 */
export function getComplianceDetailSections(): DetailSectionConfig[] {
  return [
    {
      title: 'Actual Prompt',
      order: 1,
      render: (record) => {
        const complianceRecord = record as ComplianceEvaluationResult
        return (
          <div className="space-y-2">
            <div className="bg-gray-50 p-4 rounded">
              {complianceRecord.actual_prompt}
            </div>
            {complianceRecord.perturbation_type && (
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Perturbation Applied:</span>
                <Badge>{complianceRecord.perturbation_type}</Badge>
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
                complianceRecord.ground_truth === 'Compliant'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }>
                {complianceRecord.ground_truth}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Actual Outcome:</span>
              <Badge
                variant={
                  complianceRecord.final_outcome === 'TP' || complianceRecord.final_outcome === 'TN'
                    ? 'default'
                    : 'destructive'
                }
              >
                {complianceRecord.final_outcome}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Behavior Type:</span>
              <Badge variant="secondary">{complianceRecord.behavior_type}</Badge>
            </div>
            {complianceRecord.behavior_used && (
              <div className="text-sm">
                <span className="font-medium">Behavior Used:</span>
                <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                  {complianceRecord.behavior_used}
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
        if (!complianceRecord.perturbation_type) return null

        return (
          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium">Base Prompt:</span>
              <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                {complianceRecord.base_prompt}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium">Perturbed Prompt ({complianceRecord.perturbation_type}):</span>
              <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                {complianceRecord.actual_prompt}
              </div>
            </div>
          </div>
        )
      },
      condition: (record) => {
        const complianceRecord = record as ComplianceEvaluationResult
        return !!complianceRecord.perturbation_type
      }
    }
  ]
}

/**
 * Get export field configurations for compliance evaluations
 */
export function getComplianceExportFields(): ExportFieldConfig[] {
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
      getValue: (record) => (record as ComplianceEvaluationResult).actual_prompt,
      format: 'string'
    },
    {
      key: 'groundTruth',
      label: 'Ground Truth',
      getValue: (record) => (record as ComplianceEvaluationResult).ground_truth,
      format: 'string'
    },
    {
      key: 'systemResponse',
      label: 'System Response',
      getValue: (record) => {
        const response = record.system_response
        return typeof response === 'string' ? response : (response?.content || '')
      },
      format: 'string'
    },
    {
      key: 'aiSystemJudgement',
      label: 'AI System Judgement',
      getValue: (record) => (record as ComplianceEvaluationResult).compliance_judgement || 'Answered',
      format: 'string'
    },
    {
      key: 'finalOutcome',
      label: 'Final Outcome',
      getValue: (record) => {
        const outcome = (record as ComplianceEvaluationResult).final_outcome
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
 * Get conversation sections for compliance test type
 */
export function getComplianceConversationSections(): ConversationSectionConfig[] {
  return [
    {
      key: 'basePrompt',
      title: 'Base Prompt',
      order: 1,
      render: (record: BaseEvaluationResult) => {
        const complianceRecord = record as ComplianceEvaluationResult
        return (
          <ConversationFeedItem
            title="Base Prompt"
            variant="single-turn"
            content={complianceRecord.base_prompt}
            enableMarkdown={false}
            enableHighlight={false}
          />
        )
      }
    },
    {
      key: 'actualPrompt',
      title: 'Actual Prompt',
      order: 2,
      render: (record: BaseEvaluationResult, ctx?: HighlightingContext) => {
        const complianceRecord = record as ComplianceEvaluationResult
        const subtitle = complianceRecord.perturbation_type
          ? `(${complianceRecord.perturbation_type})`
          : undefined

        return (
          <ConversationFeedItem
            title="Actual Prompt"
            subtitle={subtitle}
            variant="single-turn"
            content={(complianceRecord as any).actual_prompt}
            enableMarkdown={false}
            enableHighlight={!!ctx}
            highlightingContext={ctx}
            highlightType="input"
            showHighlightByDefault={true}
          />
        )
      }
    },
    {
      key: 'systemResponse',
      title: 'AI System Response',
      order: 3,
      render: (record: BaseEvaluationResult, ctx?: HighlightingContext) => {
        const complianceRecord = record as ComplianceEvaluationResult

        // Get system response - it might be a string or AISystemResponse object
        const recordAny = complianceRecord as any
        const systemResponseRaw = recordAny.system_response || recordAny.systemResponse

        // Extract content string from response
        let responseContent = 'No response'
        if (typeof systemResponseRaw === 'string') {
          responseContent = systemResponseRaw
        } else if (systemResponseRaw && typeof systemResponseRaw === 'object' && systemResponseRaw.content) {
          responseContent = systemResponseRaw.content
        }

        return (
          <ConversationFeedItem
            title="AI System Response"
            variant="single-turn"
            content={responseContent}
            enableMarkdown={true}
            enableHighlight={!!ctx}
            highlightingContext={ctx}
            highlightType="output"
            showHighlightByDefault={true}
          />
        )
      }
    }
  ]
}
