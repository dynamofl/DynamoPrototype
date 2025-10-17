// Evaluation Aggregation Helper Functions
// Aggregates metrics from multiple evaluations for summary visualization

import { supabase } from '@/lib/supabase/client';
import type { EvaluationTest } from '@/features/evaluation/types/evaluation-test';
import type { JailbreakEvaluationSummary } from '../types/jailbreak-evaluation';
import type { EvaluationSummaryData, EvaluationCategoryMetrics } from '../types/evaluation-summary';

/**
 * Get total unique topics count from evaluations
 * OPTIMIZED: Uses unique_topics column from evaluations table
 */
export function getUniqueTopicsForEvaluations(
  evaluations: EvaluationTest[]
): number {
  return evaluations.reduce((sum, e) => sum + (e.uniqueTopics || 0), 0);
}

/**
 * Get total unique attack areas count from evaluations
 * OPTIMIZED: Uses unique_attack_areas column from evaluations table
 */
export function getUniqueAttackAreasForEvaluations(
  evaluations: EvaluationTest[]
): number {
  return evaluations.reduce((sum, e) => sum + (e.uniqueAttackAreas || 0), 0);
}

/**
 * Aggregate metrics from multiple evaluations
 * OPTIMIZED: Uses pre-calculated metrics from evaluations table columns
 */
export function aggregateEvaluationMetrics(
  evaluations: EvaluationTest[]
): EvaluationSummaryData {
  // Filter completed evaluations only
  // Check for either new direct columns OR legacy summaryMetrics structure
  const completedEvaluations = evaluations.filter(
    (evaluation) => evaluation.status === 'completed' && (
      evaluation.result?.overallMetrics ||
      evaluation.aiSystemAttackSuccessRate !== undefined ||
      evaluation.aiSystemGuardrailAttackSuccessRate !== undefined
    )
  );

  console.log('📊 [Aggregation] Completed evaluations with data:', completedEvaluations.length, {
    total: evaluations.length,
    completed: evaluations.filter(e => e.status === 'completed').length,
    withMetrics: completedEvaluations.length
  });

  if (completedEvaluations.length === 0) {
    return { hasData: false };
  }

  // Group evaluations by category (jailbreak/compliance)
  const jailbreakEvaluations = completedEvaluations.filter(
    (e) => (e.type || 'jailbreak') === 'jailbreak'
  );
  const complianceEvaluations = completedEvaluations.filter(
    (e) => e.type === 'compliance'
  );

  const result: EvaluationSummaryData = { hasData: false };

  // Calculate unique metrics from all completed evaluations
  const uniqueTopics = getUniqueTopicsForEvaluations(completedEvaluations);
  const uniqueAttackAreas = getUniqueAttackAreasForEvaluations(completedEvaluations);

  // Process jailbreak evaluations
  if (jailbreakEvaluations.length > 0) {
    result.jailbreak = aggregateCategoryMetrics(
      jailbreakEvaluations,
      'jailbreak',
      uniqueTopics,
      uniqueAttackAreas
    );
    result.hasData = true;
  }

  // Process compliance evaluations
  if (complianceEvaluations.length > 0) {
    result.compliance = aggregateCategoryMetrics(
      complianceEvaluations,
      'compliance',
      uniqueTopics,
      uniqueAttackAreas
    );
    result.hasData = true;
  }

  return result;
}

/**
 * Aggregate metrics for a specific category
 */
