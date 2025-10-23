// Shared types for Edge Functions

// Multi-turn conversation support for advanced jailbreak attacks (TAP, IRIS)
export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AISystem {
  id: string;
  name: string;
  provider: string;
  model: string;
  config: Record<string, any>;
}

export interface AISystemResponse {
  content: string;
  runtimeMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  confidenceScore?: number; // 0-1 value from logprobs (OpenAI) or null (other providers)
  latencyMs?: number; // Response time in milliseconds (usually same as runtimeMs)
}

export interface Guardrail {
  id: string;
  name: string;
  type: string;
  guardrail_type: 'input' | 'output'; // Input (evaluates prompts) or Output (evaluates responses)
  config: Record<string, any>;
  policies: Policy[];
}

export interface Policy {
  id: string;
  name: string;
  behavior: string;
  prompts: string[];
}

// Guardrail evaluation detail structure
export interface GuardrailDetail {
  guardrailId: string;
  guardrailName: string;
  judgement: string;
  reason: string;
  violations?: Array<{phrase: string, violatedBehaviors: string[]}>;
  latencyMs?: number; // Individual guardrail evaluation time
  confidenceScore?: number; // Individual guardrail confidence (0-1)
}

// Consolidated guardrail evaluation structure
export interface GuardrailEvaluation {
  judgement: string;  // 'Blocked' | 'Allowed'
  reason: string;
  details: GuardrailDetail[];
  latencyMs?: number; // Total time for all guardrails
  confidenceScore?: number; // Average confidence across all guardrails
}

// Consolidated AI system response with judge evaluation
export interface AISystemResponseData {
  content: string;
  judgement: string | null;  // 'Answered' | 'Refused'
  reason: string | null;
  outputTokens: number | null;
  confidenceScore?: number | null; // Judge model confidence in the judgement (0-1)
  latencyMs?: number | null; // Response time in milliseconds
  answerPhrases?: Array<{phrase: string, reasoning: string}>; // Key phrases that answer the question (only when judgement is 'Answered')
}

export interface PolicyContext {
  description: string;
  allowedBehaviors: string[];
  disallowedBehaviors: string[];
}

// Jailbreak prompt type (renamed from EvaluationPrompt)
export interface JailbreakPrompt {
  id?: string;
  evaluation_id?: string;
  prompt_index: number;
  policy_id: string;
  policy_name: string;
  topic?: string; // The topic category this prompt belongs to (max 2 words)
  prompt_title?: string; // Concise title (max 5 words) describing the base prompt
  policy_context?: PolicyContext; // Policy information used to generate this prompt
  base_prompt: string;
  adversarial_prompt: ConversationTurn[] | { text: string } | any; // JSONB: array for multi-turn (TAP, IRIS) or object for single-turn
  attack_type: string;
  behavior_type: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';

  // Consolidated guardrail evaluations
  input_guardrail?: GuardrailEvaluation | null;
  output_guardrail?: GuardrailEvaluation | null;

  // Consolidated AI system response with judge evaluation
  ai_system_response?: AISystemResponseData | null;

  // Legacy fields (kept for backward compatibility)
  guardrail_judgement?: string;
  model_judgement?: string;

  attack_outcome?: string;
  ai_system_attack_outcome?: string;  // NEW: AI system-only outcome (ignoring guardrails)

  // Evaluation-level metrics
  runtime_ms?: number;
  input_tokens?: number;
  total_tokens?: number;
}

// Backward compatibility alias
export type EvaluationPrompt = JailbreakPrompt;

// Compliance prompt type
export interface CompliancePrompt {
  id?: string;
  evaluation_id?: string;
  prompt_index: number;
  policy_id?: string;
  policy_name?: string;
  topic?: string;
  prompt_title?: string;

  // Prompt and variations
  base_prompt: string;          // Grouping identifier
  actual_prompt: string;        // What's actually sent
  perturbation_type?: string | null;   // NULL, 'typos', 'casing', etc.

  // Ground truth
  ground_truth: 'Compliant' | 'Non-Compliant';
  behavior_type: 'Allowed' | 'Disallowed';
  behavior_used?: string;
  behavior_phrases?: {
    phrases: string[];
    positions?: number[];
  };

  status?: 'pending' | 'running' | 'completed' | 'failed';

  // Results - consistent with jailbreak_prompts
  input_guardrail?: GuardrailEvaluation | null;   // Input guardrail evaluation
  output_guardrail?: GuardrailEvaluation | null;  // Output guardrail evaluation
  ai_system_response?: AISystemResponseData | null;  // AI system response with judge evaluation
  compliance_judgement?: string;
  final_outcome?: 'TP' | 'TN' | 'FP' | 'FN';

  policy_context?: PolicyContext;

  created_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
}

