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

// Violation tracking: phrase-to-behaviors mapping
export interface PhraseViolation {
  phrase: string;
  violatedBehaviors: string[];
}

// Per-guardrail evaluation detail
export interface GuardrailEvaluationDetail {
  guardrailId: string;
  guardrailName: string;
  judgement: GuardrailJudgement;
  reason: string;
  violations?: PhraseViolation[];
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

  // Three-layer judgements - OVERALL results
  inputGuardrailJudgement?: GuardrailJudgement | null;
  inputGuardrailReason?: string | null;
  inputGuardrailViolations?: PhraseViolation[] | null;
  outputGuardrailJudgement?: GuardrailJudgement | null;
  outputGuardrailReason?: string | null;
  outputGuardrailViolations?: PhraseViolation[] | null;
  judgeModelJudgement?: ModelJudgement | null;
  judgeModelReason?: string | null;

  // Per-guardrail DETAILED results (for multi-guardrail evaluations)
  inputGuardrailDetails?: GuardrailEvaluationDetail[] | null;
  outputGuardrailDetails?: GuardrailEvaluationDetail[] | null;

  // Legacy fields (kept for backward compatibility)
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