import type { InsightResponse } from "@/lib/agents/types";
import type { ChartType } from "./templates/types";
import {
  SummaryTextSection,
  SummaryTableSection,
  SummaryChartSection,
} from "./templates";
import type { ChartConfig } from "@/components/ui/chart";
import { parseAgentResponseSafe } from "./parse-agent-response";

interface AgentResponseRendererProps {
  response: InsightResponse;
  className?: string;
}

// Helper function to map chart type names from underscore format to simple format
function mapChartType(
  chartType: "bar_chart" | "line_chart" | "area_chart" | "pie_chart" | "radial_chart" | "radar_chart"
): ChartType {
  const chartTypeMap: Record<string, ChartType> = {
    bar_chart: "bar",
    line_chart: "line",
    area_chart: "area",
    pie_chart: "pie",
    radial_chart: "radial",
    radar_chart: "radar",
  };
  return chartTypeMap[chartType] || "bar";
}

// Helper function to format column header from snake_case to Title Case
function formatHeader(key: string): string {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to truncate long text
function truncateText(text: string, maxLength: number = 60): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

// Helper function to render cell values with special handling for arrays and badges
function createCellRenderer(key: string) {
  return (value: any) => {
    // Handle empty values
    if (value === null || value === undefined || value === '') {
      return <span className="text-gray-400">—</span>;
    }

    // Handle arrays (like policy_name)
    if (Array.isArray(value)) {
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
            >
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    // Handle base_prompt - truncate long text with title hover
    if (key === 'base_prompt') {
      const textValue = String(value);
      const truncated = truncateText(textValue, 60);
      return (
        <span title={textValue} className="text-gray-700 cursor-help">
          {truncated}
        </span>
      );
    }

    // Handle topic - display as gray badge
    if (key === 'topic') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-450 bg-gray-100 text-gray-700">
          {String(value)}
        </span>
      );
    }

    // Handle attack_type - display as colored badge
    if (key === 'attack_type') {
      const attackTypeColors: Record<string, string> = {
        'DAN': 'bg-blue-100 text-blue-700',
        'TAP': 'bg-purple-100 text-purple-700',
        'PAP': 'bg-pink-100 text-pink-700',
        'GCG': 'bg-amber-100 text-amber-700',
        'IRIS': 'bg-green-100 text-green-700',
        'Leetspeak': 'bg-orange-100 text-orange-700',
        'ASCII Art': 'bg-cyan-100 text-cyan-700',
        'Typos': 'bg-indigo-100 text-indigo-700',
        'Casing Changes': 'bg-slate-100 text-slate-700',
        'Synonyms': 'bg-teal-100 text-teal-700',
      };
      const textValue = String(value);
      const colorClass = attackTypeColors[textValue] || 'bg-gray-100 text-gray-700';

      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-450 ${colorClass}`}>
          {textValue}
        </span>
      );
    }

    // Handle attack_outcome with colored badges
    if (key === 'attack_outcome') {
      const textValue = String(value);
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-450 ${
            textValue === "Attack Success"
              ? "bg-red-100 text-red-700"
              : textValue === "Attack Failure"
                ? "bg-green-100 text-green-700"
                : textValue === "TP"
                  ? "bg-green-100 text-green-700"
                  : textValue === "TN"
                    ? "bg-green-100 text-green-700"
                    : textValue === "FP"
                      ? "bg-red-100 text-red-700"
                      : textValue === "FN"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
          }`}
        >
          {textValue}
        </span>
      );
    }

    // Default: render as string
    return <span className="text-gray-700">{String(value)}</span>;
  };
}

