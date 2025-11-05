import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartComponentProps } from "./types";

// Custom X-axis tick component for multi-line labels
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;
  const lines = payload.value.split(' ');

  if (lines.length === 1) {
    return (
      <text x={x} y={y + 10} textAnchor="middle" fill="rgb(var(--gray-600))" fontSize={11}>
        {lines[0]}
      </text>
    );
  }

  return (
    <text x={x} y={y} textAnchor="middle" fill="rgb(var(--gray-600))" fontSize={11}>
      <tspan x={x} dy="1em">{lines[0]}</tspan>
      <tspan x={x} dy="1.2em">{lines.slice(1).join(" ")}</tspan>
    </text>
  );
};

export function BarChartComponent({
  data,
  chartConfig,
  height = "240px",
  className = "",
}: ChartComponentProps) {
  return (
    <ChartContainer config={chartConfig} className={`h-64 w-full p-2 ${className}`}>
      <BarChart
        data={data}
        margin={{ left: 0, right: 0, top: 30, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis
          dataKey="category"
          tickLine={false}
          axisLine={false}
          className="text-xs text-gray-600"
          tickMargin={8}
          tick={<CustomXAxisTick />}
          height={60}
          interval={0}
        />
       
        <ChartTooltip content={<ChartTooltipContent />} />
        {Object.keys(chartConfig).map((key) => (
          <Bar
            key={key}
            barSize={32}
            dataKey={key}
            fill={chartConfig[key].color}
            radius={[4, 4, 0, 0]}
            label={{
              position: "top",
              fill: "rgb(var(--gray-600))",
              fontSize: "12px",
            }}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
