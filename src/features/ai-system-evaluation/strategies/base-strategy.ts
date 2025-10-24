// Base Strategy Pattern - Interface that all test type strategies must implement
// This enables adding new test types (quality, bias, etc.) without modifying existing components

import type { ReactNode } from 'react'
import type {
  BaseEvaluationResult,
  BaseEvaluationSummary,
  BaseEvaluationOutput
} from '../types/base-evaluation'

/**
 * Column configuration for table display
 */
export interface ColumnConfig {
  key: string
  label: string
  width?: string
  className?: string
  sortable?: boolean
  render: (record: BaseEvaluationResult) => ReactNode
}

/**
 * Filter configuration for data filtering
 */
export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'search' | 'daterange'
  options?: Array<{ value: string; label: string }>
  filterFn: (record: BaseEvaluationResult, value: any) => boolean
  placeholder?: string
}

/**
 * Summary card configuration for metrics display
 */
export interface SummaryCardConfig {
  title: string
  getValue: (summary: BaseEvaluationSummary) => number | string
  format?: 'number' | 'percentage' | 'duration' | 'custom'
  formatFn?: (value: number | string) => string
  color?: 'red' | 'green' | 'blue' | 'amber' | 'gray'
  icon?: ReactNode
  description?: string
}

/**
 * Detail section configuration for record details
 */
export interface DetailSectionConfig {
  title: string
  order: number  // Display order
  render: (record: BaseEvaluationResult) => ReactNode
  condition?: (record: BaseEvaluationResult) => boolean  // Optional: only show if true
}

/**
 * Export field configuration
 */
export interface ExportFieldConfig {
  key: string
  label: string
  getValue: (record: BaseEvaluationResult) => string | number | boolean | null
  format?: 'string' | 'number' | 'boolean' | 'json'
}

/**
 * Summary section configuration for config-driven summary view rendering
 * Each section defines what component to render, with what props, and in what layout
 */
export interface SummarySectionConfig {
  /** Unique key for this section */
  key: string
  /** Display order (lower numbers render first) */
  order: number
  /** Label to show in navigation */
  label?: string
  /** Component identifier or type (resolved via component registry) */
  componentKey: string
  /** Props to pass to the component (can include data mappings) */
  props?: Record<string, any>
  /** Optional: only render if condition is true */
  condition?: (context: SummaryViewContext) => boolean
  /** Layout configuration for this section */
  layout?: {
    /** Container width: 'full' | 'constrained' (max-w-4xl) */
    container?: 'full' | 'constrained'
    /** Grid columns class (e.g., 'grid-cols-5') */
    gridCols?: string
    /** Additional CSS classes */
    className?: string
    /** Padding classes */
    padding?: string
  }
}

/**
 * Context passed to summary view sections for data access
 */
export interface SummaryViewContext {
  summary: BaseEvaluationSummary
  results?: BaseEvaluationResult[]
  hasGuardrails?: boolean
  topicAnalysis?: any
  evaluationResults?: BaseEvaluationResult[]
  [key: string]: any // Allow additional context properties
}

/**
 * Analysis section configuration (for summary view)
 */
export interface AnalysisSectionConfig {
  key: string
  title: string
  order: number
  render: (summary: BaseEvaluationSummary, results: BaseEvaluationResult[]) => ReactNode
  condition?: (summary: BaseEvaluationSummary) => boolean
}

/**
 * Highlighting context for phrase highlighting in conversation view
 */
export interface HighlightingContext {
  shouldHighlightPrompt: boolean
  shouldHighlightResponse: boolean
  highlightPhrases: any[]
  allInputPhrases: any[]
  allOutputPhrases: any[]
  highlightColor: 'amber' | 'green' | 'red'
  hoveredBehavior: any | null
  selectedBehaviors: Set<string> | null
  handlePhraseClick: (phraseIndex: number, type: 'input' | 'output') => void
}

/**
 * Conversation section configuration (for conversation view)
 */
export interface ConversationSectionConfig {
  key: string
  title: string
  order: number
  render: (record: BaseEvaluationResult, highlightingContext?: HighlightingContext) => ReactNode
  condition?: (record: BaseEvaluationResult) => boolean
}

/**
 * Main strategy interface that all test types must implement
 * This is the core of the strategy pattern
 */
export interface EvaluationStrategy {
  /** Test type identifier */
  readonly testType: string

  /** Display name for UI */
  readonly displayName: string

  /**
   * Data Transformation
   * Transform database records to frontend result format
   */
  transformPrompts(dbRecords: any[]): BaseEvaluationResult[]

  /**
   * Summary Calculation
   * Calculate aggregated metrics from results
   */
  calculateSummary(results: BaseEvaluationResult[]): BaseEvaluationSummary

  /**
   * UI Configuration - Table
   * Define columns for table display
   */
  getTableColumns(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): ColumnConfig[]

  /**
   * UI Configuration - Filters
   * Define available filters for data
   */
  getFilters(options?: { hasInputGuardrails?: boolean; hasOutputGuardrails?: boolean }): FilterConfig[]

  /**
   * UI Configuration - Summary Cards
   * Define metrics cards for summary view
   */
  getSummaryCards(): SummaryCardConfig[]

  /**
   * UI Configuration - Detail Sections
   * Define sections for individual record details
   */
  getDetailSections(): DetailSectionConfig[]

  /**
   * UI Configuration - Analysis Sections
   * Define analysis sections for summary view
   */
  getAnalysisSections(): AnalysisSectionConfig[]

  /**
   * Export Configuration
   * Define fields for data export
   */
  getExportFields(): ExportFieldConfig[]

  /**
   * Get outcome badge variant (for styling)
   */
  getOutcomeBadgeVariant(outcome: string): 'default' | 'secondary' | 'destructive' | 'outline'

  /**
   * Get outcome color (for charts and visualizations)
   */
  getOutcomeColor(outcome: string): string

  /**
   * UI Configuration - Conversation Sections
   * Define sections for conversation detail view
   */
  getConversationSections(): ConversationSectionConfig[]

  /**
   * Get title for the conversation view (e.g., "Jailbreak Prompt" vs "Actual Prompt")
   */
  getConversationTitle(record: BaseEvaluationResult): string | null

  /**
   * Get badge info for the conversation view header
   */
  getConversationBadge(record: BaseEvaluationResult): {
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    color?: string
  } | null

  /**
   * UI Configuration - Summary View Sections
   * Define sections for summary view in declarative config format
   * This enables config-driven rendering for different test types
   */
  getSummaryViewConfig(): SummarySectionConfig[]
}

/**
 * Utility type guards for strategy-specific results
 */
export function hasAttackType(result: BaseEvaluationResult): boolean {
  return 'attackType' in result && 'adversarialPrompt' in result
}

export function hasGroundTruth(result: BaseEvaluationResult): boolean {
  return 'groundTruth' in result && 'finalOutcome' in result
}

export function hasQualityScore(result: BaseEvaluationResult): boolean {
  return 'qualityScore' in result
}
