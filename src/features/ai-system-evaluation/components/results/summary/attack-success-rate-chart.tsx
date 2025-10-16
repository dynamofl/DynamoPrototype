import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

interface AttackSuccessRateChartProps {
  summary: JailbreakEvaluationOutput["summary"];
  hasGuardrails?: boolean;
}

export function AttackSuccessRateChart({
  summary,
  hasGuardrails = false,
}: AttackSuccessRateChartProps) {
  // Prepare data for the area chart
  const chartData = Object.entries(summary.byAttackType || {}).map(
    ([attackType, stats]) => {
      // Calculate AI system-only success rate from the results
      // For now, use the summary-level rate as baseline, or individual calculation
      const aiSystemOnlyRate = summary.aiSystemOnlySuccessRate ?? stats.successRate;

      return {
        attackType: attackType,
        aiSystemOnly: aiSystemOnlyRate,
        withGuardrails: stats.successRate,
      };
    }
  );

  // Sort by attack type name for consistency
  chartData.sort((a, b) => a.attackType.localeCompare(b.attackType));

  // Chart configuration using only allowed colors: gray, red, green, amber
  const chartConfig = {
    aiSystemOnly: {
      label: "AI System Alone",
      color: "rgb(220 38 38)", // red-600
    },
    withGuardrails: {
      label: "AI System + Guardrails",
      color: "rgb(22 163 74)", // green-600
    },
  } satisfies ChartConfig;

  return (
    <div className="w-full border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="space-y-1 mb-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Attack Success Rate By Attack Type
        </h3>
        <p className="text-xs text-gray-600">
          Comparison of attack success rates across different jailbreak attack types
        </p>
      </div>

      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 12,
            left: 12,
            bottom: 0,
          }}
        >
          <CartesianGrid vertical={false} className="stroke-gray-200" />
          <XAxis
            dataKey="attackType"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "rgb(75 85 99)", fontSize: 11 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "rgb(75 85 99)", fontSize: 11 }}
            label={{
              value: "Success Rate (%)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "rgb(75 85 99)", fontSize: 11 },
            }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(value) => `Attack Type: ${value}`}
                formatter={(value) => [
                  `${Number(value).toFixed(1)}%`,
                ]}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />

          {hasGuardrails && (
            <Area
              dataKey="aiSystemOnly"
              type="natural"
              fill="rgb(254 202 202)"
              fillOpacity={0.4}
              stroke="rgb(220 38 38)"
              strokeWidth={2}
            />
          )}

          <Area
            dataKey={hasGuardrails ? "withGuardrails" : "aiSystemOnly"}
            type="natural"
            fill={hasGuardrails ? "rgb(187 247 208)" : "rgb(254 243 199)"}
            fillOpacity={0.4}
            stroke={hasGuardrails ? "rgb(22 163 74)" : "rgb(245 158 11)"}
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
