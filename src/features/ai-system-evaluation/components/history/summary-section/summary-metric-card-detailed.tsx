// Summary Metric Card - Single card with header, metrics, and chart
// Matches the new Figma design with cleaner layout

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';

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
    withGuardrails?: number | null;
  }>;

  // Custom labels (optional, defaults to ASR labels)
  aiSystemLabel?: string;
  aiSystemGuardrailLabel?: string;

  // Empty state
  isEmpty?: boolean;
  emptyMessage?: string;
}

/**
 * Prepare chart data - add solid and dotted guardrail lines to single dataset
 */
function prepareChartData(data: Array<{
  date: string;
  aiSystemOnly: number;
  withGuardrails?: number | null;
}>) {
  if (!data || data.length === 0) return data;

  // Find first and last non-null guardrail values
  const firstGuardrailIndex = data.findIndex(
    d => d.withGuardrails !== null && d.withGuardrails !== undefined
  );
  const lastGuardrailIndex = data.length - 1 - [...data].reverse().findIndex(
    d => d.withGuardrails !== null && d.withGuardrails !== undefined
  );

  // If no guardrail data exists at all
  if (firstGuardrailIndex === -1) {
    return data;
  }

  const firstGuardrailValue = data[firstGuardrailIndex].withGuardrails!;
  const lastGuardrailValue = data[lastGuardrailIndex].withGuardrails!;

  // Create single dataset with both solid and dotted lines
  return data.map((point, index) => {
    const result = { ...point } as any;

    // Solid line (actual guardrail data)
    if (index >= firstGuardrailIndex && index <= lastGuardrailIndex) {
      result.withGuardrailsSolid = point.withGuardrails ?? undefined;
    }

    // Leading dotted line (before first guardrail)
    if (index <= firstGuardrailIndex) {
      result.withGuardrailsLeadingDotted = firstGuardrailValue;
    }

    // Trailing dotted line (after last guardrail)
    if (index >= lastGuardrailIndex) {
      result.withGuardrailsTrailingDotted = lastGuardrailValue;
    }

    return result;
  });
}

