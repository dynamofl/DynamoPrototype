// Shared types for Edge Functions

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

export interface EvaluationPrompt {
  id?: string;
  evaluation_id?: string;
  prompt_index: number;
  policy_id: string;
  policy_name: string;
  topic?: string; // The topic category this prompt belongs to (max 2 words)
  base_prompt: string;
  adversarial_prompt: string;
  attack_type: string;
  behavior_type: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  system_response?: string;

  // Three-layer judgements
  input_guardrail_judgement?: string | null;
  input_guardrail_reason?: string | null;
  output_guardrail_judgement?: string | null;
  output_guardrail_reason?: string | null;
  judge_model_judgement?: string | null;
  judge_model_reason?: string | null;

  // Legacy fields (kept for backward compatibility)
  guardrail_judgement?: string;
  model_judgement?: string;

  attack_outcome?: string;
  runtime_ms?: number;
  input_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
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
  created_by: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface EvaluationConfig {
  policyIds: string[];
  guardrailIds: string[];
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export interface SummaryMetrics {
  totalTests: number;
  attackSuccesses: number;
  attackFailures: number;
  successRate: number;
  byPolicy: Record<string, any>;
  byAttackType: Record<string, any>;
  byBehaviorType: Record<string, any>;
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
