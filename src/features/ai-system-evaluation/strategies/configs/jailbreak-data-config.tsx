/**
 * Jailbreak Data View Configuration  
 * Defines table columns, filters, export fields, and conversation/detail sections for jailbreak evaluations
 */

import { MessagesSquare, ShieldBan, ShieldCheck, MessageCircleOff, CircleCheckBig, Zap } from 'lucide-react'
import type {
  ColumnConfig,
  FilterConfig,
  DetailSectionConfig,
  ExportFieldConfig,
  ConversationSectionConfig,
  HighlightingContext
} from '../base-strategy'
import type { BaseEvaluationResult } from '../../types/base-evaluation'
import type { JailbreakEvaluationResult } from '../../types/jailbreak-evaluation'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SeverityIcon } from '../../components/results/severity-icon'
import { getAttackSeverityLevel } from '../../lib/attack-severity'
import { ConversationFeedItem } from '../../components/results/conversation-view-components/conversation-feed-item'

/**
 * Get table columns configuration for jailbreak evaluations
 */
export function getJailbreakTableColumns(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): ColumnConfig[] {
  const { hasInputGuardrails = false, hasOutputGuardrails = false } = options || {}
  const columns: ColumnConfig[] = [
    {
      key: 'basePrompt',
      label: 'Test Conversations',
      className: 'font-450 text-gray-900',
      render: (record) => {
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
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
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
        return (
          <Badge variant="outline" className="text-xs">
            {jailbreakRecord.topic || 'General'}
          </Badge>
        )
      }
    },
    {
      key: 'attackType',
      label: 'Attack Type',
      render: (record) => {
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
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
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
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
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
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
      const jailbreakRecord = record as unknown as JailbreakEvaluationResult
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
      const jailbreakRecord = record as unknown as JailbreakEvaluationResult
      const recordAny = record as any

      // Check if prompt is still pending/running
      const isPending = recordAny.status === 'pending' || recordAny.status === 'running'

      if (isPending) {
        return <Skeleton className="h-6 w-28 rounded-full" />
      }

      const outcome = hasAnyGuardrails
        ? jailbreakRecord.attackOutcome
        : (jailbreakRecord.aiSystemAttackOutcome || jailbreakRecord.attackOutcome)

      return (
        <Badge
          variant="outline"
          className={outcome === 'Attack Success' ? 'text-red-600 border-red-200' : 'text-green-600 border-green-200'}
        >
          {outcome}
        </Badge>
      )
    }
  })

  return columns
}

/**
 * Get filter configurations for jailbreak evaluations
 */
export function getJailbreakFilters(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): FilterConfig[] {
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
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
        return values.includes(jailbreakRecord.attackOutcome)
      }
    },
    
    {
      key: 'attackType',
      label: 'Attack Type',
      type: 'multiselect',
      options: [
        { value: 'Direct Request', label: 'Direct Request' },
        { value: 'Role Play', label: 'Role Play' },
        { value: 'Obfuscation', label: 'Obfuscation' },
        { value: 'Hypothetical', label: 'Hypothetical' },
        { value: 'Jailbreak', label: 'Jailbreak' },
        { value: 'Crescendo', label: 'Crescendo' }
      ],
      filterFn: (record, values) => {
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
        return values.includes(jailbreakRecord.attackType)
      }
    },
    {
      key: 'judgeModelJudgement',
      label: 'Judge Model',
      type: 'multiselect',
      options: [
        { value: 'Answered', label: 'Answered' },
        { value: 'Refused', label: 'Refused' }
      ],
      filterFn: (record, values) => {
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
        const judgement = jailbreakRecord.judgeModelJudgement || jailbreakRecord.modelJudgement
        return values.includes(judgement)
      }
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
      key: 'inputGuardrailJudgement',
      label: 'Input Guardrail',
      type: 'multiselect',
      options: [
        { value: 'Allowed', label: 'Allowed' },
        { value: 'Blocked', label: 'Blocked' }
      ],
      filterFn: (record, values) => {
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
        if (!jailbreakRecord.inputGuardrailJudgement) return false
        return values.includes(jailbreakRecord.inputGuardrailJudgement)
      }
    })
  }

  // Add output guardrail filter if applicable
  if (hasOutputGuardrails) {
    filters.push({
      key: 'outputGuardrailJudgement',
      label: 'Output Guardrail',
      type: 'multiselect',
      options: [
        { value: 'Allowed', label: 'Allowed' },
        { value: 'Blocked', label: 'Blocked' }
      ],
      filterFn: (record, values) => {
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
        if (!jailbreakRecord.outputGuardrailJudgement) return false
        return values.includes(jailbreakRecord.outputGuardrailJudgement)
      }
    })
  }

  return filters
}

