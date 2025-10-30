import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartComponentProps } from "./types";

export function AreaChartComponent({
  data,
  chartConfig,
  height = "180px",
  className = "",
}: ChartComponentProps) {
  return (
    <ChartContainer config={chartConfig} className={`h-[${height}] w-full ${className}`}>
      <AreaChart
        data={data}
        margin={{ left: 4, right: 12, top: 8, bottom: 8 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis
          dataKey="x"
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
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={`var(--color-${key})`}
            fill={`var(--color-${key})`}
            fillOpacity={0.2}
            strokeWidth={2}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