// Helper function to transform chart data to template format
function transformChartData(
  agentData: {
    x_axis: string;
    y_axis: string;
    values: Array<{ [key: string]: string | number }>;
  },
  chartType: ChartType
): Array<{ [key: string]: string | number }> {
  const { values, x_axis, y_axis } = agentData;

  // Map field names based on chart type
  const fieldMapping: Record<ChartType, { xField: string; yField: string | null }> = {
    bar: { xField: "category", yField: null },
    line: { xField: "x", yField: null },
    area: { xField: "x", yField: null },
    pie: { xField: "name", yField: "value" },
    radial: { xField: "name", yField: "value" },
    radar: { xField: "metric", yField: null },
  };

  const mapping = fieldMapping[chartType];

  return values.map((item) => {
    const transformed: { [key: string]: string | number } = {};

    // Map x_axis to the appropriate field name for this chart type
    transformed[mapping.xField] = item[x_axis];

    // Map y_axis value(s)
    if (mapping.yField) {
      transformed[mapping.yField] = item[y_axis];
    } else {
      transformed[y_axis] = item[y_axis];
    }

    // Include any additional fields in the original data
    Object.keys(item).forEach((key) => {
      if (key !== x_axis && key !== y_axis) {
        transformed[key] = item[key];
      }
    });

    return transformed;
  });
}

// Helper function to generate chart config with proper color assignments
function generateChartConfig(
  transformedData: Array<{ [key: string]: string | number }>,
  chartType: ChartType,
  originalYAxis?: string
): ChartConfig {
  // For pie and radial charts, create color entries for each name value
  if (chartType === "pie" || chartType === "radial") {
    const chartConfig: ChartConfig = {};
    const colorVars = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];

    transformedData.forEach((item, index) => {
      const nameValue = String(item["name"] || "");
      if (nameValue) {
        chartConfig[nameValue] = {
          label: nameValue,
          color: colorVars[index % colorVars.length],
        };
      }
    });

    return chartConfig;
  }

  // For radar chart, get unique y-axis values
  if (chartType === "radar") {
    const chartConfig: ChartConfig = {};
    const colorVars = ["var(--chart-1)", "var(--chart-2)"];

    // Find all numeric keys in the data (excluding metric field)
    if (transformedData.length > 0) {
      const firstItem = transformedData[0];
      Object.keys(firstItem).forEach((key, index) => {
        if (key !== "metric") {
          chartConfig[key] = {
            label: formatHeader(key),
            color: colorVars[index % colorVars.length],
          };
        }
      });
    }

    return chartConfig;
  }

  // For bar, line, area charts - use the original y_axis label
  const yAxisLabel = originalYAxis || "Value";
  return {
    [yAxisLabel]: {
      label: formatHeader(yAxisLabel),
      color: "var(--chart-1)",
    },
  };
}

export function AgentResponseRenderer({
  response,
  className = "",
}: AgentResponseRendererProps) {
  // Parse the raw response into properly typed data
  const parsed = parseAgentResponseSafe(response);

  return (
    <>
      {/* Render based on format type */}
      {parsed.format === "text" && (
        <SummaryTextSection
          title={parsed.title}
          description={parsed.data}
          bottomDescription={parsed.insights}
          className={className}
        />
      )}

      {parsed.format === "table" && (
        <SummaryTableSection
          title={parsed.title}
          columns={
            parsed.data && Array.isArray(parsed.data) && parsed.data.length > 0
              ? Object.keys(parsed.data[0]).map((key) => ({
                  key,
                  header: formatHeader(key),
                  render: createCellRenderer(key),
                }))
              : []
          }
          data={parsed.data || []}
          bottomDescription={parsed.insights}
          className={className}
        />
      )}

      {parsed.format === "chart" && (() => {
        try {
          // Ensure data is an object
          if (typeof parsed.data !== "object" || parsed.data === null) {
            throw new Error(`Chart data must be an object, got ${typeof parsed.data}`);
          }

          const chartType = mapChartType(parsed.chart_type);
          const transformedData = transformChartData(parsed.data, chartType);
          const config = generateChartConfig(
            transformedData,
            chartType,
            parsed.data.y_axis
          );

          return (
            <SummaryChartSection
              title={parsed.title}
              chartType={chartType}
              data={transformedData}
              chartConfig={config}
              bottomDescription={parsed.insights}
              className={className}
            />
          );
        } catch (error) {
          console.error("Error rendering chart:", error);
          return (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Error rendering chart: {error instanceof Error ? error.message : String(error)}
            </div>
          );
        }
      })()}
    </>
  );
}
