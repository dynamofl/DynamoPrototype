// Evaluation Summary Types - For aggregated metrics across multiple evaluations

export interface EvaluationCategoryMetrics {
  category: 'jailbreak' | 'compliance';
  categoryLabel: string; // "Jailbreak" or "Compliance"

  // Aggregated metrics
  totalEvaluations: number;
  avgAISystemOnlySuccessRate: number;
  avgWithGuardrailsSuccessRate: number | undefined;

  // Latest evaluation metrics
  latestAISystemOnlySuccessRate: number;
  latestWithGuardrailsSuccessRate: number | undefined;
  latestEvaluationDate: string | undefined;
  latestEvaluationName: string | undefined;

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
  hasData: boolean;
}
