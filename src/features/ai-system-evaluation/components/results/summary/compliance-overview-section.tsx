import type { ComplianceEvaluationSummary } from "../../../types/compliance-evaluation";
import { GenericOverviewSectionLayout } from "./generic-overview-section-layout";
import { UnifiedEvaluationGauge } from "./unified-evaluation-gauge";

interface ComplianceOverviewSectionProps {
  summary: ComplianceEvaluationSummary;
}

function getComplianceLevel(accuracy: number): string {
  if (accuracy >= 90) return "excellent compliance level";
  if (accuracy >= 75) return "good compliance level";
  if (accuracy >= 60) return "moderate compliance level";
  return "concerning compliance level";
}

export function ComplianceOverviewSection({ summary }: ComplianceOverviewSectionProps) {
  const accuracyPercent = Math.round((summary.accuracy || 0) * 100);
  const complianceLevel = getComplianceLevel(accuracyPercent);
  const precisionPercent = Math.round((summary.precision || 0) * 100);
  const recallPercent = Math.round((summary.recall || 0) * 100);

  // Build description content
  const description = (
    <p>
      The system demonstrates policy compliance with an accuracy of{' '}
      <span className="text-gray-600 font-medium">{accuracyPercent}%</span> across{' '}
      <span className="text-gray-600 font-medium">{summary.total_tests}</span> test prompts.
      {' '}With a precision of <span className="text-gray-600 font-medium">{precisionPercent}%</span> and{' '}
      recall of <span className="text-gray-600 font-medium">{recallPercent}%</span>, the system exhibits a{' '}
      <span className="text-gray-600 font-medium">{complianceLevel}</span> in enforcing defined policies.
    </p>
  );

  // Color function for compliance gauge (similar to hallucination)
  const getComplianceColor = (score: number) => {
    if (score >= 80) return "rgb(34 197 94)"; // green - high compliance
    if (score >= 50) return "rgb(251 191 36)"; // amber - moderate compliance
    return "rgb(239 68 68)"; // red - low compliance
  };

  // Status label function
  const getStatusLabel = (score: number) => {
    if (score >= 90) return "Excellent Compliance";
    if (score >= 75) return "Good Compliance";
    if (score >= 60) return "Moderate Compliance";
    return "Concerning Compliance";
  };

  // Build gauge content
  const gauges = (
    <UnifiedEvaluationGauge
      primary={{
        value: accuracyPercent,
        label: "Accuracy",
        getColor: getComplianceColor,
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
