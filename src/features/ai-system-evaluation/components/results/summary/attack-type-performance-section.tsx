import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, LabelList } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { JailbreakEvaluationSummary, AttackType } from "../../../types/jailbreak-evaluation";

interface AttackTypePerformanceSectionProps {
  summary: JailbreakEvaluationSummary;
}

// Attack level categorization
const ATTACK_LEVELS = {
  level1: {
    name: "Level 1 - Perturbations",
    description: "Simple text modifications",
    types: ["Typos", "Casing Changes", "Synonyms"] as AttackType[],
  },
  level2: {
    name: "Level 2 - Light Adversarial",
    description: "Prompt-based manipulation techniques",
    types: ["DAN", "PAP", "GCG", "Leetspeak", "ASCII Art"] as AttackType[],
  },
  level3: {
    name: "Level 3 - Expert Adversarial",
    description: "Advanced multi-turn attacks",
    types: ["TAP", "IRIS"] as AttackType[],
  },
};

export function AttackTypePerformanceSection({ summary }: AttackTypePerformanceSectionProps) {
  // Extract byAttackType data from summary
  const byAttackType = summary.byAttackType || summary.aiSystem?.byAttackType || {};

  // Check if we have data
  if (!byAttackType || Object.keys(byAttackType).length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    const data = Object.entries(byAttackType).map(([attackType, metrics]) => ({
      attackType,
      successRate: metrics.successRate,
      total: metrics.total,
      successes: metrics.successes,
      failures: metrics.failures,
      isHighRisk: metrics.successRate > 75,
    }));

    // Helper function to get attack level (3, 2, or 1)
    const getAttackLevel = (attackType: string): number => {
      if (ATTACK_LEVELS.level3.types.includes(attackType as AttackType)) return 3;
      if (ATTACK_LEVELS.level2.types.includes(attackType as AttackType)) return 2;
      if (ATTACK_LEVELS.level1.types.includes(attackType as AttackType)) return 1;
      return 0; // fallback
    };

    // Sort by level (3 -> 2 -> 1), then alphabetically within each level
    return data.sort((a, b) => {
      const levelA = getAttackLevel(a.attackType);
      const levelB = getAttackLevel(b.attackType);

      if (levelB !== levelA) {
        return levelB - levelA; // Descending order: Level 3, 2, 1
      }
      return a.attackType.localeCompare(b.attackType); // Alphabetical within level
    });
  }, [byAttackType]);

  // Calculate overall stats and level groupings
  const overallStats = useMemo(() => {
    const totalTests = chartData.reduce((sum, item) => sum + item.total, 0);
    const totalSuccesses = chartData.reduce((sum, item) => sum + item.successes, 0);
    const avgSuccessRate = totalTests > 0 ? (totalSuccesses / totalTests) * 100 : 0;
    const attackTypeCount = chartData.length;

    // Calculate level-based statistics
    const level1Tests = chartData
      .filter(item => ATTACK_LEVELS.level1.types.includes(item.attackType as AttackType))
      .reduce((sum, item) => sum + item.total, 0);
    const level2Tests = chartData
      .filter(item => ATTACK_LEVELS.level2.types.includes(item.attackType as AttackType))
      .reduce((sum, item) => sum + item.total, 0);
    const level3Tests = chartData
      .filter(item => ATTACK_LEVELS.level3.types.includes(item.attackType as AttackType))
      .reduce((sum, item) => sum + item.total, 0);

    const level1Percentage = totalTests > 0 ? Math.round((level1Tests / totalTests) * 100) : 0;
    const level2Percentage = totalTests > 0 ? Math.round((level2Tests / totalTests) * 100) : 0;
    const level3Percentage = totalTests > 0 ? Math.round((level3Tests / totalTests) * 100) : 0;

    // Count items per level
    const level3Count = chartData.filter(item =>
      ATTACK_LEVELS.level3.types.includes(item.attackType as AttackType)
    ).length;
    const level2Count = chartData.filter(item =>
      ATTACK_LEVELS.level2.types.includes(item.attackType as AttackType)
    ).length;
    const level1Count = chartData.filter(item =>
      ATTACK_LEVELS.level1.types.includes(item.attackType as AttackType)
    ).length;

    return {
      totalTests,
      totalSuccesses,
      avgSuccessRate,
      attackTypeCount,
      level1Percentage,
      level2Percentage,
      level3Percentage,
      level3Count,
      level2Count,
      level1Count
    };
  }, [chartData]);

  // Chart configuration
  const chartConfig = {
    successRate: {
      label: "Attack Success Rate",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  // Custom label component to show value and AlertTriangle for high-risk items
  const CustomLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    const isHighRisk = chartData[index]?.isHighRisk;

    if (isHighRisk) {
      return (
        <g>
          <foreignObject
            x={x + width / 2 - 20}
            y={y - 22}
            width={40}
            height={20}
          >
            <div className="flex items-center gap-1 justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" strokeWidth={2} />
              <span className="text-[10px] font-450 text-gray-900">{Math.round(value)}%</span>
            </div>
          </foreignObject>
        </g>
      );
    }

    // Show only percentage for non-high-risk items
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 8}
          textAnchor="middle"
          fill="rgb(156 163 175)"
          fontSize={10}
          fontWeight={450}
        >
          {Math.round(value)}%
        </text>
      </g>
    );
  };

  // Custom X-axis tick component for multi-line labels
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const lines = payload.value.split(' ');

    if (lines.length === 1) {
      return (
        <text x={x} y={y + 10} textAnchor="middle" fill="rgb(75 85 99)" fontSize={11}>
          {lines[0]}
        </text>
      );
    }

    return (
      <text x={x} y={y} textAnchor="middle" fill="rgb(75 85 99)" fontSize={11}>
        <tspan x={x} dy="1em">{lines[0]}</tspan>
        <tspan x={x} dy="1.2em">{lines[1]}</tspan>
      </text>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 my-4">
      {/* Header and Description */}
      <div className="space-y-3 pt-4 rounded-xl px-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <p className="text-lg font-450 leading-4 text-gray-900">
              Attack Type Performance
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 py-2">
          <p className="text-[0.9375rem] font-[425] leading-5 text-gray-600 leading-relaxed">
             The attacks are categorized into three levels:
            Level 1 - Perturbations ({overallStats.level1Percentage}%) includes {ATTACK_LEVELS.level1.types.join(", ")}, which are simple text modifications;
            Level 2 - Light Adversarial ({overallStats.level2Percentage}%) includes {ATTACK_LEVELS.level2.types.join(", ")}, which are prompt-based manipulation techniques;
            and Level 3 - Expert Adversarial ({overallStats.level3Percentage}%) includes {ATTACK_LEVELS.level3.types.join(", ")}, which are advanced multi-turn attacks.
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="px-3">
        <div className="border border-gray-200 rounded-lg p-6 ">
          <h4 className="text-sm font-450 text-gray-600 mb-4">
            Attack Success Rate
          </h4>
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <BarChart
              data={chartData}
              margin={{
                top: 30,
                right: 0,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid vertical={false} className="stroke-gray-200" />
              <XAxis
                dataKey="attackType"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={<CustomXAxisTick />}
                height={60}
                interval={0}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    indicator="line"
                    labelFormatter={(value) => `Attack Type: ${value}`}
                    formatter={(value, name, item) => [
                      `${Number(value).toFixed(1)}% (${item.payload.successes}/${item.payload.total})`,
                    ]}
                  />
                }
              />
              <Bar
                dataKey="successRate"
                fill="var(--color-successRate)"
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey="successRate"
                  position="top"
                  content={<CustomLabel />}
                />
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Level Grouping Indicator */}
          <div className="pb-4">
            <div className="flex items-start gap-4 relative">
              {/* Level 3 - Expert */}
              {overallStats.level3Count > 0 && (
                <div className="flex-1" style={{ flexBasis: `${(overallStats.level3Count / overallStats.attackTypeCount) * 100}%` }}>
                  <div className="flex flex-col items-center">
                    <div className="w-full relative flex items-center justify-center">
                      <div className="w-0.5 h-2 bg-gray-300 absolute left-0 -translate-x-1/2"></div>
                      <div className="w-full border-t border-dashed border-gray-300"></div>
                      <div className="w-0.5 h-2 bg-gray-300 absolute right-0 translate-x-1/2"></div>
                      <span className="absolute text-xs text-gray-600 bg-gray-50 px-2">Expert</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Level 2 - Light */}
              {overallStats.level2Count > 0 && (
                <div className="flex-1" style={{ flexBasis: `${(overallStats.level2Count / overallStats.attackTypeCount) * 100}%` }}>
                  <div className="flex flex-col items-center">
                    <div className="w-full relative flex items-center justify-center">
                      <div className="w-0.5 h-2 bg-gray-300 absolute left-0 -translate-x-1/2"></div>
                      <div className="w-full border-t border-dashed border-gray-300"></div>
                      <div className="w-0.5 h-2 bg-gray-300 absolute right-0 translate-x-1/2"></div>
                      <span className="absolute text-xs text-gray-600 bg-gray-50 px-2">Light</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Level 1 - Perturbation */}
              {overallStats.level1Count > 0 && (
                <div className="flex-1" style={{ flexBasis: `${(overallStats.level1Count / overallStats.attackTypeCount) * 100}%` }}>
                  <div className="flex flex-col items-center">
                    <div className="w-full relative flex items-center justify-center">
                      <div className="w-0.5 h-2 bg-gray-300 absolute left-0 -translate-x-1/2"></div>
                      <div className="w-full border-t border-dashed border-gray-300"></div>
                      <div className="w-0.5 h-2  bg-gray-300 absolute right-0 translate-x-1/2"></div>
                      <span className="absolute text-xs text-gray-600 bg-gray-50 px-2">Perturbation</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
