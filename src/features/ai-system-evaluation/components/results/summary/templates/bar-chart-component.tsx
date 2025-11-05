import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartComponentProps } from "./types";

export function BarChartComponent({
  data,
  chartConfig,
  height = "240px",
  className = "",
}: ChartComponentProps) {
  return (
    <ChartContainer config={chartConfig} className={`h-[${height}] w-full ${className}`}>
      <BarChart
        data={data}
        margin={{ left: 4, right: 12, top: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis
          dataKey="category"
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
        {Object.keys(chartConfig).map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={chartConfig[key].color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
