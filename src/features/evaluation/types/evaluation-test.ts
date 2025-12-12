import type { EvaluationConfig, EvaluationInput, EvaluationResult } from './evaluation';

export type EvaluationTestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type EvaluationTestType = 'compliance' | 'jailbreak' | 'hallucination';

// Metrics structure for jailbreak evaluations
export interface JailbreakMetrics {
  ai_system_attack_success_rate?: number;
  ai_system_guardrail_attack_success_rate?: number;
  guardrail_success_rate?: number;
  unique_topics?: number;
  unique_attack_areas?: number;
}

// Metrics structure for compliance evaluations
export interface ComplianceMetrics {
  compliance_rate?: number;
  violation_rate?: number;
  unique_topics?: number;
  unique_policies?: number;
}

// Union type for all metrics
export type EvaluationMetrics = JailbreakMetrics | ComplianceMetrics | Record<string, any>;

export interface EvaluationTest {
  id: string;
  name: string;
  type?: EvaluationTestType;
  status: EvaluationTestStatus;
  config: EvaluationConfig;
  input: EvaluationInput;
  result?: EvaluationResult;
  progress?: {
    current: number;
    total: number;
    currentPrompt?: string;
  };
  currentStage?: string; // Current stage of the evaluation (for progress tracking)
  metadata?: {
    evaluationData?: any; // Store original evaluation creation data for resuming
  };
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  // Evaluation metrics - stored as JSONB, structure varies by evaluation type
  metrics?: EvaluationMetrics;
}

export interface EvaluationTestSummary {
  id: string;
  name: string;
  status: EvaluationTestStatus;
  candidateModel: string;
  judgeModel: string;
  totalPrompts: number;
  completedPrompts?: number;
  accuracyScore?: number;
  createdAt: string;
  completedAt?: string;
}
