// Summary Metric Card - Single card with header, metrics, and chart
// Matches the new Figma design with cleaner layout

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

interface SummaryMetricCardDetailedProps {
  title: string;

  // Summary stats (shown at top as bullet list)
  stats?: Array<{
    label: string;
    value: string | number;
  }>;

  // Metric values
  aiSystemAvg?: string | number;
  aiSystemGuardrailAvg?: string | number;

  // Chart data
  chartData?: Array<{
    date: string;
    aiSystemOnly: number;
    withGuardrails?: number;
  }>;

  // Empty state
  isEmpty?: boolean;
  emptyMessage?: string;
}

export function SummaryMetricCardDetailed({
  title,
  stats,
  aiSystemAvg,
  aiSystemGuardrailAvg,
  chartData,
  isEmpty = false,
  emptyMessage = 'No Evaluation Data to Display',
}: SummaryMetricCardDetailedProps) {
  const hasGuardrails = chartData?.some(d => d.withGuardrails !== undefined);

  // Chart configuration
  const chartConfig = {
    aiSystemOnly: {
      label: 'AI System',
      color: '#3B82F6', // blue-500
    },
    withGuardrails: {
      label: 'AI System + Guardrails',
      color: '#1E40AF', // blue-700
    },
  } satisfies ChartConfig;

  return (
    <div className="bg-gray-0 border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      {/* Header Section */}
      <div className="border-b border-dashed border-gray-200 pb-3 flex flex-col gap-0.5">
        <h3 className="text-[13px] font-550 text-gray-900 leading-5">
          {title}
        </h3>

        {/* Stats bullet list */}
        {stats && stats.length > 0 && (
          <div className="flex items-center gap-1 text-xs font-425 text-gray-600 leading-5">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && <span>•</span>}
                <span className="whitespace-nowrap">
                  {stat.value} {stat.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="flex flex-col gap-3">
          {/* Metrics Row with dashes */}
          <div className="flex items-center justify-between h-12">
            {/* AI System ASR */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-425 text-gray-600 leading-5">
                AI System ASR
              </p>
              <p className="text-xl font-550 text-gray-900 leading-6 tracking-[-0.3px]">
                --
              </p>
            </div>

            {/* AI System + Guardrail ASR */}
            <div className="flex flex-col gap-1 text-right">
              <p className="text-xs font-425 text-gray-600 leading-5 whitespace-nowrap">
                AI System + Guardrail ASR
              </p>
              <p className="text-xl font-550 text-gray-900 leading-6 tracking-[-0.3px] whitespace-nowrap">
                --
              </p>
            </div>
          </div>

          {/* Empty message */}
          <div className="flex items-center justify-center h-[94px]">
            <p className="text-xs font-425 text-gray-500 leading-4">
              {emptyMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Metrics Row */}
          <div className="flex items-center justify-between h-12">
            {/* AI System ASR */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-425 text-gray-600 leading-5">
                AI System ASR
              </p>
              <p className="text-xl font-550 text-gray-900 leading-6 tracking-[-0.3px]">
                {aiSystemAvg ?? '--'}
              </p>
            </div>

            {/* AI System + Guardrail ASR */}
            <div className="flex flex-col gap-1 text-right">
              <p className="text-xs font-425 text-gray-600 leading-5 whitespace-nowrap">
                AI System + Guardrail ASR
              </p>
              <p className="text-xl font-550 text-gray-900 leading-6 tracking-[-0.3px] whitespace-nowrap">
                {aiSystemGuardrailAvg ?? '--'}
              </p>
            </div>
          </div>

          {/* Chart Section */}
          {chartData && chartData.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="h-[70px] w-full">
                <ChartContainer
                  config={chartConfig}
                  className="h-full w-full [&>div]:h-full [&>div]:w-full"
                  style={{ height: '70px', width: '100%', aspectRatio: 'auto' }}
                >
                  <AreaChart
                    data={chartData}
                    margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    height={70}
                    width={500}
                  >
                  <CartesianGrid vertical={false} className="stroke-gray-200" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={false}
                    hide={true}
                  />

                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />

                  <defs>
                    <linearGradient id="fillAiSystemOnly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="fillWithGuardrails" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E40AF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1E40AF" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>

                  {/* With Guardrails - render first (behind) */}
                  {hasGuardrails && (
                    <Area
                      dataKey="withGuardrails"
                      type="natural"
                      fill="url(#fillWithGuardrails)"
                      stroke="#1E40AF"
                      strokeWidth={2}
                      connectNulls={false}
                    />
                  )}

                  {/* AI System Only - render second (in front) */}
                  <Area
                    dataKey="aiSystemOnly"
                    type="natural"
                    fill="url(#fillAiSystemOnly)"
                    stroke="#3B82F6"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
              </div>

              {/* Date labels */}
              {chartData.length > 0 && (
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-425 text-gray-600 leading-4">
                    {chartData[0].date}
                  </span>
                  <span className="text-xs font-425 text-gray-600 leading-4">
                    {chartData[chartData.length - 1].date}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
