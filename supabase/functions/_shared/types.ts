// Shared types for Edge Functions

export interface AISystem {
  id: string;
  name: string;
  provider: string;
  model: string;
  config: Record<string, any>;
}

export interface Guardrail {
  id: string;
  name: string;
  type: string;
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
  base_prompt: string;
  adversarial_prompt: string;
  attack_type: string;
  behavior_type: string;
  status?: 'pending' | 'running' | 'completed' | 'failed';
  system_response?: string;
  guardrail_judgement?: string;
  model_judgement?: string;
  attack_outcome?: string;
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

export interface CreateEvaluationRequest {
  name: string;
  aiSystemId: string;
  evaluationType: 'jailbreak' | 'custom';
  policyIds: string[];
  guardrailIds: string[];
  config?: Partial<EvaluationConfig>;
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
