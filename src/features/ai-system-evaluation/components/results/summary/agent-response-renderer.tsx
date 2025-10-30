import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { InsightResponse } from "@/lib/agents/types";

interface AgentResponseRendererProps {
  response: InsightResponse;
  className?: string;
}

export function AgentResponseRenderer({
  response,
  className = "",
}: AgentResponseRendererProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Display title if present */}
      {response.title && (
        <div className="pb-1">
          <h4 className="text-sm font-550 text-gray-900">{response.title}</h4>
        </div>
      )}

      {/* Render based on format type */}
      {response.format === "text" && (
        <TextResponse data={response.data} insights={response.insights} />
      )}

      {response.format === "table" && (
        <TableResponse data={response.data} insights={response.insights} />
      )}

      {response.format === "chart" && (
        <ChartResponse
          data={response.data}
          insights={response.insights}
          chartType={response.chart_type}
        />
      )}
    </div>
  );
}

// Text Response Component
function TextResponse({
  data,
  insights,
}: {
  data: string;
  insights: string | null;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-[425] leading-5 text-gray-900">{data}</p>
      {insights && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs font-450 text-gray-600 mb-1">Insights:</p>
          <p className="text-xs font-[425] leading-5 text-gray-600">
            {insights}
          </p>
        </div>
      )}
    </div>
  );
}

// Table Response Component
function TableResponse({
  data,
  insights,
}: {
  data: Array<{
    base_prompt: string;
    attack_type: string;
    attack_outcome: string;
    policy_name: string[];
  }>;
  insights?: string;
}) {
  if (!data || data.length === 0) {
    return (
      <p className="text-sm font-[425] text-gray-600">No data available</p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 border-0 hover:bg-gray-100">
              <TableHead className="font-450 text-xs pl-3">
                Base Prompt
              </TableHead>
              <TableHead className="font-450 text-xs">Attack Type</TableHead>
              <TableHead className="font-450 text-xs">Outcome</TableHead>
              <TableHead className="font-450 text-xs">Policies</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="text-xs font-450 text-gray-900 pl-3 max-w-[200px]">
                  <div className="truncate" title={row.base_prompt}>
                    {row.base_prompt}
                  </div>
                </TableCell>
                <TableCell className="text-xs font-450 text-gray-900">
                  {row.attack_type}
                </TableCell>
                <TableCell className="text-xs font-450">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                      row.attack_outcome === "Attack Success"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {row.attack_outcome}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-450 text-gray-900">
                  <div className="flex flex-wrap gap-1">
                    {row.policy_name.map((policy, policyIndex) => (
                      <span
                        key={policyIndex}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                      >
                        {policy}
                      </span>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {insights && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-450 text-gray-600 mb-1">Insights:</p>
          <p className="text-xs font-[425] leading-5 text-gray-600">
            {insights}
          </p>
        </div>
      )}
    </div>
  );
}

// Chart Response Component
function ChartResponse({
  data,
  insights,
  chartType,
}: {
  data: {
    x_axis: string;
    y_axis: string;
    values: Array<{
      [key: string]: string | number;
    }>;
  };
  insights?: string;
  chartType: "bar_chart" | "line_chart" | "area_chart" | "pie_chart" | "radial_chart" | "radar_chart";
}) {
  if (!data || !data.values || data.values.length === 0) {
    return (
      <p className="text-sm font-[425] text-gray-600">No chart data available</p>
    );
  }

  // Create chart config dynamically
  const chartConfig = {
    [data.y_axis]: {
      label: data.y_axis,
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-gray-200 p-3">
        {/* TODO: Implement different chart types based on chartType prop */}
        {/* Currently rendering bar_chart for all types */}
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            data={data.values}
            margin={{ left: 4, right: 12, top: 8, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
            <XAxis
              dataKey={data.x_axis}
              tickLine={false}
              axisLine={false}
              className="text-xs text-gray-600"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-xs text-gray-600"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey={data.y_axis}
              fill={`var(--color-${data.y_axis})`}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </div>

      {insights && (
        <div className="pt-2 border-t border-gray-200">
          <p className="text-xs font-450 text-gray-600 mb-1">Insights:</p>
          <p className="text-xs font-[425] leading-5 text-gray-600">
            {insights}
          </p>
        </div>
      )}
    </div>
  );
}
