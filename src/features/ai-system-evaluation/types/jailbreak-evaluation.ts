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

// Multi-turn conversation support for advanced jailbreak attacks (TAP, IRIS)
export interface ConversationTurn {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Adversarial prompt can be either:
// - Single-turn: {text: string}
// - Multi-turn: ConversationTurn[]
export type AdversarialPrompt = { text: string } | ConversationTurn[];

export type GuardrailJudgement = "Allowed" | "Blocked";
export type ModelJudgement = "Answered" | "Refused" | "Blocked";
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

// Answer phrase tracking: key phrases that answer the question
export interface AnswerPhrase {
  phrase: string;
  reasoning: string;
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
  adversarialPrompt: AdversarialPrompt; // JSONB: {text: string} or ConversationTurn[]
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
  judgeModelAnswerPhrases?: AnswerPhrase[] | null; // Key phrases that answer the question (only when judgement is 'Answered')

  // Per-guardrail DETAILED results (for multi-guardrail evaluations)
  inputGuardrailDetails?: GuardrailEvaluationDetail[] | null;
  outputGuardrailDetails?: GuardrailEvaluationDetail[] | null;

  // Legacy fields (kept for backward compatibility)
  guardrailJudgement: GuardrailJudgement;
  modelJudgement: ModelJudgement;

  attackOutcome: AttackOutcome;
  aiSystemAttackOutcome: AttackOutcome;  // NEW: AI system-only outcome (ignoring guardrails)

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

export interface PolicyMetrics {
  total: number;
  failures: number;
  successes: number;
  policyName: string;
  successRate: number;
}

export interface AttackTypeMetrics {
  total: number;
  failures: number;
  successes: number;
  successRate: number;
}

export interface BehaviorTypeMetrics {
  total: number;
  failures: number;
  successes: number;
  successRate: number;
}

export interface GuardrailSummaryMetrics {
  id: string;
  name: string;
  type: 'input' | 'output';
  byPolicy: Record<string, PolicyMetrics>;
  totalTests: number;
  successRate: number;
  byAttackType: Record<string, AttackTypeMetrics>;
  attackFailures: number;
  byBehaviorType: Record<string, BehaviorTypeMetrics>;
  attackSuccesses: number;
  guardrailOnlyFailures: number;
  guardrailOnlySuccesses: number;
  guardrailOnlySuccessRate: number;
}

export interface JailbreakEvaluationSummary {
  // NEW: Nested structure with aiSystem and guardrails
  aiSystem?: {
    totalTests: number;
    attackSuccesses: number;
    attackFailures: number;
    successRate: number;
    aiSystemOnlySuccesses: number;
    aiSystemOnlyFailures: number;
    aiSystemOnlySuccessRate: number;
    byPolicy: Record<string, PolicyMetrics>;
    byAttackType: Record<string, AttackTypeMetrics>;
    byBehaviorType: Record<string, BehaviorTypeMetrics>;
  };
  guardrails?: GuardrailSummaryMetrics[];

  // NEW: Summary metrics for evaluation table columns
  summaryMetrics?: {
    aiSystemAttackSuccessRate: number;
    aiSystemGuardrailAttackSuccessRate: number;
    guardrailSuccessRate: number;
    uniqueTopics: number;
    uniqueAttackAreas: number;
  };

  // Legacy fields for backward compatibility
  totalTests?: number;
  attackSuccesses?: number;
  attackFailures?: number;
  successRate?: number;
  aiSystemOnlySuccesses?: number;
  aiSystemOnlyFailures?: number;
  aiSystemOnlySuccessRate?: number;
  byPolicy?: {
    [policyId: string]: {
      policyName: string;
      total: number;
      successes: number;
      failures: number;
      successRate: number;
    };
  };
  byAttackType?: {
    [attackType: string]: {
      total: number;
      successes: number;
      failures: number;
      successRate: number;
    };
  };
  byBehaviorType?: {
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