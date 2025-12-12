// Hallucination Evaluation Types
// Extends base evaluation types with hallucination-specific fields

import type {
  BaseEvaluationPrompt,
  BaseEvaluationResult,
  BaseEvaluationSummary,
  BaseEvaluationOutput,
  BaseEvaluationConfig
} from './base-evaluation'

/**
 * Prediction label for hallucination detection
 */
export type HallucinationPredLabel = 'safe' | 'unsafe'

/**
 * Violated category types for hallucination
 */
export type HallucinationViolatedCategory =
  | 'N/A'
  | 'Citation / Attribution Errors'
  | 'Entity Inaccuracies'
  | 'Context contradictions'

/**
 * Hallucination-specific prompt fields
 */
export interface HallucinationPrompt extends BaseEvaluationPrompt {
  // Core content
  context: string                     // Reference/source content (ground truth)
  response?: string                   // AI's response to evaluate

  // Evaluation results
  pred_label?: HallucinationPredLabel
  violated_category?: HallucinationViolatedCategory
  safety_score?: number               // 0-1 confidence score (higher = safer)
}

/**
 * Hallucination evaluation result (for display in UI)
 */
export interface HallucinationEvaluationResult extends BaseEvaluationResult {
  // Hallucination-specific fields (camelCase for frontend)
  context: string
  response: string
  predLabel: HallucinationPredLabel
  pred_label: HallucinationPredLabel
  violatedCategory: HallucinationViolatedCategory
  violated_category: HallucinationViolatedCategory
  safetyScore: number
  safety_score: number

  // Derived field for display
  is_hallucination: boolean           // pred_label === 'unsafe'
}

/**
 * Category metrics for summary
 */
export interface HallucinationCategoryMetrics {
  category: HallucinationViolatedCategory
  count: number
  percentage: number
  avg_safety_score: number
}

/**
 * Hallucination evaluation summary
 */
export interface HallucinationEvaluationSummary extends BaseEvaluationSummary {
  // Core metrics
  safe_count: number
  unsafe_count: number
  hallucination_rate: number          // (unsafe / total) * 100
  avg_safety_score: number

  // Category breakdown
  by_category: Record<HallucinationViolatedCategory, {
    count: number
    percentage: number
    avg_safety_score: number
  }>

  // Safety score distribution
  safety_score_distribution?: {
    high: number    // >= 0.8
    medium: number  // 0.5-0.8
    low: number     // < 0.5
  }
}

/**
 * Hallucination evaluation configuration
 */
export interface HallucinationEvaluationConfig extends BaseEvaluationConfig {
  test_type: 'hallucination'
  safety_threshold?: number           // Default: 0.5
}

/**
 * Complete hallucination evaluation output
 */
export interface HallucinationEvaluationOutput extends BaseEvaluationOutput {
  test_type: 'hallucination'
  results: HallucinationEvaluationResult[]
  summary: HallucinationEvaluationSummary
  config: HallucinationEvaluationConfig
}
