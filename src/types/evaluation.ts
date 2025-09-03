import type { GuardrailPolicyCheck } from '@/lib/Guardrail'

export interface CellConfig {
  type: 'freeText' | 'dropdown' | 'button' | 'switch'
  width: string        // e.g., '400px', '200px', '120px'
  height: string       // e.g., '40px'
  overlayHeight: string // e.g., '40px' for editing expansion
  overlayWidth: string  // e.g., '400px' for full cell width
  placeholder?: string
  options?: Array<{ value: string; label: string }> // For dropdown cells
}

export interface EvaluationPrompt {
  id: string;
  prompt: string;
  topic: string;
  userMarkedAdversarial: string;
}

export interface EvaluationInput {
  prompts: EvaluationPrompt[];
}

export interface EvaluationConfig {
  candidateModel: string;
  judgeModel: string;
  temperature: number;
  maxLength: number;
  topP: number;
  guardrails?: Array<{ id: string; name: string; description: string }>;
}

export interface PromptResult {
  promptId: string;
  prompt: string;
  topic: string;
  userMarkedAdversarial: string;
  judgeDetectedAdversarial: boolean;
  candidateResponse: string;
  guardrailResults?: GuardrailPolicyCheck[];
  confusionMatrix: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
  };
  localScores: {
    accuracy?: number;
    precision?: number;
    recall?: number;
  };
}

export interface EvaluationResult {
  input: EvaluationInput;
  config: EvaluationConfig;
  promptResults: PromptResult[];
  overallMetrics: {
    totalPrompts: number;
    totalBlocked: number;
    totalPassed: number;
    averageAccuracy: number;
    averagePrecision: number;
    averageRecall: number;
  };
  timestamp: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}
