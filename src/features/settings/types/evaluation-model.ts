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
  topicGeneration: string | null; // model id - Stage 1: Generate topics from policies
  promptGeneration: string | null; // model id - Stage 2: Generate prompts from topics
  evaluationJudgement: string | null; // model id
  testExecution: string | null; // model id
}

export interface EvaluationModelFormData {
  name: string;
  provider: 'OpenAI' | 'Azure' | 'Anthropic';
  apiKey: string;
  modelId: string;
}
