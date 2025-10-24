// Compliance Evaluation Types
// Extends base evaluation types with compliance-specific fields

import type {
  BaseEvaluationPrompt,
  BaseEvaluationResult,
  BaseEvaluationSummary,
  BaseEvaluationOutput,
  BaseEvaluationConfig,
  PolicyMetrics,
  BehaviorMetrics
} from './base-evaluation'

/**
 * Compliance-specific prompt fields
 */
export interface CompliancePrompt extends BaseEvaluationPrompt {
  // Prompt variations
  actual_prompt: string  // The prompt actually sent (base or perturbed)
  perturbation_type?: string | null  // 'typos', 'casing', 'synonyms', 'leetspeak', etc.

  // Ground truth (set during prompt generation)
  ground_truth: 'Compliant' | 'Non-Compliant'
  behavior_used?: string  // Specific behavior text that was used
  behavior_phrases?: {
    phrases: string[]
    positions?: number[]
  }

  // Results
  ai_system_response?: any  // NEW: Primary field - JSONB format consistent with jailbreak_prompts
  compliance_judgement?: string  // Judge's determination
  final_outcome?: 'TP' | 'TN' | 'FP' | 'FN'
}

/**
 * Compliance evaluation result (for display in UI)
 */
export interface ComplianceEvaluationResult extends BaseEvaluationResult {
  // Compliance-specific fields
  actual_prompt: string
  perturbation_type?: string | null
  ground_truth: 'Compliant' | 'Non-Compliant'
  behavior_used?: string
  behavior_phrases?: {
    phrases: string[]
    positions?: number[]
  }
  ai_system_response?: any  // NEW: Primary field - JSONB format consistent with jailbreak_prompts
  compliance_judgement?: string
  judgeModelConfidence?: number | null  // Judge model confidence (0-1)
  judgeModelAnswerPhrases?: Array<{ phrase: string; reasoning: string }> | null  // Answer phrases for highlighting
  final_outcome: 'TP' | 'TN' | 'FP' | 'FN'
}

/**
 * Perturbation-specific metrics
 */
export interface PerturbationMetrics {
  perturbation_type: string
  total: number
  tp: number
  tn: number
  fp: number
  fn: number
  accuracy: number
}

/**
 * Compliance evaluation summary
 */
export interface ComplianceEvaluationSummary extends BaseEvaluationSummary {
  // Confusion matrix counts
  tp: number  // True Positive: AI responded when it should (allowed behavior)
  tn: number  // True Negative: AI blocked when it should (disallowed behavior)
  fp: number  // False Positive: AI blocked when it shouldn't (allowed behavior)
  fn: number  // False Negative: AI responded when it shouldn't (disallowed behavior)

  // Derived metrics
  precision: number  // TP / (TP + FP)
  recall: number     // TP / (TP + FN)
  f1_score: number   // 2 * (Precision * Recall) / (Precision + Recall)
  accuracy: number   // (TP + TN) / Total

  // Additional breakdowns
  by_perturbation_type?: Record<string, PerturbationMetrics>
  by_ground_truth?: Record<'Compliant' | 'Non-Compliant', {
    total: number
    tp: number
    tn: number
    fp: number
    fn: number
  }>
}

/**
 * Compliance evaluation configuration
 */
export interface ComplianceEvaluationConfig extends BaseEvaluationConfig {
  test_type: 'compliance'
  perturbation_types?: string[]  // Types of perturbations to apply
}

/**
 * Complete compliance evaluation output
 */
export interface ComplianceEvaluationOutput extends BaseEvaluationOutput {
  test_type: 'compliance'
  results: ComplianceEvaluationResult[]
  summary: ComplianceEvaluationSummary
  config: ComplianceEvaluationConfig
}

/**
 * Final outcome type
 */
export type FinalOutcome = 'TP' | 'TN' | 'FP' | 'FN'

/**
 * Ground truth type
 */
export type GroundTruth = 'Compliant' | 'Non-Compliant'
