import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { EvaluationTest } from "@/features/evaluation/types/evaluation-test";
import type { JailbreakEvaluationSummary } from "../../types/jailbreak-evaluation";

interface EvaluationListChartProps {
  evaluations: EvaluationTest[];
}

export function EvaluationListChart({ evaluations }: EvaluationListChartProps) {
  // Filter completed evaluations
  const completedEvaluations = evaluations.filter(
    (evaluation) => evaluation.status === "completed"
  );

  if (completedEvaluations.length === 0) {
    return null;
  }

  // Sort evaluations by created date (oldest to newest)
  const sortedEvaluations = [...completedEvaluations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Create time-series data for each evaluation
  const chartData = sortedEvaluations.map((evaluation) => {
    const date = new Date(evaluation.createdAt);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Get attack success rates from result.overallMetrics
    const overallMetrics = evaluation.result?.overallMetrics as JailbreakEvaluationSummary | undefined;

    // Debug: Log the evaluation data
    if (!overallMetrics) {
      // No metrics available for this evaluation
    }

    const aiSystemOnlyRate = overallMetrics?.aiSystemOnlySuccessRate ?? 0;
    const withGuardrailsRate = overallMetrics?.successRate ?? 0;

    // Check if evaluation has guardrails by comparing the two rates
    // If they differ, it means guardrails were used
    const hasGuardrails = aiSystemOnlyRate !== withGuardrailsRate;

    return {
      date: formattedDate,
      timestamp: date.getTime(),
      evaluationName: evaluation.name,
      aiSystemOnly: parseFloat(aiSystemOnlyRate.toFixed(1)),
      // Only show value for evaluations that actually have guardrails
      withGuardrails: hasGuardrails ? parseFloat(withGuardrailsRate.toFixed(1)) : null,
      hasGuardrails,
    };
  });

  // Check if we have any valid data points
  const hasValidData = chartData.some(
    (d) => d.aiSystemOnly > 0 || (d.withGuardrails !== null && d.withGuardrails > 0)
  );

  // Determine if any evaluation has guardrails - check if rates differ
  const hasAnyGuardrails = chartData.some((d) => d.hasGuardrails);

  // Chart configuration
  const chartConfig = {
    aiSystemOnly: {
      label: "AI System Alone",
      color: "hsl(var(--chart-1))", // blue
    },
    withGuardrails: {
      label: "AI System + Guardrails",
      color: "hsl(var(--chart-2))", // green/teal
    },
  } satisfies ChartConfig;

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Card 1: Chart */}
      <div className="col-span-2 border border-gray-200 rounded-lg bg-gray-50">
        <div className="p-4 pb-0">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-900">
              Attack Success Rate Over Time
            </h3>
            <p className="text-xs text-gray-600">
              Tracking attack success rate trends across completed evaluations
              {!hasValidData && " (No data available - check console for debug info)"}
            </p>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[350px] w-full p-4">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 0,
            right: 0,
            top: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={[0, 100]}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <defs>
            <linearGradient id="fillAiSystemOnly" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-aiSystemOnly)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-aiSystemOnly)"
                stopOpacity={0.1}
              />
            </linearGradient>
            <linearGradient id="fillWithGuardrails" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-withGuardrails)"
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor="var(--color-withGuardrails)"
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>

          {/* AI System + Guardrails - render first (behind) */}
          {hasAnyGuardrails && (
            <Area
              dataKey="withGuardrails"
              type="natural"
              fill="url(#fillWithGuardrails)"
              stroke="var(--color-withGuardrails)"
              connectNulls={false}
              strokeWidth={2}
            />
          )}

          {/* AI System Alone - render second (in front) with transparency */}
          <Area
            dataKey="aiSystemOnly"
            type="natural"
            fill="url(#fillAiSystemOnly)"
            stroke="var(--color-aiSystemOnly)"
            strokeWidth={2}
          />
        </AreaChart>
        </ChartContainer>
      </div>

      {/* Card 2: Summary Stats */}
      <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
        <div className="space-y-1 mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Summary Statistics
          </h3>
          <p className="text-xs text-gray-600">
            Overall performance metrics
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-600">Total Evaluations</p>
            <p className="text-2xl font-bold text-gray-900">{completedEvaluations.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Avg AI System ASR</p>
            <p className="text-2xl font-bold text-blue-600">
              {(chartData.reduce((sum, d) => sum + d.aiSystemOnly, 0) / chartData.length).toFixed(1)}%
            </p>
          </div>
          {hasAnyGuardrails && (
            <div>
              <p className="text-xs text-gray-600">Avg With Guardrails ASR</p>
              <p className="text-2xl font-bold text-green-600">
                {(chartData.filter(d => d.hasGuardrails).reduce((sum, d) => sum + (d.withGuardrails || 0), 0) / chartData.filter(d => d.hasGuardrails).length).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
