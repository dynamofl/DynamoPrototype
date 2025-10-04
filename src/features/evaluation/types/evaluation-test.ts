import type { EvaluationConfig, EvaluationInput, EvaluationResult } from './evaluation';

export type EvaluationTestStatus = 'in_progress' | 'completed' | 'failed';

export interface EvaluationTest {
  id: string;
  name: string;
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