/**
 * Get detail sections for individual record view
 */
export function getJailbreakDetailSections(): DetailSectionConfig[] {
  return [
    {
      title: 'Jailbreak Prompt',
      order: 1,
      render: (record) => {
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
        return (
          <div className="bg-gray-50 p-4 rounded">
            {jailbreakRecord.jailbreakPrompt}
          </div>
        )
      }
    },
    {
      title: 'Attack Information',
      order: 2,
      render: (record) => {
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Attack Type:</span>
              <Badge variant="outline">{jailbreakRecord.attackType}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Behavior Type:</span>
              <Badge variant="outline">{jailbreakRecord.behaviorType}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Attack Outcome:</span>
              <Badge variant={jailbreakRecord.attackOutcome === 'Attack Success' ? 'destructive' : 'default'}>
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
 * Get export field configurations for jailbreak evaluations
 */
export function getJailbreakExportFields(): ExportFieldConfig[] {
  return [
    {
      key: 'policyName',
      label: 'Policy Name',
      getValue: (record) => (record as unknown as JailbreakEvaluationResult).policyName,
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
      getValue: (record) => (record as unknown as JailbreakEvaluationResult).behaviorType,
      format: 'string'
    },
    {
      key: 'attackType',
      label: 'Attack Type',
      getValue: (record) => (record as unknown as JailbreakEvaluationResult).attackType,
      format: 'string'
    },
    {
      key: 'basePrompt',
      label: 'Base Prompt',
      getValue: (record) => (record as unknown as JailbreakEvaluationResult).basePrompt,
      format: 'string'
    },
    {
      key: 'jailbreakPrompt',
      label: 'Jailbreak Prompt',
      getValue: (record) => (record as unknown as JailbreakEvaluationResult).jailbreakPrompt,
      format: 'string'
    },
    {
      key: 'systemResponse',
      label: 'System Response',
      getValue: (record) => (record as unknown as JailbreakEvaluationResult).systemResponse || '',
      format: 'string'
    },
    {
      key: 'judgeModelJudgement',
      label: 'Judge Model Judgement',
      getValue: (record) => {
        const jbRecord = record as unknown as JailbreakEvaluationResult
        return jbRecord.judgeModelJudgement || jbRecord.modelJudgement || ''
      },
      format: 'string'
    },
    {
      key: 'attackOutcome',
      label: 'Attack Outcome',
      getValue: (record) => (record as unknown as JailbreakEvaluationResult).attackOutcome,
      format: 'string'
    }
  ]
}

/**
 * Get conversation sections for jailbreak test type
 */
export function getJailbreakConversationSections(): ConversationSectionConfig[] {
  return [
    {
      key: 'basePrompt',
      title: 'Base Prompt',
      order: 1,
      render: (record: BaseEvaluationResult) => {
        const jailbreakRecord = record as unknown as JailbreakEvaluationResult
        const basePromptText = jailbreakRecord.basePrompt || ''

        return (
          <ConversationFeedItem
            title="Base Prompt"
            variant="single-turn"
            content={basePromptText}
            enableMarkdown={false}
            enableHighlight={false}
          />
        )
      }
    },
    {
      key: 'jailbreakPrompt',
      title: 'Jailbreak Prompt',
      order: 2,
      render: (record: BaseEvaluationResult, ctx?: HighlightingContext) => {
        // Access adversarial prompt - it might be stored in different places
        const recordAny = record as any
        const adversarialPrompt = recordAny.adversarialPrompt || recordAny.adversarial_prompt
        const jailbreakPromptText = recordAny.jailbreakPrompt || recordAny.jailbreak_prompt

        // Check if it's a multi-turn conversation
        const isMultiTurn = Array.isArray(adversarialPrompt)

        if (isMultiTurn) {
          return (
            <ConversationFeedItem
              title="Jailbreak Prompt"
              variant="multi-turn"
              content={adversarialPrompt}
              enableMarkdown={false}
              enableHighlight={!!ctx}
              highlightingContext={ctx}
              highlightType="input"
              showHighlightByDefault={true}
            />
          )
        }

        // Single turn
        return (
          <ConversationFeedItem
            title="Jailbreak Prompt"
            variant="single-turn"
            content={jailbreakPromptText || 'No jailbreak prompt'}
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
        // Check if prompt is still pending/running
        const recordAny = record as any
        const isPending = recordAny.status === 'pending' || recordAny.status === 'running'

        // Show skeleton loader if pending
        if (isPending) {
          return (
            <div className="space-y-2">
              <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
                AI System Response
              </h3>
              <div className="px-2 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          )
        }

        // Get system response - it might be a string or AISystemResponse object
        const systemResponseRaw = record.system_response || recordAny.systemResponse

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
