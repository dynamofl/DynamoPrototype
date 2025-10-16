import type { EvaluationConfig, EvaluationInput, EvaluationResult } from './evaluation';

export type EvaluationTestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
export type EvaluationTestType = 'compliance' | 'jailbreak';

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
  metadata?: {
    evaluationData?: any; // Store original evaluation creation data for resuming
  };
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  // NEW: Individual summary metric columns from evaluations table
  aiSystemAttackSuccessRate?: number;
  aiSystemGuardrailAttackSuccessRate?: number;
  guardrailSuccessRate?: number;
  uniqueTopics?: number;
  uniqueAttackAreas?: number;
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
