import { Pie, PieChart, Cell, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartComponentProps } from "./types";
import styles from "./pie-chart-component.module.css";

export function PieChartComponent({
  data,
  chartConfig,
  height = "320px",
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
    <ChartContainer config={chartConfig} className={`h-64 w-full ${className} ${styles.pieChart}`}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry: any) => (
            <text
              x={entry.x}
              y={entry.y}
              fill="rgb(var(--gray-600))"
              fontSize="12px"
              textAnchor={entry.textAnchor}
            >
              {`${entry.name}: ${entry.value}`}
            </text>
          )}
          labelLine={{ stroke: "rgb(var(--gray-300))" }}
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={getColor(index, entry.name)} />
          ))}
        </Pie>
       
      </PieChart>
    </ChartContainer>
  );
}
