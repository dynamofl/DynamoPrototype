import type { InsightResponse } from "@/lib/agents/types";
import type { ChartType } from "./templates/types";
import {
  SummaryTextSection,
  SummaryTableSection,
  SummaryChartSection,
} from "./templates";
import type { ChartConfig } from "@/components/ui/chart";

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

// Helper function to render cell values with special handling for arrays and badges
function createCellRenderer(key: string) {
  return (value: any) => {
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

    // Handle attack_outcome with colored badges
    if (key === 'attack_outcome') {
      return (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
            value === "Attack Success"
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {String(value)}
        </span>
      );
    }

    // Default: render as string
    return <span>{String(value)}</span>;
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
  agentData: {
    x_axis: string;
    y_axis: string;
    values: Array<{ [key: string]: string | number }>;
  },
  chartType: ChartType
): ChartConfig {
  const { y_axis, values } = agentData;

  // For pie and radial charts, create color entries for each name value
  if (chartType === "pie" || chartType === "radial") {
    const nameField = chartType === "pie" ? "name" : "name";
    const chartConfig: ChartConfig = {};
    const colorVars = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];

    values.forEach((item, index) => {
      const nameValue = String(item[nameField] || item["name"] || "");
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
    if (values.length > 0) {
      const firstItem = values[0];
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

  // For bar, line, area charts
  return {
    [y_axis]: {
      label: formatHeader(y_axis),
      color: "var(--chart-1)",
    },
  };
}

export function AgentResponseRenderer({
  response,
  className = "",
}: AgentResponseRendererProps) {
  return (
    <>
      {/* Render based on format type */}
      {response.format === "text" && (
        <SummaryTextSection
          title={response.title}
          description={response.data as string}
          bottomDescription={response.insights || undefined}
          className={className}
        />
      )}

      {response.format === "table" && response.data && (
        <SummaryTableSection
          title={response.title}
          columns={
            response.data && (response.data as any[]).length > 0
              ? Object.keys((response.data as any[])[0]).map((key) => ({
                  key,
                  header: formatHeader(key),
                  render: createCellRenderer(key),
                }))
              : []
          }
          data={response.data as any[]}
          bottomDescription={response.insights || undefined}
          className={className}
        />
      )}

      {response.format === "chart" && (
        <SummaryChartSection
          title={response.title}
          chartType={mapChartType(response.chart_type)}
          data={transformChartData(
            response.data,
            mapChartType(response.chart_type)
          )}
          chartConfig={generateChartConfig(
            response.data,
            mapChartType(response.chart_type)
          )}
          bottomDescription={response.insights || undefined}
          className={className}
        />
      )}
    </>
  );
}
