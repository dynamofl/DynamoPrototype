import type { SummaryChartSectionProps } from "./types";
import type { ChartConfig } from "@/components/ui/chart";
import { BarChartComponent } from "./bar-chart-component";
import { LineChartComponent } from "./line-chart-component";
import { AreaChartComponent } from "./area-chart-component";
import { PieChartComponent } from "./pie-chart-component";
import { RadialChartComponent } from "./radial-chart-component";
import { RadarChartComponent } from "./radar-chart-component";

export function SummaryChartSection({
  title,
  chartType,
  data,
  chartConfig,
  topDescription,
  bottomDescription,
  height = "240px",
  className = "",
}: SummaryChartSectionProps) {
  const renderChart = () => {
    const chartProps = { data, chartConfig, height };

    switch (chartType) {
      case "bar":
        return <BarChartComponent {...chartProps} />;
      case "line":
        return <LineChartComponent {...chartProps} />;
      case "area":
        return <AreaChartComponent {...chartProps} />;
      case "pie":
        return <PieChartComponent {...chartProps} />;
      case "radial":
        return <RadialChartComponent {...chartProps} />;
      case "radar":
        return <RadarChartComponent {...chartProps} />;
      default:
        return null;
    }
  };

  return (
    <div className={`max-w-4xl mx-auto space-y-4 my-4 ${className}`}>
      <div className="space-y-3 pt-4 pb-2 rounded-xl">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-3">
            <p className="text-sm font-550 leading-4 text-gray-900">{title}</p>
          </div>
        </div>

        {/* Top Description */}
        {topDescription && (
          <div className="space-y-2 px-3">
            <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
              {topDescription}
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="px-3">
        <div className="border border-gray-200 rounded-lg p-3">
          {renderChart()}
        </div>
      </div>

      {/* Bottom Description */}
      {bottomDescription && (
        <div className="space-y-2 px-3 pb-2">
          <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
            {bottomDescription}
          </p>
        </div>
      )}
    </div>
  );
}

// Mock data examples for demonstration

// Bar Chart Example
export const mockBarChartData: SummaryChartSectionProps = {
  title: "Attack Type Performance",
  chartType: "bar",
  data: [
    { category: "Direct Attacks", value: 87 },
    { category: "Obfuscation", value: 92 },
    { category: "Context Manipulation", value: 78 },
    { category: "Role Play", value: 85 },
    { category: "Payload Splitting", value: 91 },
  ],
  chartConfig: {
    value: {
      label: "Success Rate (%)",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig,
  bottomDescription: "Success rates by attack type over evaluation period.",
};

// Line Chart Example
export const mockLineChartData: SummaryChartSectionProps = {
  title: "Performance Trend Analysis",
  chartType: "line",
  data: [
    { x: "Week 1", score: 78 },
    { x: "Week 2", score: 82 },
    { x: "Week 3", score: 85 },
    { x: "Week 4", score: 88 },
    { x: "Week 5", score: 87 },
    { x: "Week 6", score: 91 },
  ],
  chartConfig: {
    score: {
      label: "Performance Score",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig,
  bottomDescription: "Weekly performance trends showing steady improvement over time.",
};

// Area Chart Example
export const mockAreaChartData: SummaryChartSectionProps = {
  title: "Test Volume Over Time",
  chartType: "area",
  data: [
    { x: "Jan", volume: 245 },
    { x: "Feb", volume: 312 },
    { x: "Mar", volume: 389 },
    { x: "Apr", volume: 421 },
    { x: "May", volume: 398 },
    { x: "Jun", volume: 467 },
  ],
  chartConfig: {
    volume: {
      label: "Test Volume",
      color: "var(--chart-3)",
    },
  } satisfies ChartConfig,
  topDescription: "Monthly test execution volume demonstrating evaluation activity.",
  bottomDescription:
    "Test volume increased significantly in Q2, reflecting expanded coverage.",
};

// Pie Chart Example
export const mockPieChartData: SummaryChartSectionProps = {
  title: "Result Distribution",
  chartType: "pie",
  data: [
    { name: "Passed", value: 847 },
    { name: "Failed", value: 156 },
    { name: "Uncertain", value: 244 },
  ],
  chartConfig: {
    Passed: { label: "Passed", color: "var(--chart-1)" },
    Failed: { label: "Failed", color: "var(--chart-3)" },
    Uncertain: { label: "Uncertain", color: "var(--chart-4)" },
  } satisfies ChartConfig,
  bottomDescription:
    "Overall test result distribution showing strong pass rate of 68%.",
};

// Radial Chart Example
export const mockRadialChartData: SummaryChartSectionProps = {
  title: "Category Coverage Metrics",
  chartType: "radial",
  data: [
    { name: "Security", value: 92 },
    { name: "Privacy", value: 87 },
    { name: "Compliance", value: 94 },
    { name: "Performance", value: 78 },
  ],
  chartConfig: {
    Security: { label: "Security", color: "var(--chart-1)" },
    Privacy: { label: "Privacy", color: "var(--chart-2)" },
    Compliance: { label: "Compliance", color: "var(--chart-3)" },
    Performance: { label: "Performance", color: "var(--chart-4)" },
  } satisfies ChartConfig,
  bottomDescription: "Coverage metrics across evaluation categories.",
};

// Radar Chart Example
export const mockRadarChartData: SummaryChartSectionProps = {
  title: "Multi-Dimensional Performance Analysis",
  chartType: "radar",
  data: [
    { metric: "Accuracy", system: 88, baseline: 75 },
    { metric: "Speed", system: 92, baseline: 80 },
    { metric: "Reliability", system: 85, baseline: 78 },
    { metric: "Coverage", system: 91, baseline: 82 },
    { metric: "Robustness", system: 87, baseline: 76 },
  ],
  chartConfig: {
    system: {
      label: "System Performance",
      color: "var(--chart-1)",
    },
    baseline: {
      label: "Industry Baseline",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig,
  topDescription: "Comparison of system performance against industry baselines.",
  bottomDescription:
    "System exceeds baseline across all dimensions, with strongest performance in speed and coverage.",
};
