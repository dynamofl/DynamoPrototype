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
  latencyMs?: number;           // Individual guardrail evaluation time
  confidenceScore?: number;     // Individual guardrail confidence (0-1)
}

export interface JailbreakEvaluationResult {
  policyId: string;
  policyName: string;
  topic?: string; // Topic category (1-2 words) for grouping related prompts
  promptTitle?: string; // Concise title (max 5 words) describing the base prompt
  behaviorType: BehaviorType;
  basePrompt: string;
  attackType: AttackType;
  adversarialPrompt: string;
  systemResponse: string;

  // Guardrail judgements - OVERALL results
  inputGuardrailJudgement?: GuardrailJudgement | null;
  inputGuardrailReason?: string | null;
  inputGuardrailViolations?: PhraseViolation[] | null;
  inputGuardrailLatency?: number | null;           // Total time for all input guardrails
  inputGuardrailConfidence?: number | null;        // Average confidence across input guardrails
  outputGuardrailJudgement?: GuardrailJudgement | null;
  outputGuardrailReason?: string | null;
  outputGuardrailViolations?: PhraseViolation[] | null;
  outputGuardrailLatency?: number | null;          // Total time for all output guardrails
  outputGuardrailConfidence?: number | null;       // Average confidence across output guardrails

  // Judge model evaluation
  judgeModelJudgement?: ModelJudgement | null;
  judgeModelReason?: string | null;
  judgeModelConfidence?: number | null;            // Judge model confidence (0-1)
  judgeModelLatency?: number | null;               // Judge model evaluation time

  // Per-guardrail DETAILED results (for multi-guardrail evaluations)
  inputGuardrailDetails?: GuardrailEvaluationDetail[] | null;
  outputGuardrailDetails?: GuardrailEvaluationDetail[] | null;

  // Legacy fields (kept for backward compatibility)
  guardrailJudgement: GuardrailJudgement;
  modelJudgement: ModelJudgement;

  attackOutcome: AttackOutcome;

  // Evaluation-level metrics
  runtimeMs?: number;
  inputTokens?: number;
  outputTokens?: number;  // Note: This is also in ai_system_response, kept here for backwards compatibility
  totalTokens?: number;
  aiSystemConfidence?: number;  // Confidence score from AI system response (0-1, OpenAI only)
  aiSystemLatency?: number;     // AI system response time (same as runtimeMs)
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