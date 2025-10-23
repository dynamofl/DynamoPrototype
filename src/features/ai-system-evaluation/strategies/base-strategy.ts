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
  getTableColumns(hasGuardrails?: boolean): ColumnConfig[]

  /**
   * UI Configuration - Filters
   * Define available filters for data
   */
  getFilters(hasGuardrails?: boolean): FilterConfig[]

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
