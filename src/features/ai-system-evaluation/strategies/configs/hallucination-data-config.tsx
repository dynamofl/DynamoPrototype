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

/**
 * Get table columns configuration for hallucination evaluations
 */
export function getHallucinationTableColumns(options?: any): ColumnConfig[] {
  const columns: ColumnConfig[] = [
    {
      key: 'basePrompt',
      label: 'Prompt',
      className: 'font-450 text-gray-900',
      render: (record) => (
        <div className="truncate max-w-md group-hover:underline" title={record.base_prompt}>
          {record.base_prompt}
        </div>
      )
    },
    {
      key: 'context',
      label: 'Context',
      render: (record) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        const contextPreview = hallucinationRecord.context.substring(0, 100)
        return (
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-600 truncate" title={hallucinationRecord.context}>
              {contextPreview}{hallucinationRecord.context.length > 100 ? '...' : ''}
            </span>
          </div>
        )
      }
    },
    {
      key: 'response',
      label: 'Response',
      render: (record) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        const responsePreview = hallucinationRecord.response.substring(0, 100)
        return (
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-600 truncate" title={hallucinationRecord.response}>
              {responsePreview}{hallucinationRecord.response.length > 100 ? '...' : ''}
            </span>
          </div>
        )
      }
    },
    {
      key: 'predLabel',
      label: 'Prediction',
      render: (record) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        const isSafe = hallucinationRecord.pred_label === 'safe'
        return (
          <div className="flex items-center gap-2">
            {isSafe ?
              <CheckCircle2 className="w-4 h-4 text-green-600" /> :
              <AlertCircle className="w-4 h-4 text-red-600" />
            }
            <Badge variant={isSafe ? 'default' : 'destructive'} className="text-xs">
              {isSafe ? 'Safe' : 'Unsafe'}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'violatedCategory',
      label: 'Category',
      render: (record) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        const category = hallucinationRecord.violated_category

        // Color coding by category type
        let badgeColor = 'bg-gray-50 text-gray-700 border-gray-200'
        if (category === 'Citation / Attribution Errors') {
          badgeColor = 'bg-amber-50 text-amber-800 border-amber-200'
        } else if (category === 'Entity Inaccuracies') {
          badgeColor = 'bg-red-50 text-red-800 border-red-200'
        } else if (category === 'Context contradictions') {
          badgeColor = 'bg-red-50 text-red-800 border-red-200'
        }

        return (
          <Badge variant="outline" className={`text-xs ${badgeColor}`}>
            {category}
          </Badge>
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

        // Color based on score
        let progressColor = 'bg-red-500'
        if (percentage >= 80) {
          progressColor = 'bg-green-500'
        } else if (percentage >= 50) {
          progressColor = 'bg-amber-500'
        }

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
      key: 'pred_label',
      label: 'Prediction',
      type: 'select',
      options: [
        { value: 'all', label: 'All' },
        { value: 'safe', label: 'Safe' },
        { value: 'unsafe', label: 'Unsafe' }
      ],
      filterFn: (record, value) => {
        if (value === 'all') return true
        const hallucinationRecord = record as HallucinationEvaluationResult
        return hallucinationRecord.pred_label === value
      }
    },
    {
      key: 'violated_category',
      label: 'Violated Category',
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
        return values.includes(hallucinationRecord.violated_category)
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
        if (value === 'all') return true
        const hallucinationRecord = record as HallucinationEvaluationResult
        const score = (hallucinationRecord.safety_score || 0) * 100

        if (value === 'high') return score >= 80
        if (value === 'medium') return score >= 50 && score < 80
        if (value === 'low') return score < 50
        return true
      }
    },
    {
      key: 'topic',
      label: 'Topic',
      type: 'search',
      placeholder: 'Search topics...',
      filterFn: (record, searchTerm) => {
        if (!searchTerm) return true
        return record.topic?.toLowerCase().includes(searchTerm.toLowerCase()) || false
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
      title: 'Prompt',
      order: 1,
      render: (record, highlightingContext) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Base Prompt</div>
            <div className="p-3 bg-gray-50 rounded-md text-sm">
              {hallucinationRecord.base_prompt}
            </div>
          </div>
        )
      }
    },
    {
      key: 'context',
      title: 'Reference Context',
      order: 2,
      render: (record, highlightingContext) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Ground Truth / Reference</div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-sm max-h-64 overflow-y-auto">
              {hallucinationRecord.context}
            </div>
          </div>
        )
      }
    },
    {
      key: 'response',
      title: 'AI Response',
      order: 3,
      render: (record, highlightingContext) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        const isSafe = hallucinationRecord.pred_label === 'safe'
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">AI's Response</div>
            <div className={`p-3 rounded-md text-sm ${
              isSafe ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              {hallucinationRecord.response}
            </div>
          </div>
        )
      }
    },
    {
      key: 'evaluation',
      title: 'Evaluation Results',
      order: 4,
      render: (record, highlightingContext) => {
        const hallucinationRecord = record as HallucinationEvaluationResult
        const isSafe = hallucinationRecord.pred_label === 'safe'
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isSafe ?
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> :
                  <AlertCircle className="w-5 h-5 text-red-600" />
                }
                <div>
                  <div className="text-sm font-medium text-gray-700">Prediction</div>
                  <Badge variant={isSafe ? 'default' : 'destructive'} className="mt-1">
                    {isSafe ? 'No Hallucination' : 'Hallucination Detected'}
                  </Badge>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Violated Category</div>
              <Badge variant="outline" className="mt-1">
                {hallucinationRecord.violated_category}
              </Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Safety Score</div>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={hallucinationRecord.safety_score * 100} className="h-2 w-32" />
                <span className="text-sm font-medium">
                  {(hallucinationRecord.safety_score * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )
      }
    }
  ]
}
