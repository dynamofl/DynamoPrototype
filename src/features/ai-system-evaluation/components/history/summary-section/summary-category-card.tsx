// Category Card Component - Displays aggregated metrics for a category (Jailbreak/Compliance)

import { Badge } from '@/components/ui/badge';
import type { EvaluationCategoryMetrics } from '../../../types/evaluation-summary';
import { SummaryMetricCard } from './summary-metric-card';

interface SummaryCategoryCardProps {
  metrics: EvaluationCategoryMetrics;
}

export function SummaryCategoryCard({ metrics }: SummaryCategoryCardProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          {metrics.categoryLabel} Evaluations
        </h3>
        <Badge variant="secondary" className="text-xs">
          {metrics.totalEvaluations} {metrics.totalEvaluations === 1 ? 'Test' : 'Tests'}
        </Badge>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Total Evaluations */}
        <SummaryMetricCard
          label="Total Tests"
          value={metrics.totalEvaluations}
          variant="default"
        />

        {/* Avg AI System Only Success Rate */}
        <SummaryMetricCard
          label="Avg ASR (AI Only)"
          value={`${metrics.avgAISystemOnlySuccessRate.toFixed(1)}%`}
          description="Without Guardrails"
          variant="danger"
        />

        {/* Avg With Guardrails Success Rate */}
        <SummaryMetricCard
          label="Avg ASR (With Guardrails)"
          value={`${metrics.avgWithGuardrailsSuccessRate.toFixed(1)}%`}
          description="With Guardrails Enabled"
          variant="success"
        />

        {/* Total Prompts */}
        <SummaryMetricCard
          label="Total Prompts"
          value={metrics.totalPrompts}
          description="Across all tests"
          variant="default"
        />

        {/* Total Topics */}
        <SummaryMetricCard
          label="Total Topics"
          value={metrics.totalUniqueTopics}
          description="Unique topic areas"
          variant="default"
        />

        {/* Total Attack Areas */}
        <SummaryMetricCard
          label="Total Attack Areas"
          value={metrics.totalUniqueAttackAreas}
          description="Unique attack types"
          variant="default"
        />
      </div>
    </div>
  );
}
