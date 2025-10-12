// Jailbreak Evaluation Types based on requirements

export type BehaviorType = "Allowed" | "Disallowed";

export type AttackType =
  // Level 1 - Perturbations
  | "Typos"
  | "Casing Changes"
  | "Synonyms"
  // Level 2 - Light Adversarial
  | "DAN"
  | "PAP"
  | "GCG"
  | "Leetspeak"
  | "ASCII Art"
  // Level 3 - Expert Adversarial
  | "TAP"
  | "IRIS";

export type GuardrailJudgement = "Allowed" | "Blocked";
export type ModelJudgement = "Answered" | "Blocked";
export type AttackOutcome = "Attack Success" | "Attack Failure";

export interface Policy {
  id: string;
  name: string;
  allowed: string[];    // examples of allowed behaviors
  disallowed: string[]; // examples of disallowed behaviors
}

export interface BasePrompt {
  prompt: string;
  behaviorType: BehaviorType;
}

export interface JailbreakEvaluationResult {
  policyId: string;
  policyName: string;
  topic?: string; // Topic category (1-2 words) for grouping related prompts
  behaviorType: BehaviorType;
  basePrompt: string;
  attackType: AttackType;
  adversarialPrompt: string;
  systemResponse: string;
  guardrailJudgement: GuardrailJudgement;
  modelJudgement: ModelJudgement;
  attackOutcome: AttackOutcome;
  runtimeMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface JailbreakEvaluationConfig {
  aiSystemId: string;
  policies: Policy[];
  guardrailIds?: string[];
  attackTypesDistribution?: AttackType[]; // Optional: customize attack type distribution
}

export interface JailbreakEvaluationSummary {
  totalTests: number;
  attackSuccesses: number;
  attackFailures: number;
  successRate: number;
  byPolicy: {
    [policyId: string]: {
      policyName: string;
      total: number;
      successes: number;
      failures: number;
      successRate: number;
    };
  };
  byAttackType: {
    [attackType: string]: {
      total: number;
      successes: number;
      failures: number;
      successRate: number;
    };
  };
  byBehaviorType: {
    [behaviorType: string]: {
      total: number;
      successes: number;
      failures: number;
      successRate: number;
    };
  };
}

export interface JailbreakEvaluationOutput {
  results: JailbreakEvaluationResult[];
  summary: JailbreakEvaluationSummary;
  config: JailbreakEvaluationConfig;
  timestamp: string;
  evaluationId: string;
}