export interface Evaluation {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  ai_system_id: string;
  evaluation_type: string;
  config: EvaluationConfig;
  total_prompts: number;
  completed_prompts: number;
  current_stage?: string;
  current_prompt_text?: string;
  summary_metrics?: SummaryMetrics;
  // NEW: Individual summary metric columns
  ai_system_attack_success_rate?: number;
  ai_system_guardrail_attack_success_rate?: number;
  guardrail_success_rate?: number;
  unique_topics?: number;
  unique_attack_areas?: number;
  // NEW: Topic-level analysis (includes embedded topic_insight)
  topic_analysis?: TopicAnalysis;
  created_by: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// Test type enums
export type TestType = 'jailbreak' | 'compliance';
export type EvaluationType =
  | 'jailbreak'
  | 'compliance'
  | 'compliance_with_perturbations'
  | 'quality'
  | 'performance'
  | 'bias';

export interface EvaluationConfig {
  policyIds: string[];
  guardrailIds: string[];
  temperature?: number;
  maxTokens?: number;
  // Test type configuration (Layer 1 - base prompt generation)
  testType?: TestType | string;
  // Evaluation type configuration (Layer 2 - transformation strategy)
  evaluationType?: EvaluationType | string;
  // Perturbation types for compliance testing
  perturbationTypes?: string[];
  [key: string]: any;
}

export interface PolicyMetrics {
  total: number;
  failures: number;
  successes: number;
  policyName: string;
  successRate: number;
}

export interface AttackTypeMetrics {
  total: number;
  failures: number;
  successes: number;
  successRate: number;
}

export interface BehaviorTypeMetrics {
  total: number;
  failures: number;
  successes: number;
  successRate: number;
}

// Topic-level analysis types
export interface StatisticalMetric {
  mean: number;
  median: number;
  mode: number;
  std_dev: number;
  variance: number;
  iqr: number;
  range: {
    min: number;
    max: number;
  };
}

export interface LogisticRegressionResult {
  odds_ratio: number;
  p_value: number;
  significance: boolean;
}

export interface TopicMetrics {
  topic_name: string;
  attack_success_rate: StatisticalMetric;
  confidence: StatisticalMetric;
  runtime_seconds: StatisticalMetric;
  input_tokens: StatisticalMetric;
  output_tokens: StatisticalMetric;
  occurrence: number;
  logistic_regression: LogisticRegressionResult;
}

export interface PolicyTopicAnalysis {
  id: string;
  policy_name: string;
  topics: TopicMetrics[];
}

export interface TopicAnalysis {
  source: {
    type: 'policy_group';
    policies: PolicyTopicAnalysis[];
  };
  topic_insight?: string; // AI-generated insights about attack patterns and model behavior
}

export interface GuardrailSummaryMetrics {
  id: string;
  name: string;
  type: 'input' | 'output';
  byPolicy: Record<string, PolicyMetrics>;
  totalTests: number;
  successRate: number;
  byAttackType: Record<string, AttackTypeMetrics>;
  attackFailures: number;
  byBehaviorType: Record<string, BehaviorTypeMetrics>;
  attackSuccesses: number;
  guardrailOnlyFailures: number;
  guardrailOnlySuccesses: number;
  guardrailOnlySuccessRate: number;
}

export interface SummaryMetrics {
  aiSystem: {
    totalTests: number;
    attackSuccesses: number;
    attackFailures: number;
    successRate: number;
    aiSystemOnlySuccesses: number;
    aiSystemOnlyFailures: number;
    aiSystemOnlySuccessRate: number;
    byPolicy: Record<string, PolicyMetrics>;
    byAttackType: Record<string, AttackTypeMetrics>;
    byBehaviorType: Record<string, BehaviorTypeMetrics>;
  };
  guardrails?: GuardrailSummaryMetrics[];
  // NEW: Summary metrics for evaluation table columns (nested for JSONB storage)
  summaryMetrics: {
    aiSystemAttackSuccessRate: number;
    aiSystemGuardrailAttackSuccessRate: number;
    guardrailSuccessRate: number;
    uniqueTopics: number;
    uniqueAttackAreas: number;
  };
  // NEW: Individual summary metrics at root level for easy access
  aiSystemAttackSuccessRate?: number;
  aiSystemGuardrailAttackSuccessRate?: number;
  guardrailSuccessRate?: number | null;
  uniqueTopics?: number;
  uniqueAttackAreas?: number;
  // NEW: Topic-level analysis
  topicAnalysis?: TopicAnalysis;
  // Legacy fields for backward compatibility
  totalTests?: number;
  attackSuccesses?: number;
  attackFailures?: number;
  successRate?: number;
  aiSystemOnlySuccesses?: number;
  aiSystemOnlyFailures?: number;
  aiSystemOnlySuccessRate?: number;
  byPolicy?: Record<string, any>;
  byAttackType?: Record<string, any>;
  byBehaviorType?: Record<string, any>;
}

export interface InternalModelConfig {
  topicGeneration?: {
    provider: string;
    modelId: string;
    apiKey: string;
  };
  promptGeneration?: {
    provider: string;
    modelId: string;
    apiKey: string;
  };
  inputGuardrail?: {
    provider: string;
    modelId: string;
    apiKey: string;
  };
  outputGuardrail?: {
    provider: string;
    modelId: string;
    apiKey: string;
  };
  judgeModel?: {
    provider: string;
    modelId: string;
    apiKey: string;
  };
  topicInsightModel?: {
    provider: string;
    modelId: string;
    apiKey: string;
  };
}

// New: Configuration for guardrail and judge models
export interface GuardrailModelConfig {
  id: string;
  config_type: 'input_guardrail' | 'output_guardrail' | 'judge_model';
  provider: string;
  model: string;
  api_key_encrypted: string;
  config?: Record<string, any>;
  is_active: boolean;
}

// Helper type for model execution
export interface ModelExecutionConfig {
  provider: string;
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export interface CreateEvaluationRequest {
  name: string;
  aiSystemId: string;
  evaluationType: 'jailbreak' | 'custom';
  policyIds: string[];
  guardrailIds: string[];
  config?: Partial<EvaluationConfig>;
  internalModels?: InternalModelConfig;
}

export interface CreateEvaluationResponse {
  evaluationId: string;
  status: string;
  totalPrompts: number;
}

export interface EvaluationStatusResponse {
  id: string;
  name: string;
  status: string;
  progress: {
    total: number;
    completed: number;
    percentage: number;
    currentStage?: string;
    currentPrompt?: string;
  };
  results?: SummaryMetrics;
}
