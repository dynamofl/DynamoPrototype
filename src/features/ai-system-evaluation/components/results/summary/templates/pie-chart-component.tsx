import { Pie, PieChart, Cell, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartComponentProps } from "./types";

export function PieChartComponent({
  data,
  chartConfig,
  height = "240px",
  className = "",
}: ChartComponentProps) {
  // Get colors from chartConfig for each data item
  const getColor = (index: number, name: string) => {
    // Try to match by name first
    if (chartConfig[name]) {
      return chartConfig[name].color;
    }
    // Fallback to chart colors in order
    const chartColors = [
      "var(--chart-1)",
      "var(--chart-2)",
      "var(--chart-3)",
      "var(--chart-4)",
      "var(--chart-5)",
    ];
    return chartColors[index % chartColors.length];
  };

  return (
    <ChartContainer config={chartConfig} className={`h-[${height}] w-full ${className}`}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry) => entry.name}
          labelLine={true}
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={getColor(index, entry.name)} />
          ))}
        </Pie>
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: "12px" }}
        />
      </PieChart>
    </ChartContainer>
  );
}
