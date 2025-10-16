// Trend Chart Component - Shows attack success rate trends over time

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

interface SummaryTrendChartProps {
  data: Array<{
    date: string;
    timestamp: number;
    evaluationName: string;
    aiSystemOnlyRate: number;
    withGuardrailsRate: number | null;
  }>;
  hasGuardrails: boolean;
  categoryLabel: string;
}

export function SummaryTrendChart({
  data,
  hasGuardrails,
  categoryLabel,
}: SummaryTrendChartProps) {
  // Chart configuration using blue color palette as specified
  const chartConfig = {
    aiSystemOnly: {
      label: 'AI System Only',
      color: 'hsl(217 91% 60%)', // blue-500
    },
    withGuardrails: {
      label: 'AI System + Guardrails',
      color: 'hsl(221 83% 53%)', // blue-600
    },
  } satisfies ChartConfig;

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-50">
      <div className="p-4 pb-0">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-900">
            {categoryLabel} Attack Success Rate Trend
          </h3>
          <p className="text-xs text-gray-600">
            Tracking attack success rate trends across evaluations over time
          </p>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="h-[350px] w-full p-4">
        <AreaChart
          accessibilityLayer
          data={data}
          margin={{
            left: 0,
            right: 0,
            top: 10,
            bottom: 10,
          }}
        >
          <CartesianGrid vertical={false} className="stroke-gray-200" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: 'rgb(75 85 99)', fontSize: 11 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            domain={[0, 100]}
            tick={{ fill: 'rgb(75 85 99)', fontSize: 11 }}
            label={{
              value: 'Success Rate (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: 'rgb(75 85 99)', fontSize: 11 },
            }}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
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

          {/* AI System + Guardrails - render first (behind) if guardrails exist */}
          {hasGuardrails && (
            <Area
              dataKey="withGuardrails"
              type="natural"
              fill="url(#fillWithGuardrails)"
              stroke="var(--color-withGuardrails)"
              connectNulls={false}
              strokeWidth={2}
            />
          )}

          {/* AI System Only - render second (in front) */}
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
  );
}
