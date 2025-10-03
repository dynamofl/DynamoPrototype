export type ModelUsageType = 'prompt-generation' | 'evaluation-judgement' | 'test-execution';

export interface EvaluationModel {
  id: string;
  name: string;
  provider: 'OpenAI' | 'Azure' | 'Anthropic';
  apiKey: string;
  modelId: string; // e.g., "gpt-4o", "gpt-4-turbo"
  isActive: boolean;
  evaluationCount: number;
  createdAt: string;
  lastUsed?: string;
}

export interface ModelAssignment {
  promptGeneration: string | null; // model id
  evaluationJudgement: string | null; // model id
  testExecution: string | null; // model id
}

export interface EvaluationModelFormData {
  name: string;
  provider: 'OpenAI' | 'Azure' | 'Anthropic';
  apiKey: string;
  modelId: string;
}
