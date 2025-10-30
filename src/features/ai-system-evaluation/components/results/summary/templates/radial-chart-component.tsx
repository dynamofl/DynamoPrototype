import { RadialBar, RadialBarChart, PolarAngleAxis, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartComponentProps } from "./types";

export function RadialChartComponent({
  data,
  chartConfig,
  height = "240px",
  className = "",
}: ChartComponentProps) {
  // Transform data to include fill colors from chartConfig
  const transformedData = data.map((item, index) => {
    const configKey = Object.keys(chartConfig)[index] || Object.keys(chartConfig)[0];
    return {
      ...item,
      fill: chartConfig[configKey]?.color || `var(--chart-${index + 1})`,
    };
  });

  return (
    <ChartContainer config={chartConfig} className={`h-[${height}] w-full ${className}`}>
      <RadialBarChart
        data={transformedData}
        innerRadius="10%"
        outerRadius="80%"
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <RadialBar
          dataKey="value"
          cornerRadius={10}
          label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: "12px" }}
        />
      </RadialBarChart>
    </ChartContainer>
  );
}
