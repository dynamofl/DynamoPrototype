// Base Evaluation Types - Foundation for all test types
// All test-specific types (jailbreak, compliance, quality, etc.) extend these base interfaces

/**
 * Base prompt interface that all test types extend
 * Contains fields common to all evaluation prompts
 */
export interface BaseEvaluationPrompt {
  id?: string
  evaluation_id?: string
  prompt_index: number
  policy_id: string
  policy_name: string
  topic?: string
  prompt_title?: string
  policy_context?: PolicyContext

  // Core prompt fields
  base_prompt: string
  behavior_type: 'Allowed' | 'Disallowed'

  // Status tracking
  status?: 'pending' | 'running' | 'completed' | 'failed'

  // Timestamps
  created_at?: string
  started_at?: string
  completed_at?: string
  error_message?: string

  // Metadata
  runtime_ms?: number
}

/**
 * AI System Response structure (JSONB format)
 * Used for both jailbreak and compliance test types
 */
export interface AISystemResponse {
  reason?: string
  content: string
  judgement?: 'Answered' | 'Refused' | string
  latencyMs?: number
  outputTokens?: number
  inputTokens?: number
  answerPhrases?: Array<{
    phrase: string
    reasoning: string
  }>
  confidenceScore?: number
}

/**
 * Base evaluation result interface that all test types extend
 * Contains fields common to all evaluation results for display
 */
export interface BaseEvaluationResult extends BaseEvaluationPrompt {
  // AI System Response (can be string for legacy data or AISystemResponse for new data)
  system_response?: string | AISystemResponse

  // Guardrail evaluations - common to all test types
  input_guardrail_judgement?: string | null
  input_guardrail_reason?: string | null
  input_guardrail_details?: GuardrailDetail[] | null
  output_guardrail_judgement?: string | null
  output_guardrail_reason?: string | null
  output_guardrail_details?: GuardrailDetail[] | null

  // Performance metrics
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
}

/**
 * Base summary interface that all test types extend
 * Contains aggregated metrics common to all test types
 */
export interface BaseEvaluationSummary {
  total_tests: number
  by_policy: Record<string, PolicyMetrics>
  by_behavior_type: Record<string, BehaviorMetrics>
}

/**
 * Base evaluation output interface
 * This is what gets returned from the evaluation service
 */
export interface BaseEvaluationOutput {
  evaluation_id: string
  test_type: string  // 'jailbreak' | 'compliance' | 'quality' | 'bias' | ...
  evaluation_type?: string  // More specific variant (e.g., 'compliance_with_perturbations')
  timestamp: string
  results: BaseEvaluationResult[]
  summary: BaseEvaluationSummary
  config: BaseEvaluationConfig
  topic_analysis?: any
}

/**
 * Base evaluation configuration
 */
export interface BaseEvaluationConfig {
  test_type?: string
  evaluation_type?: string
  policy_ids?: string[]
  guardrail_ids?: string[]
  temperature?: number
  max_tokens?: number
  ai_system_id?: string
}

/**
 * Common metrics structures
 */
export interface PolicyMetrics {
  policy_name: string
  total: number
  successes: number
  failures: number
  success_rate: number
}

export interface BehaviorMetrics {
  total: number
  successes: number
  failures: number
  success_rate: number
}

export interface PolicyContext {
  description?: string
  allowed_behaviors?: string[]
  disallowed_behaviors?: string[]
  examples?: string[]
}

export interface GuardrailDetail {
  guardrail_id: string
  guardrail_name: string
  judgement: string
  reason: string
  violations?: Array<{phrase: string, violated_behaviors: string[]}>
  latency_ms?: number
  confidence_score?: number
}

/**
 * Test type enum
 */
export type TestType = 'jailbreak' | 'compliance' | 'quality' | 'bias'

/**
 * Evaluation type enum (more specific variants)
 */
export type EvaluationType =
  | 'jailbreak'
  | 'compliance'
  | 'compliance_with_perturbations'
  | 'quality'
  | 'bias'
