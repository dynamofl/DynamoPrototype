import type { ChartConfig } from "@/components/ui/chart";

// Base section props
export interface BaseSectionProps {
  title: string;
  topDescription?: string;
  bottomDescription?: string;
  className?: string;
}

// Text section
export interface SummaryTextSectionProps extends BaseSectionProps {
  description?: string;
}

// Table section
export interface Column {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

export interface SummaryTableSectionProps extends BaseSectionProps {
  columns: Column[];
  data: any[];
}

// Chart section
export type ChartType = "bar" | "line" | "area" | "pie" | "radial" | "radar";

export interface SummaryChartSectionProps extends BaseSectionProps {
  chartType: ChartType;
  data: any[];
  chartConfig: ChartConfig;
  height?: string;
}

// Individual chart component props
export interface ChartComponentProps {
  data: any[];
  chartConfig: ChartConfig;
  height?: string;
  className?: string;
}
