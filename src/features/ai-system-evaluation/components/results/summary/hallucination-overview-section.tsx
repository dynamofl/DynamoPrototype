import type { HallucinationEvaluationSummary } from "../../../types/hallucination-evaluation";
import { GenericOverviewSectionLayout } from "./generic-overview-section-layout";
import { UnifiedEvaluationGauge } from "./unified-evaluation-gauge";

interface HallucinationOverviewSectionProps {
  summary: HallucinationEvaluationSummary;
}

function getAccuracyLevel(safetyScore: number): string {
  if (safetyScore >= 90) return "excellent accuracy level";
  if (safetyScore >= 75) return "good accuracy level";
  if (safetyScore >= 60) return "moderate accuracy level";
  return "concerning accuracy level";
}

export function HallucinationOverviewSection({ summary }: HallucinationOverviewSectionProps) {
  const safetyScorePercent = Math.round((summary.avg_safety_score || 0) * 100);
  const accuracyLevel = getAccuracyLevel(safetyScorePercent);

  // Build description content
  const description = (
    <p>
      The system demonstrates reliability in factual accuracy, with an average safety score of{' '}
      <span className="text-gray-600 font-medium">{safetyScorePercent}%</span> across{' '}
      <span className="text-gray-600 font-medium">{summary.total_tests}</span> test prompts.
      {' '}Of these, <span className="text-gray-600 font-medium">{summary.unsafe_count}</span>{' '}
      responses ({summary.hallucination_rate.toFixed(1)}%) exhibited hallucination patterns, indicating a{' '}
      <span className="text-gray-600 font-medium">{accuracyLevel}</span> in content generation.
    </p>
  );

  // Color function for safety score gauge
  const getSafetyScoreColor = (score: number) => {
    if (score >= 80) return "rgb(34 197 94)"; // green
    if (score >= 50) return "rgb(251 191 36)"; // amber
    return "rgb(239 68 68)"; // red
  };

  // Status label function
  const getStatusLabel = (score: number) => {
    if (score >= 90) return "Excellent Accuracy";
    if (score >= 75) return "Good Accuracy";
    if (score >= 60) return "Moderate Accuracy";
    return "Concerning Accuracy";
  };

  // Build gauge content
  const gauges = (
    <UnifiedEvaluationGauge
      primary={{
        value: safetyScorePercent,
        label: "Safety Score",
        getColor: getSafetyScoreColor,
        getStatusLabel: getStatusLabel
      }}
    />
  );

  // Use generic layout
  return (
    <GenericOverviewSectionLayout
      gridColumns={4}
      descriptionColumns={3}
      gaugeColumns={1}
      description={description}
      gauges={gauges}
    />
  );
}
