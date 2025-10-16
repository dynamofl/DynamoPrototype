import { ArrowUpRight, PlusCircle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";

interface EvaluationSummaryCardsProps {
  summary: JailbreakEvaluationOutput["summary"];
  hasGuardrails?: boolean;
  evaluationHistory?: any[]; // For time-series data
  onViewResults?: () => void;
}

export function EvaluationSummaryCards({
  summary,
  hasGuardrails = false,
  evaluationHistory = [],
  onViewResults,
}: EvaluationSummaryCardsProps) {
  // Get metrics with fallback to legacy fields
  const aiSystemRate = summary.aiSystem?.aiSystemOnlySuccessRate ?? summary.aiSystemOnlySuccessRate ?? 0;
  const withGuardrailsRate = summary.aiSystem?.successRate ?? summary.successRate ?? 0;

  // Calculate guardrail-only rate (how much guardrails reduced the attack success)
  const guardrailOnlyRate = hasGuardrails ? aiSystemRate - withGuardrailsRate : 0;

  // Get total counts
  const totalTests = summary.aiSystem?.totalTests ?? summary.totalTests ?? 0;
  const totalPrompts = Object.values(summary.byAttackType || {}).reduce(
    (sum, stats) => sum + stats.total,
    0
  );
  const totalTopics = summary.summaryMetrics?.uniqueTopics ?? Object.keys(summary.byPolicy || {}).length;
  const totalAttackAreas = summary.summaryMetrics?.uniqueAttackAreas ?? Object.keys(summary.byAttackType || {}).length;

  // Generate time-series data for chart (mock data for now based on attack types)
  const chartData = Object.entries(summary.byAttackType || {})
    .slice(0, 10) // Limit to 10 data points
    .map(([attackType, stats], index) => ({
      time: `T${index + 1}`,
      aiSystem: summary.aiSystem?.aiSystemOnlySuccessRate ?? summary.aiSystemOnlySuccessRate ?? 0,
      withGuardrails: stats.successRate,
      guardrailOnly: guardrailOnlyRate,
    }));

  // Chart configuration
  const chartConfig = {
    aiSystem: {
      label: "AI System (Avg.)",
      color: "#6366f1", // indigo-500
    },
    withGuardrails: {
      label: "AI System + Guardrail (Avg.)",
      color: "#8b5cf6", // violet-500
    },
    guardrailOnly: {
      label: "Guardrail Only (Avg.)",
      color: "#d946ef", // fuchsia-500
    },
  } satisfies ChartConfig;

  // Format dates for chart
  const startDate = chartData.length > 0 ? "Oct 16, 9:40pm" : "--";
  const endDate = chartData.length > 0 ? "Oct 16, 11:30pm" : "--";

  return (
    <div className="flex gap-3 w-full">
      {/* Jailbreak Success Rate Card */}
      <div className="flex-1 bg-white border border-gray-300 rounded-xl">
        <div className="flex flex-col gap-0.5">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 flex gap-1.5 h-10 items-center px-4 py-3">
            <p className="flex-1 text-[13px] font-[550] text-gray-900 leading-5">
              Jailbreak Success Rate
            </p>
            <button
              onClick={onViewResults}
              className="flex gap-0.5 items-center hover:opacity-70 transition-opacity"
            >
              <span className="text-[13px] font-[550] text-gray-600 leading-[22px]">
                View Recent Test Result
              </span>
              <ArrowUpRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="bg-white flex flex-col gap-2.5 px-5 pt-3 pb-4">
            <div className="flex flex-col gap-6">
              {/* Metrics Row */}
              <div className="flex gap-3">
                {/* AI System (Avg.) */}
                <div className="flex flex-col gap-1.5 w-[158px]">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[12px] font-[550] text-gray-600 leading-4">
                      AI System (Avg.)
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  </div>
                  <p className="text-[16px] font-semibold text-gray-900 leading-4 tracking-[-0.4px]">
                    {aiSystemRate.toFixed(0)}%
                  </p>
                </div>

                {/* AI System + Guardrail (Avg.) */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[12px] font-[550] text-gray-600 leading-4">
                      AI System + Guardrail (Avg.)
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  </div>
                  <p className="text-[16px] font-semibold text-gray-900 leading-4 tracking-[-0.4px]">
                    {hasGuardrails ? withGuardrailsRate.toFixed(0) : "--"}%
                  </p>
                </div>

                {/* Guardrail Only (Avg.) */}
                <div className="flex flex-col gap-1.5 w-[137px]">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[12px] font-[550] text-gray-600 leading-4">
                      Guardrail Only (Avg.)
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
                  </div>
                  <p className="text-[16px] font-semibold text-gray-900 leading-4 tracking-[-0.4px]">
                    {hasGuardrails ? guardrailOnlyRate.toFixed(0) : "--"}%
                  </p>
                </div>
              </div>

              {/* Chart Section */}
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  {/* Chart */}
                  <div className="h-[70px] w-full">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200" />
                        <XAxis dataKey="time" hide />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value) => [`${Number(value).toFixed(1)}%`]}
                            />
                          }
                        />
                        {hasGuardrails && (
                          <>
                            <Area
                              dataKey="guardrailOnly"
                              type="monotone"
                              fill="#f5d0fe"
                              fillOpacity={0.6}
                              stroke="#d946ef"
                              strokeWidth={1.5}
                            />
                            <Area
                              dataKey="withGuardrails"
                              type="monotone"
                              fill="#ddd6fe"
                              fillOpacity={0.6}
                              stroke="#8b5cf6"
                              strokeWidth={1.5}
                            />
                          </>
                        )}
                        <Area
                          dataKey="aiSystem"
                          type="monotone"
                          fill="#c7d2fe"
                          fillOpacity={0.6}
                          stroke="#6366f1"
                          strokeWidth={1.5}
                        />
                      </AreaChart>
                    </ChartContainer>
                  </div>

                  {/* Time Labels */}
                  <div className="flex justify-between">
                    <span className="text-[12px] font-[425] text-gray-600 leading-4">
                      {startDate}
                    </span>
                    <span className="text-[12px] font-[425] text-gray-600 leading-4">
                      {endDate}
                    </span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-1 text-[13px] font-[425]">
                    <span className="text-gray-900 leading-[22px]">Total Tests</span>
                    <span className="text-gray-600 leading-[22px] h-3.5">{totalTests}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-[13px] font-[425]">
                    <span className="text-gray-900 leading-[22px]">Prompts</span>
                    <span className="text-gray-600 leading-[22px] h-3.5">
                      {totalPrompts.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-[13px] font-[425]">
                    <span className="text-gray-900 leading-[22px]">Topics</span>
                    <span className="text-gray-600 leading-[22px] h-3.5">{totalTopics}</span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 text-[13px] font-[425] items-end">
                    <span className="text-gray-900 leading-[22px]">Attack Area</span>
                    <span className="text-gray-600 leading-[22px] h-3.5">{totalAttackAreas}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Score Card 1 */}
      <div className="flex-1 bg-white border border-gray-300 rounded-xl">
        <div className="flex flex-col gap-0.5">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 flex gap-1.5 h-10 items-center px-4 py-3">
            <p className="flex-1 text-[13px] font-[550] text-gray-900 leading-5">
              Compliance Score
            </p>
            <button className="flex gap-1 items-center hover:opacity-70 transition-opacity">
              <PlusCircle className="w-4 h-4 text-gray-600" />
              <span className="text-[13px] font-[550] text-gray-600 leading-[22px]">
                Run Compliance Evaluation
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="bg-white flex flex-col gap-2.5 px-5 pt-3 pb-4">
            <div className="flex flex-col gap-6">
              {/* Metrics Row */}
              <div className="flex gap-3">
                {/* AI System (Avg.) */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[12px] font-[550] text-gray-600 leading-4">
                      AI System (Avg.)
                    </span>
                  </div>
                  <p className="text-[16px] font-semibold text-gray-900 leading-4 tracking-[-0.4px]">
                    --
                  </p>
                </div>

                {/* AI System + Guardrail (Avg.) */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[12px] font-[550] text-gray-600 leading-4">
                      AI System + Guardrail (Avg.)
                    </span>
                  </div>
                  <p className="text-[16px] font-semibold text-gray-900 leading-4 tracking-[-0.4px]">
                    --
                  </p>
                </div>
              </div>

              {/* Empty State */}
              <div className="flex items-center justify-center h-[162px]">
                <span className="text-[12px] font-[425] text-gray-700 leading-4">
                  No Evaluation Data to Display
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Score Card 2 */}
      <div className="flex-1 bg-white border border-gray-300 rounded-xl">
        <div className="flex flex-col gap-0.5">
          {/* Header */}
          <div className="bg-white border-b border-gray-300 flex gap-1.5 h-10 items-center px-4 py-3">
            <p className="flex-1 text-[13px] font-[550] text-gray-900 leading-5">
              Compliance Score
            </p>
            <button className="flex gap-1 items-center hover:opacity-70 transition-opacity">
              <PlusCircle className="w-4 h-4 text-gray-600" />
              <span className="text-[13px] font-[550] text-gray-600 leading-[22px]">
                Run Compliance Evaluation
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="bg-white flex flex-col gap-2.5 px-5 pt-3 pb-4">
            <div className="flex flex-col gap-6">
              {/* Metrics Row */}
              <div className="flex gap-3">
                {/* AI System (Avg.) */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[12px] font-[550] text-gray-600 leading-4">
                      AI System (Avg.)
                    </span>
                  </div>
                  <p className="text-[16px] font-semibold text-gray-900 leading-4 tracking-[-0.4px]">
                    --
                  </p>
                </div>

                {/* AI System + Guardrail (Avg.) */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex gap-1.5 items-center">
                    <span className="text-[12px] font-[550] text-gray-600 leading-4">
                      AI System + Guardrail (Avg.)
                    </span>
                  </div>
                  <p className="text-[16px] font-semibold text-gray-900 leading-4 tracking-[-0.4px]">
                    --
                  </p>
                </div>
              </div>

              {/* Empty State */}
              <div className="flex items-center justify-center h-[162px]">
                <span className="text-[12px] font-[425] text-gray-700 leading-4">
                  No Evaluation Data to Display
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
