/**
 * Hallucination Data View Configuration
 * Defines table columns, filters, export fields, and conversation/detail sections for hallucination evaluations
 */

import { AlertCircle, CheckCircle2, BookOpen, MessageSquare } from 'lucide-react'
import type {
  ColumnConfig,
  FilterConfig,
  DetailSectionConfig,
  ExportFieldConfig,
  ConversationSectionConfig,
  HighlightingContext
} from '../base-strategy'
import type { BaseEvaluationResult } from '../../types/base-evaluation'
import type { HallucinationEvaluationResult } from '../../types/hallucination-evaluation'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ConversationFeedItem } from '../../components/results/conversation-view-components/conversation-feed-item'

/**
 * Get table columns configuration for hallucination evaluations
 */
export function getHallucinationTableColumns(options?: any): ColumnConfig[] {
  const columns: ColumnConfig[] = [
    {
      key: 'basePrompt',
      label: 'Conversation',
      className: 'font-450 text-gray-900',
      render: (record) => (
        <div className="truncate max-w-md group-hover:underline" title={record.base_prompt}>
          {record.base_prompt}
        </div>
      )
    },
    {
      key: 'predLabel',
      label: 'Prediction',
      render: (record) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        const isSafe = hallucinationRecord.pred_label === 'safe'

        // Extract category title (part before colon)
        const violatedCategory = hallucinationRecord.violated_category || 'N/A'
        const categoryTitle = violatedCategory.split(':')[0].trim()

        const displayText = isSafe ? 'No Hallucination' : categoryTitle

        return (
          <div className="flex items-center gap-2">
            {isSafe ?
              <CheckCircle2 className="w-4 h-4 text-green-600" /> :
              <AlertCircle className="w-4 h-4 text-red-600" />
            }
            <span>
              {displayText}
            </span>
          </div>
        )
      }
    },
    {
      key: 'safetyScore',
      label: 'Safety Score',
      render: (record) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        const score = hallucinationRecord.safety_score
        const percentage = score * 100

        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            <Progress value={percentage} className="h-2 w-16" />
            <span className="text-sm font-medium text-gray-700">
              {percentage.toFixed(1)}%
            </span>
          </div>
        )
      }
    }
  ]

  return columns
}

/**
 * Get filters configuration for hallucination evaluations
 */
export function getHallucinationFilters(options?: any): FilterConfig[] {
  return [
    {
      key: 'violated_category',
      label: 'Predictions',
      type: 'multiselect',
      options: [
        { value: 'N/A', label: 'N/A' },
        { value: 'Citation / Attribution Errors', label: 'Citation / Attribution Errors' },
        { value: 'Entity Inaccuracies', label: 'Entity Inaccuracies' },
        { value: 'Context contradictions', label: 'Context Contradictions' }
      ],
      filterFn: (record, values) => {
        if (!values || values.length === 0) return true
        const hallucinationRecord = record as HallucinationEvaluationResult
        // Extract category title (part before colon) to match filter values
        const categoryTitle = (hallucinationRecord.violated_category || 'N/A').split(':')[0].trim()
        return values.includes(categoryTitle)
      }
    },
    {
      key: 'safety_score_range',
      label: 'Safety Score Range',
      type: 'select',
      options: [
        { value: 'all', label: 'All' },
        { value: 'high', label: 'High (≥ 80%)' },
        { value: 'medium', label: 'Medium (50-80%)' },
        { value: 'low', label: 'Low (< 50%)' }
      ],
      filterFn: (record, value) => {
        if (!value || value === 'all') return true
        const hallucinationRecord = record as HallucinationEvaluationResult

        // Get safety score as percentage (0-100)
        const safetyScore = hallucinationRecord.safety_score
        if (safetyScore == null) return false // Exclude null/undefined scores from filtered results

        const percentage = safetyScore * 100

        if (value === 'high') return percentage >= 80
        if (value === 'medium') return percentage >= 50 && percentage < 80
        if (value === 'low') return percentage < 50
        return true
      }
    }
  ]
}

/**
 * Get detail sections configuration for individual record view
 */
export function getHallucinationDetailSections(): DetailSectionConfig[] {
  return [
    {
      title: 'Prompt Details',
      order: 1,
      render: (record) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        return (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">Base Prompt</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                {hallucinationRecord.base_prompt}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Reference Context</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm max-h-48 overflow-y-auto">
                {hallucinationRecord.context}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">AI Response</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                {hallucinationRecord.response}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      title: 'Evaluation Results',
      order: 2,
      render: (record) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Prediction Label</span>
              <Badge variant={hallucinationRecord.pred_label === 'safe' ? 'default' : 'destructive'}>
                {hallucinationRecord.pred_label === 'safe' ? 'Safe' : 'Unsafe'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Violated Category</span>
              <Badge variant="outline">
                {hallucinationRecord.violated_category}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Safety Score</span>
              <span className="text-sm font-medium">
                {(hallucinationRecord.safety_score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )
      }
    }
  ]
}

/**
 * Get export field configuration
 */
export function getHallucinationExportFields(): ExportFieldConfig[] {
  return [
    {
      key: 'base_prompt',
      label: 'Prompt',
      getValue: (record) => (record as HallucinationEvaluationResult).base_prompt || '',
      format: 'string'
    },
    {
      key: 'context',
      label: 'Context',
      getValue: (record) => (record as HallucinationEvaluationResult).context || '',
      format: 'string'
    },
    {
      key: 'response',
      label: 'Response',
      getValue: (record) => (record as HallucinationEvaluationResult).response || '',
      format: 'string'
    },
    {
      key: 'pred_label',
      label: 'Prediction',
      getValue: (record) => (record as HallucinationEvaluationResult).pred_label || '',
      format: 'string'
    },
    {
      key: 'violated_category',
      label: 'Violated Category',
      getValue: (record) => (record as HallucinationEvaluationResult).violated_category || '',
      format: 'string'
    },
    {
      key: 'safety_score',
      label: 'Safety Score',
      getValue: (record) => (record as HallucinationEvaluationResult).safety_score || 0,
      format: 'number'
    },
    {
      key: 'topic',
      label: 'Topic',
      getValue: (record) => record.topic || '',
      format: 'string'
    },
    {
      key: 'policy_name',
      label: 'Policy',
      getValue: (record) => record.policy_name || '',
      format: 'string'
    }
  ]
}

/**
 * Get conversation sections configuration
 */
export function getHallucinationConversationSections(): ConversationSectionConfig[] {
  return [
    {
      key: 'prompt',
      title: 'Base Prompt',
      order: 1,
      render: (record, highlightingContext) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        return (
          <ConversationFeedItem
            title="Base Prompt"
            variant="single-turn"
            content={hallucinationRecord.base_prompt || ''}
            enableMarkdown={false}
            enableHighlight={false}
          />
        )
      }
    },
    {
      key: 'context',
      title: 'Retrieved Context',
      order: 2,
      render: (record, highlightingContext) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        return (
          <ConversationFeedItem
            title="Retrieved Context"
            variant="single-turn"
            content={hallucinationRecord.context || ''}
            enableMarkdown={false}
            enableHighlight={false}
            enableReadMore={true}
          />
        )
      }
    },
    {
      key: 'response',
      title: 'AI System Response',
      order: 3,
      render: (record, highlightingContext) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        return (
          <ConversationFeedItem
            title="AI System Response"
            variant="single-turn"
            content={hallucinationRecord.response || ''}
            enableMarkdown={false}
            enableHighlight={false}
          />
        )
      }
    }
  ]
}
