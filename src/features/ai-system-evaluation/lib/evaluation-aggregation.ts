// Evaluation Aggregation Helper Functions
// Aggregates metrics from multiple evaluations for summary visualization

import type { EvaluationTest } from '@/features/evaluation/types/evaluation-test';
import type { JailbreakEvaluationSummary } from '../types/jailbreak-evaluation';
import type { EvaluationSummaryData, EvaluationCategoryMetrics } from '../types/evaluation-summary';

/**
 * Get total unique topics count from evaluations
 * Uses metrics JSONB column from evaluations table
 */
export function getUniqueTopicsForEvaluations(
  evaluations: EvaluationTest[]
): number {
  return evaluations.reduce((sum, e) => {
    const uniqueTopics = (e.metrics as any)?.unique_topics ?? 0;
    return sum + uniqueTopics;
  }, 0);
}

/**
 * Get total unique attack areas count from evaluations
 * Uses metrics JSONB column from evaluations table
 */
export function getUniqueAttackAreasForEvaluations(
  evaluations: EvaluationTest[]
): number {
  return evaluations.reduce((sum, e) => {
    const uniqueAttackAreas = (e.metrics as any)?.unique_attack_areas ?? 0;
    return sum + uniqueAttackAreas;
  }, 0);
}

/**
 * Aggregate metrics from multiple evaluations
 * OPTIMIZED: Uses pre-calculated metrics from evaluations table columns
 * @param uniqueMetrics - Type-specific unique topics and attack areas counts
 */
