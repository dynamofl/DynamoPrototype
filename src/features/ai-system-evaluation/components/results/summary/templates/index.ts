// Main template components
export { SummaryTextSection } from "./summary-text-section";
export { SummaryTableSection } from "./summary-table-section";
export { SummaryChartSection } from "./summary-chart-section";

// Individual chart components
export { BarChartComponent } from "./bar-chart-component";
export { LineChartComponent } from "./line-chart-component";
export { AreaChartComponent } from "./area-chart-component";
export { PieChartComponent } from "./pie-chart-component";
export { RadialChartComponent } from "./radial-chart-component";
export { RadarChartComponent } from "./radar-chart-component";

// Types
export type {
  BaseSectionProps,
  SummaryTextSectionProps,
  Column,
  SummaryTableSectionProps,
  ChartType,
  SummaryChartSectionProps,
  ChartComponentProps,
} from "./types";

// Mock data exports for demonstration
export {
  mockTextSectionData,
  mockTextSectionWithTopDescription,
  mockTextSectionWithBothDescriptions,
} from "./summary-text-section";

export {
  mockTableSectionData,
  mockTableSectionWithCustomRender,
  mockTableSectionWithBadges,
} from "./summary-table-section";

export {
  mockBarChartData,
  mockLineChartData,
  mockAreaChartData,
  mockPieChartData,
  mockRadialChartData,
  mockRadarChartData,
} from "./summary-chart-section";
