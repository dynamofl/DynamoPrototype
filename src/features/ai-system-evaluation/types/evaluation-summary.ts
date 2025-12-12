// Evaluation Summary Types - For aggregated metrics across multiple evaluations

export interface EvaluationCategoryMetrics {
  category: 'jailbreak' | 'compliance' | 'hallucination';
  categoryLabel: string; // "Jailbreak", "Compliance", or "Hallucination"

  // Aggregated metrics
  totalEvaluations: number;
  avgAISystemOnlySuccessRate: number;
  avgWithGuardrailsSuccessRate: number | undefined;

  // Latest evaluation metrics
  latestAISystemOnlySuccessRate: number;
  latestWithGuardrailsSuccessRate: number | undefined;
  latestEvaluationDate: string | undefined;
  latestEvaluationName: string | undefined;
  latestGuardrailEvaluationDate: string | undefined; // Date of the latest evaluation with guardrails

  totalPrompts: number;
  totalUniqueTopics: number;
  totalUniqueAttackAreas: number;

  // Trend data for chart
  trend: Array<{
    date: string;
    timestamp: number;
    evaluationName: string;
    aiSystemOnlyRate: number;
    withGuardrailsRate: number | null; // null if no guardrails used
  }>;
}

export interface EvaluationSummaryData {
  jailbreak?: EvaluationCategoryMetrics;
  compliance?: EvaluationCategoryMetrics;
  hallucination?: EvaluationCategoryMetrics;
  hasData: boolean;
}