function aggregateCategoryMetrics(
  evaluations: EvaluationTest[],
  category: 'jailbreak' | 'compliance',
  uniqueTopics: number,
  uniqueAttackAreas: number
): EvaluationCategoryMetrics {
  const categoryLabel = category === 'jailbreak' ? 'Jailbreak' : 'Compliance';

  // Calculate aggregated metrics
  let totalPrompts = 0;
  let sumAISystemOnlyRate = 0;
  let sumWithGuardrailsRate = 0;
  let evaluationsWithGuardrails = 0; // Track how many evaluations actually have guardrails

  // Sort evaluations by created date (oldest to newest)
  const sortedEvaluations = [...evaluations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Build trend data for chart
  const trend = sortedEvaluations.map((evaluation) => {
    const date = new Date(evaluation.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    // Get summary metrics from evaluation
    const overallMetrics = evaluation.result?.overallMetrics as JailbreakEvaluationSummary | undefined;

    console.log(`📈 [Aggregation] ${category} - ${evaluation.name} - Raw metrics:`, {
      overallMetrics,
      hasOverallMetrics: !!overallMetrics,
      summaryMetricsType: typeof overallMetrics,
    });

    // PRIORITY 1: Use direct columns from evaluations table (NEW)
    // These are the pre-calculated metrics stored as individual columns
    const aiSystemOnlyRate = evaluation.aiSystemAttackSuccessRate
      ?? overallMetrics?.summaryMetrics?.aiSystemAttackSuccessRate
      ?? overallMetrics?.aiSystem?.aiSystemOnlySuccessRate
      ?? overallMetrics?.aiSystemOnlySuccessRate
      ?? overallMetrics?.aiSystem?.successRate
      ?? overallMetrics?.successRate
      ?? 0;

    // Use guardrailSuccessRate which represents the success rate when guardrails are applied
    const withGuardrailsRate = evaluation.guardrailSuccessRate
      ?? evaluation.aiSystemGuardrailAttackSuccessRate
      ?? overallMetrics?.summaryMetrics?.aiSystemGuardrailAttackSuccessRate
      ?? overallMetrics?.aiSystem?.successRate
      ?? overallMetrics?.successRate
      ?? 0;

    // Check if evaluation has guardrails
    // If the two rates are different, it means guardrails were used
    const hasGuardrails = (
      aiSystemOnlyRate !== withGuardrailsRate ||
      (evaluation.guardrailSuccessRate !== undefined && evaluation.guardrailSuccessRate !== null) ||
      (overallMetrics?.aiSystem?.aiSystemOnlySuccessRate !== undefined && overallMetrics.aiSystem.aiSystemOnlySuccessRate !== overallMetrics.aiSystem.successRate) ||
      (overallMetrics?.aiSystemOnlySuccessRate !== undefined && overallMetrics.aiSystemOnlySuccessRate !== overallMetrics.successRate) ||
      (overallMetrics?.guardrails && overallMetrics.guardrails.length > 0)
    );

    console.log(`📈 [Aggregation] ${category} - ${evaluation.name}:`, {
      aiSystemOnlyRate,
      withGuardrailsRate,
      hasGuardrails,
      fromDirectColumns: {
        aiSystemAttackSuccessRate: evaluation.aiSystemAttackSuccessRate,
        aiSystemGuardrailAttackSuccessRate: evaluation.aiSystemGuardrailAttackSuccessRate,
        guardrailSuccessRate: evaluation.guardrailSuccessRate
      },
      fromJSONB: {
        aiSystemOnlySuccessRate: overallMetrics?.aiSystemOnlySuccessRate,
        successRate: overallMetrics?.successRate,
        totalTests: overallMetrics?.totalTests
      }
    });

    // Accumulate for averages
    // Use progress.total as fallback since it's always available
    totalPrompts += overallMetrics?.totalTests ?? evaluation.progress?.total ?? 0;
    sumAISystemOnlyRate += aiSystemOnlyRate;

    // Only accumulate withGuardrailsRate for evaluations that actually have guardrails
    if (hasGuardrails) {
      sumWithGuardrailsRate += withGuardrailsRate;
      evaluationsWithGuardrails++;
    }

    return {
      date: formattedDate,
      timestamp: date.getTime(),
      evaluationName: evaluation.name,
      aiSystemOnlyRate: parseFloat(aiSystemOnlyRate.toFixed(1)),
      withGuardrailsRate: hasGuardrails ? parseFloat(withGuardrailsRate.toFixed(1)) : null,
    };
  });

  // Calculate averages
  const avgAISystemOnlySuccessRate = evaluations.length > 0
    ? sumAISystemOnlyRate / evaluations.length
    : 0;

  // Only average guardrail rates for evaluations that actually have guardrails
  const avgWithGuardrailsSuccessRate = evaluationsWithGuardrails > 0
    ? sumWithGuardrailsRate / evaluationsWithGuardrails
    : 0;

  console.log(`🎯 [Aggregation] ${category} Final Averages:`, {
    totalEvaluations: evaluations.length,
    evaluationsWithGuardrails,
    sumAISystemOnlyRate,
    sumWithGuardrailsRate,
    avgAISystemOnlySuccessRate: avgAISystemOnlySuccessRate.toFixed(1) + '%',
    avgWithGuardrailsSuccessRate: avgWithGuardrailsSuccessRate.toFixed(1) + '%'
  });

  return {
    category,
    categoryLabel,
    totalEvaluations: evaluations.length,
    avgAISystemOnlySuccessRate,
    avgWithGuardrailsSuccessRate,
    totalPrompts,
    totalUniqueTopics: uniqueTopics,
    totalUniqueAttackAreas: uniqueAttackAreas,
    trend,
  };
}