export function SummaryMetricCardDetailed({
  title,
  stats,
  aiSystemAvg,
  aiSystemGuardrailAvg,
  chartData,
  aiSystemLabel = 'AI System ASR',
  aiSystemGuardrailLabel = 'AI System + Guardrail ASR',
  isEmpty = false,
  emptyMessage = 'No Evaluation Data to Display',
}: SummaryMetricCardDetailedProps) {
  // Check if chart data has guardrails (for chart line rendering)
  const hasGuardrailsInChart = chartData?.some(d => d.withGuardrails !== undefined && d.withGuardrails !== null);

  // Check if guardrail metric should be shown (only if we have a guardrail value to display)
  const showGuardrailMetric = aiSystemGuardrailAvg !== undefined && aiSystemGuardrailAvg !== null;

  // Prepare chart data - single dataset with both solid and dotted lines
  const processedChartData = chartData ? prepareChartData(chartData) : undefined;

  // Chart configuration - only include items that should appear in tooltip
  const chartConfig = {
    aiSystemOnly: {
      label: 'AI System',
      color: 'var(--chart-1)',
    },
    withGuardrailsSolid: {
      label: 'AI System + Guardrails',
      color: 'var(--chart-2)',
    },
  } satisfies ChartConfig;

  // Color for dotted lines (not in chartConfig to hide from tooltip)
  const guardrailColor = 'var(--chart-2)';

  return (
    <div className="bg-gray-0 border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
      {/* Header Section */}
      <div className="border-b border-dashed border-gray-200 pb-3 flex flex-col gap-0.5">
        <h3 className="text-[13px] font-550 text-gray-900 leading-5">
          {title}
        </h3>

        {/* Stats bullet list */}
        {stats && stats.length > 0 ? (
          <div className="flex items-center gap-1 text-xs font-400 text-gray-600 leading-5">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center gap-1">
                {index > 0 && <span>•</span>}
                <span className="whitespace-nowrap">
                  {stat.value} {stat.label}
                </span>
              </div>
            ))}
          </div>
        ) : <div className='flex text-xs font-400 text-gray-600 leading-5'> No Evaluations Data to Display</div>}
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className="flex flex-col gap-3">
          {/* Metrics Row with dashes */}
          <div className="flex items-center justify-between h-12">
            {/* AI System metric */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-425 text-gray-600 leading-5">
                  {aiSystemLabel}
                </p>
                <div className="w-2 h-2 rounded-full bg-[--chart-1]" />
              </div>
              <p className="text-xl font-550 text-gray-900 leading-6 tracking-[-0.3px]">
                --
              </p>
            </div>

            {/* AI System + Guardrail metric */}
            <div className="flex flex-col gap-1 text-right">
              <div className="flex items-center gap-1.5 justify-end">
                <div className="w-2 h-2 rounded-full bg-[--chart-2]" />
                <p className="text-xs font-425 text-gray-600 leading-5 whitespace-nowrap">
                  {aiSystemGuardrailLabel}
                </p>
              </div>
              <p className="text-xl font-550 text-gray-900 leading-6 tracking-[-0.3px] whitespace-nowrap">
                --
              </p>
            </div>
          </div>

          {/* Empty message */}

           <div className="relative h-[70px] w-full rounded-md overflow-hidden flex items-center justify-center">
                {/* Dotted background pattern */}
                <div className=''>
                  
                  <Button size="sm" variant="outline" className='relative z-[1] gap-1'><Plus /> {emptyMessage}</Button>
                </div>
                 
                <div
                  className="absolute inset-0 [background-size:8px_8px] [background-image:radial-gradient(#e5e7eb_1px,transparent_1px)] dark:[background-image:radial-gradient(#404040_0.5px,transparent_0.5px)]"
                  aria-hidden="true"
                />
                 
                </div>
          <div className="flex items-center justify-center h-[24px]">
          
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Metrics Row */}
          <div className="flex items-center justify-between h-12">
            {/* AI System metric */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-425 text-gray-600 leading-5">
                  {aiSystemLabel}
                </p>
                <span className="text-[10px] font-500 text-gray-500 leading-4">(Latest)</span>
                <div className="w-2 h-2 rounded-full bg-[--chart-1]" />
              </div>
              <p className="text-xl font-550 text-gray-900 leading-6 tracking-[-0.3px]">
                {aiSystemAvg ?? '--'}
              </p>
            </div>

            {/* AI System + Guardrail metric - only show if there's a guardrail value */}
            {showGuardrailMetric && (
              <div className="flex flex-col gap-0.5 text-right">
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-2 h-2 rounded-full bg-[--chart-2]" />
                  <p className="text-xs font-425 text-gray-600 leading-5 whitespace-nowrap">
                    {aiSystemGuardrailLabel}
                  </p>
                  <span className="text-[10px] font-500 text-gray-500 leading-4">(Latest)</span>
                </div>
                <p className="text-xl font-550 text-gray-900 leading-6 tracking-[-0.3px] whitespace-nowrap">
                  {aiSystemGuardrailAvg ?? '--'}
                </p>
              </div>
            )}
          </div>

          {/* Chart Section */}
          {chartData && chartData.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="relative h-[70px] w-full rounded-md overflow-hidden">
                {/* Dotted background pattern */}
                <div
                  className="absolute inset-0 [background-size:8px_8px] [background-image:radial-gradient(#e5e7eb_1px,transparent_1px)] dark:[background-image:radial-gradient(#404040_0.5px,transparent_0.5px)]"
                  aria-hidden="true"
                />

                <ChartContainer
                  config={chartConfig}
                  className="relative z-10"
                  style={{ height: '70px', width: '100%', aspectRatio: 'auto' }}
                >
                  <AreaChart
                    data={processedChartData}
                    margin={{ left: 0, right: 0, top: 4, bottom: 4 }}
                    height={70}
                    width={500}
                  >
                  <CartesianGrid vertical={false} horizontal={false}/>


                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        formatter={(value, name) => {
                          // Filter out dotted line entries from tooltip
                          if (
                            name === 'withGuardrailsLeadingDotted' ||
                            name === 'withGuardrailsTrailingDotted'
                          ) {
                            return null;
                          }
                          return <span>{value}</span>;
                        }}
                      />
                    }
                  />

                  <defs>
                    {/* <linearGradient id="fillAiSystemOnly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartConfig.aiSystemOnly.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartConfig.aiSystemOnly.color} stopOpacity={0.05} />
                    </linearGradient> */}
                    {/* <linearGradient id="fillWithGuardrails" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={guardrailColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={guardrailColor} stopOpacity={0.05} />
                    </linearGradient> */}
                    {/* <linearGradient id="fillWithGuardrailsLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={guardrailColor} stopOpacity={0.15} />
                      <stop offset="95%" stopColor={guardrailColor} stopOpacity={0.02} />
                    </linearGradient> */}
                  </defs>

                  {/* Leading dotted line (from start to first guardrail) - render first (behind) */}
                  {hasGuardrailsInChart && (
                    <Area
                      dataKey="withGuardrailsLeadingDotted"
                      fill="url(#fillWithGuardrailsLight)"
                      stroke={guardrailColor}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      connectNulls={false}
                      dot={false}
                    />
                  )}

                  {/* Trailing dotted line (from last guardrail to end) - render second */}
                  {hasGuardrailsInChart && (
                    <Area
                      dataKey="withGuardrailsTrailingDotted"
                      fill="url(#fillWithGuardrailsLight)"
                      stroke={guardrailColor}
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      connectNulls={false}
                      dot={false}
                    />
                  )}

                  {/* Solid guardrail line (actual data) - render third */}
                  {hasGuardrailsInChart && (
                    <Area
                      dataKey="withGuardrailsSolid"
                      fill="url(#fillWithGuardrails)"
                      stroke={chartConfig.withGuardrailsSolid.color}
                      strokeWidth={2}
                      connectNulls={true}
                      dot={false}
                    />
                  )}

                  {/* AI System Only - render last (in front) */}
                  <Area
                    dataKey="aiSystemOnly"
                    fill="url(#fillAiSystemOnly)"
                    stroke={chartConfig.aiSystemOnly.color}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
              </div>

              {/* Date labels */}
              {processedChartData && processedChartData.length > 0 && (
                <div className="flex justify-between items-center w-full">
                  <span className="text-xs font-425 text-gray-600 leading-4">
                    {processedChartData[0].date}
                  </span>
                  <span className="text-xs font-425 text-gray-600 leading-4">
                    {processedChartData[processedChartData.length - 1].date}
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
