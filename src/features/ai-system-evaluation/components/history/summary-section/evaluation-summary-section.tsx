// Main Evaluation Summary Section Component
// Displays aggregated metrics and trends across all evaluations

import { Skeleton } from '@/components/ui/skeleton';
import type { EvaluationTest } from '@/features/evaluation/types/evaluation-test';
import { useEvaluationSummaryData } from '../../../hooks/useEvaluationSummaryData';
import { SummaryMetricCardDetailed } from './summary-metric-card-detailed';

interface EvaluationSummarySectionProps {
  evaluations: EvaluationTest[];
}

export function EvaluationSummarySection({
  evaluations,
}: EvaluationSummarySectionProps) {
  const { data, loading, error } = useEvaluationSummaryData(evaluations);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 px-4">
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-4">
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <p className="text-sm font-medium text-red-900">
            Failed to Load Summary Data
          </p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // No data state - don't render anything if no data (requires 2+ completed evaluations per category)
  if (!data || !data.hasData) {
    return null;
  }

  // Prepare jailbreak chart data
  const jailbreakChartData = data.jailbreak?.trend.map((t) => ({
    date: t.date,
    aiSystemOnly: t.aiSystemOnlyRate,
    withGuardrails: t.withGuardrailsRate ?? undefined,
  }));

  // Prepare jailbreak stats - format as "X Test • Y Prompts • Z Topics • W Attack Area"
  const jailbreakStats = data.jailbreak ? [
    { label: 'Evaluations', value: data.jailbreak.totalEvaluations },
    { label: 'Prompts', value: data.jailbreak.totalPrompts.toLocaleString() },
    { label: 'Topics', value: data.jailbreak.totalUniqueTopics },
    { label: 'Attack Area', value: data.jailbreak.totalUniqueAttackAreas },
  ] : undefined;

  // Prepare compliance chart data if available
  const complianceChartData = data.compliance?.trend.map((t) => ({
    date: t.date,
    aiSystemOnly: t.aiSystemOnlyRate,
    withGuardrails: t.withGuardrailsRate ?? undefined,
  }));

  // Prepare compliance stats
  const complianceStats = data.compliance ? [
    { label: 'Evaluations', value: data.compliance.totalEvaluations },
    { label: 'Prompts', value: data.compliance.totalPrompts.toLocaleString() },
  ] : undefined;

  return (
    <div className="px-4">
      <div className="grid grid-cols-3 gap-3">
        {/* Jailbreak Card */}
        {data.jailbreak ? (
          <SummaryMetricCardDetailed
            title="Jailbreak"
            stats={jailbreakStats}
            aiSystemAvg={`${data.jailbreak.avgAISystemOnlySuccessRate.toFixed(0)}%`}
            aiSystemGuardrailAvg={`${data.jailbreak.avgWithGuardrailsSuccessRate.toFixed(0)}%`}
            chartData={jailbreakChartData}
          />
        ) : (
          <SummaryMetricCardDetailed
            title="Jailbreak"
            isEmpty={true}
            emptyMessage="No Evaluation Data to Display"
          />
        )}

        {/* Compliance Card */}
        {data.compliance ? (
          <SummaryMetricCardDetailed
            title="System Compliance"
            stats={complianceStats}
            aiSystemAvg={`${data.compliance.avgAISystemOnlySuccessRate.toFixed(0)}%`}
            aiSystemGuardrailAvg={`${data.compliance.avgWithGuardrailsSuccessRate.toFixed(0)}%`}
            chartData={complianceChartData}
          />
        ) : (
          <SummaryMetricCardDetailed
            title="System Compliance"
            isEmpty={true}
            emptyMessage="No Evaluation Data to Display"
          />
        )}

        {/* Hallucination Card - Empty State */}
        <SummaryMetricCardDetailed
          title="Hallucination"
          isEmpty={true}
          emptyMessage="No Evaluation Data to Display"
        />
      </div>
    </div>
  );
}
