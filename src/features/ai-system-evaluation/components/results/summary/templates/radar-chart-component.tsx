import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartComponentProps } from "./types";

export function RadarChartComponent({
  data,
  chartConfig,
  height = "240px",
  className = "",
}: ChartComponentProps) {
  return (
    <ChartContainer config={chartConfig} className={`h-[${height}] w-full ${className}`}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid className="stroke-gray-200" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: "rgb(var(--gray-600))", fontSize: 11 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: "rgb(var(--gray-600))", fontSize: 10 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        {Object.keys(chartConfig).map((key) => (
          <Radar
            key={key}
            name={chartConfig[key].label}
            dataKey={key}
            stroke={`var(--color-${key})`}
            fill={`var(--color-${key})`}
            fillOpacity={0.3}
            strokeWidth={2}
          />
        ))}
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          iconType="circle"
        />
      </RadarChart>
    </ChartContainer>
  );
}
