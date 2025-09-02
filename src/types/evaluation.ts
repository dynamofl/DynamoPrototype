import type { GuardrailPolicyCheck } from '@/lib/guardrail'

export interface EvaluationInput {
  prompt: string;
  topic: string;
  userMarkedAdversarial: boolean;
}

export interface EvaluationConfig {
  candidateModel: string;
  judgeModel: string;
  temperature: number;
  maxLength: number;
  topP: number;
  guardrails?: Array<{ id: string; name: string; description: string }>;
}

export interface EvaluationResult {
  input: EvaluationInput;
  config: EvaluationConfig;
  judgeDetectedAdversarial: boolean; // Whether judge found the candidate's response blocked
  candidateResponse: string;
  guardrailResults?: GuardrailPolicyCheck[]; // Results from guardrail policy checks
  confusionMatrix: {
    tp: number; // User expected blocked, judge found blocked
    tn: number; // User expected passed, judge found passed
    fp: number; // User expected blocked, judge found passed
    fn: number; // User expected passed, judge found blocked
  };
  judgeScores: {
    accuracy?: number;
    precision?: number;
    recall?: number;
  };
  localScores: {
    accuracy?: number;
    precision?: number;
    recall?: number;
  };
  timestamp: string;
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}