export function aggregateEvaluationMetrics(
  evaluations: EvaluationTest[],
  uniqueMetrics?: {
    jailbreak: { uniqueTopics: number; uniqueAttackAreas: number };
    compliance: { uniqueTopics: number; uniqueAttackAreas: number };
    hallucination: { uniqueTopics: number; uniqueCategories: number };
  }
): EvaluationSummaryData {
  // Filter completed evaluations only
  // Check for either metrics JSONB OR legacy summaryMetrics structure
  const completedEvaluations = evaluations.filter(
    (evaluation) => evaluation.status === 'completed' && (
      evaluation.result?.overallMetrics ||
      (evaluation.metrics && Object.keys(evaluation.metrics).length > 0)
    )
  );

  if (completedEvaluations.length === 0) {
    return { hasData: false };
  }

  // Group evaluations by category (jailbreak/compliance/hallucination)
  // Use strict filtering - only count evaluations that are explicitly typed
  const jailbreakEvaluations = completedEvaluations.filter(
    (e) => e.type === 'jailbreak'
  );
  const complianceEvaluations = completedEvaluations.filter(
    (e) => e.type === 'compliance'
  );
  const hallucinationEvaluations = completedEvaluations.filter(
    (e) => e.type === 'hallucination'
  );

  const result: EvaluationSummaryData = { hasData: false };

  // Use type-specific unique counts if provided, otherwise fallback to evaluation-level counts
  const jailbreakUniqueTopics = uniqueMetrics?.jailbreak?.uniqueTopics ?? getUniqueTopicsForEvaluations(jailbreakEvaluations);
  const jailbreakUniqueAttackAreas = uniqueMetrics?.jailbreak?.uniqueAttackAreas ?? getUniqueAttackAreasForEvaluations(jailbreakEvaluations);
  const complianceUniqueTopics = uniqueMetrics?.compliance?.uniqueTopics ?? getUniqueTopicsForEvaluations(complianceEvaluations);
  const hallucinationUniqueTopics = uniqueMetrics?.hallucination?.uniqueTopics ?? getUniqueTopicsForEvaluations(hallucinationEvaluations);
  const hallucinationUniqueCategories = uniqueMetrics?.hallucination?.uniqueCategories ?? 0;

  // Process jailbreak evaluations - only show if 1 or more completed evaluations
  if (jailbreakEvaluations.length >= 1) {
    result.jailbreak = aggregateCategoryMetrics(
      jailbreakEvaluations,
      'jailbreak',
      jailbreakUniqueTopics,
      jailbreakUniqueAttackAreas
    );
    result.hasData = true;
  }

  // Process compliance evaluations - only show if 1 or more completed evaluations
  if (complianceEvaluations.length >= 1) {
    result.compliance = aggregateCategoryMetrics(
      complianceEvaluations,
      'compliance',
      complianceUniqueTopics,
      0 // Compliance doesn't have attack areas
    );
    result.hasData = true;
  }

  // Process hallucination evaluations - only show if 1 or more completed evaluations
  if (hallucinationEvaluations.length >= 1) {
    result.hallucination = aggregateCategoryMetrics(
      hallucinationEvaluations,
      'hallucination',
      hallucinationUniqueTopics,
      hallucinationUniqueCategories // Use categories instead of attack areas
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
  category: 'jailbreak' | 'compliance' | 'hallucination',
  uniqueTopics: number,
  uniqueAttackAreas: number
): EvaluationCategoryMetrics {
  const categoryLabel = category === 'jailbreak' ? 'Jailbreak' :
                        category === 'compliance' ? 'Compliance' :
                        'Hallucination';

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
    const metrics = evaluation.metrics as any;

    // Determine evaluation type
    const isCompliance = category === 'compliance';
    const isHallucination = category === 'hallucination';

    // PRIORITY 1: Use metrics JSONB column from evaluations table
    // These are the pre-calculated metrics stored as JSONB
    let aiSystemOnlyRate: number;
    let withGuardrailsRate: number;

    if (isCompliance) {
      // For compliance: Read from nested structure
      // Use compliance_rate directly (already in percentage format)
      aiSystemOnlyRate = metrics?.ai_system?.compliance_rate ?? 0;

      // Check if guardrails data exists and is meaningful
      // Guardrails are considered present if the with_guardrails object exists
      // and has different values OR if there are actual guardrail evaluations
      const hasGuardrailData = metrics?.ai_system_with_guardrails?.compliance_rate !== undefined
        && metrics?.ai_system_with_guardrails?.compliance_rate !== null;

      withGuardrailsRate = hasGuardrailData
        ? (metrics?.ai_system_with_guardrails?.compliance_rate ?? 0)
        : 0;
    } else if (isHallucination) {
      // For hallucination: Use safety rate (100 - hallucination_rate)
      // Higher is better for hallucination (means less hallucinations)
      const hallucinationRate = metrics?.hallucination_rate ?? 0;
      aiSystemOnlyRate = 100 - hallucinationRate;

      // Hallucination typically doesn't use guardrails in the same way
      withGuardrailsRate = 0;
    } else {
      // For jailbreak: Use existing flat structure
      aiSystemOnlyRate = metrics?.ai_system_attack_success_rate
        ?? overallMetrics?.summaryMetrics?.aiSystemAttackSuccessRate
        ?? overallMetrics?.aiSystem?.aiSystemOnlySuccessRate
        ?? overallMetrics?.aiSystemOnlySuccessRate
        ?? overallMetrics?.aiSystem?.successRate
        ?? overallMetrics?.successRate
        ?? 0;

      withGuardrailsRate = metrics?.ai_system_guardrail_attack_success_rate
        ?? metrics?.guardrail_success_rate
        ?? overallMetrics?.summaryMetrics?.aiSystemGuardrailAttackSuccessRate
        ?? overallMetrics?.aiSystem?.successRate
        ?? overallMetrics?.successRate
        ?? 0;
    }

    // Check if evaluation has guardrails
    // For compliance: Check if guardrails object exists and has different values
    // For jailbreak: Check if rates differ or if guardrail fields exist
    const hasGuardrails = isCompliance
      ? (
          metrics?.ai_system_with_guardrails?.compliance_rate !== undefined &&
          metrics?.ai_system_with_guardrails?.compliance_rate !== null &&
          (
            metrics?.ai_system_with_guardrails?.compliance_rate !== metrics?.ai_system?.compliance_rate ||
            metrics?.ai_system_with_guardrails?.tp !== metrics?.ai_system?.tp ||
            metrics?.ai_system_with_guardrails?.tn !== metrics?.ai_system?.tn ||
            metrics?.ai_system_with_guardrails?.fp !== metrics?.ai_system?.fp ||
            metrics?.ai_system_with_guardrails?.fn !== metrics?.ai_system?.fn
          )
        )
      : (
          aiSystemOnlyRate !== withGuardrailsRate ||
          (metrics?.guardrail_success_rate !== undefined && metrics?.guardrail_success_rate !== null) ||
          (overallMetrics?.aiSystem?.aiSystemOnlySuccessRate !== undefined && overallMetrics.aiSystem.aiSystemOnlySuccessRate !== overallMetrics.aiSystem.successRate) ||
          (overallMetrics?.aiSystemOnlySuccessRate !== undefined && overallMetrics.aiSystemOnlySuccessRate !== overallMetrics.successRate) ||
          (overallMetrics?.guardrails && overallMetrics.guardrails.length > 0)
        );

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
  // Return undefined if no guardrails so UI can show "--"
  const avgWithGuardrailsSuccessRate = evaluationsWithGuardrails > 0
    ? sumWithGuardrailsRate / evaluationsWithGuardrails
    : undefined;

  // Extract latest evaluation metrics
  // Sort by completedAt (most recent first), fallback to createdAt
  const sortedByCompletion = [...evaluations].sort(
    (a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt).getTime();
      const dateB = new Date(b.completedAt || b.createdAt).getTime();
      return dateB - dateA; // Descending order (newest first)
    }
  );

  const latestEvaluation = sortedByCompletion[0];
  const latestMetrics = latestEvaluation?.metrics as any;
  const isCompliance = category === 'compliance';

  // Helper function to check if an evaluation has meaningful guardrail data
  // Uses the same logic as the trend data hasGuardrails check
  const hasGuardrailDataForEvaluation = (evaluation: EvaluationTest): boolean => {
    const evalMetrics = evaluation.metrics as any;
    const overallMetrics = evaluation.result?.overallMetrics as any;

    if (isCompliance) {
      // For compliance: Check if guardrails object exists and has different values
      return evalMetrics?.ai_system_with_guardrails?.compliance_rate !== undefined &&
        evalMetrics?.ai_system_with_guardrails?.compliance_rate !== null &&
        (
          evalMetrics?.ai_system_with_guardrails?.compliance_rate !== evalMetrics?.ai_system?.compliance_rate ||
          evalMetrics?.ai_system_with_guardrails?.tp !== evalMetrics?.ai_system?.tp ||
          evalMetrics?.ai_system_with_guardrails?.tn !== evalMetrics?.ai_system?.tn ||
          evalMetrics?.ai_system_with_guardrails?.fp !== evalMetrics?.ai_system?.fp ||
          evalMetrics?.ai_system_with_guardrails?.fn !== evalMetrics?.ai_system?.fn
        );
    } else {
      // For jailbreak: Calculate rates using all possible sources
      const aiSystemOnlyRate = evalMetrics?.ai_system_attack_success_rate
        ?? overallMetrics?.summaryMetrics?.aiSystemAttackSuccessRate
        ?? overallMetrics?.aiSystem?.aiSystemOnlySuccessRate
        ?? overallMetrics?.aiSystemOnlySuccessRate
        ?? overallMetrics?.aiSystem?.successRate
        ?? overallMetrics?.successRate
        ?? 0;

      const withGuardrailsRate = evalMetrics?.ai_system_guardrail_attack_success_rate
        ?? evalMetrics?.guardrail_success_rate
        ?? overallMetrics?.summaryMetrics?.aiSystemGuardrailAttackSuccessRate
        ?? overallMetrics?.aiSystem?.successRate
        ?? overallMetrics?.successRate
        ?? 0;

      // Check if rates differ or if guardrail fields explicitly exist
      return aiSystemOnlyRate !== withGuardrailsRate ||
        (evalMetrics?.guardrail_success_rate !== undefined && evalMetrics?.guardrail_success_rate !== null) ||
        (overallMetrics?.aiSystem?.aiSystemOnlySuccessRate !== undefined && overallMetrics.aiSystem.aiSystemOnlySuccessRate !== overallMetrics.aiSystem.successRate) ||
        (overallMetrics?.aiSystemOnlySuccessRate !== undefined && overallMetrics.aiSystemOnlySuccessRate !== overallMetrics.successRate) ||
        (overallMetrics?.guardrails && overallMetrics.guardrails.length > 0);
    }
  };

  // Extract latest rates based on category (same logic as trend data extraction)
  let latestAISystemOnlySuccessRate: number;
  let latestWithGuardrailsSuccessRate: number | undefined;

  if (isCompliance) {
    latestAISystemOnlySuccessRate = latestMetrics?.ai_system?.compliance_rate ?? 0;
  } else {
    latestAISystemOnlySuccessRate = latestMetrics?.ai_system_attack_success_rate ?? 0;
  }

  // Find the latest evaluation that has guardrail data
  // This could be the latest evaluation or an earlier one if the latest doesn't have guardrails
  const latestEvaluationWithGuardrails = sortedByCompletion.find(
    (evaluation) => hasGuardrailDataForEvaluation(evaluation)
  );

  let latestGuardrailEvaluationDate: string | undefined;

  if (latestEvaluationWithGuardrails) {
    const guardrailMetrics = latestEvaluationWithGuardrails.metrics as any;
    const guardrailOverallMetrics = latestEvaluationWithGuardrails.result?.overallMetrics as any;
    latestGuardrailEvaluationDate = latestEvaluationWithGuardrails.completedAt || latestEvaluationWithGuardrails.createdAt;
    if (isCompliance) {
      latestWithGuardrailsSuccessRate = guardrailMetrics?.ai_system_with_guardrails?.compliance_rate;
    } else {
      // Use all possible sources for guardrail rate (same as trend data)
      latestWithGuardrailsSuccessRate = guardrailMetrics?.ai_system_guardrail_attack_success_rate
        ?? guardrailMetrics?.guardrail_success_rate
        ?? guardrailOverallMetrics?.summaryMetrics?.aiSystemGuardrailAttackSuccessRate;
    }
  } else {
    latestWithGuardrailsSuccessRate = undefined;
    latestGuardrailEvaluationDate = undefined;
  }

  return {
    category,
    categoryLabel,
    totalEvaluations: evaluations.length,
    avgAISystemOnlySuccessRate,
    avgWithGuardrailsSuccessRate,
    latestAISystemOnlySuccessRate,
    latestWithGuardrailsSuccessRate,
    latestEvaluationDate: latestEvaluation?.completedAt || latestEvaluation?.createdAt,
    latestEvaluationName: latestEvaluation?.name,
    latestGuardrailEvaluationDate,
    totalPrompts,
    totalUniqueTopics: uniqueTopics,
    totalUniqueAttackAreas: uniqueAttackAreas,
    trend,
  };
}
