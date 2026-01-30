import {
  SummaryTextSection,
  SummaryTableSection,
  SummaryChartSection,
  mockTextSectionData,
  mockTextSectionWithTopDescription,
  mockTextSectionWithBothDescriptions,
  mockTableSectionData,
  mockTableSectionWithCustomRender,
  mockTableSectionWithBadges,
  mockBarChartData,
  mockLineChartData,
  mockAreaChartData,
  mockPieChartData,
  mockRadialChartData,
  mockRadarChartData,
} from "@/features/ai-system-evaluation/components/results/summary/templates";

export function ResultTypesPage() {
  return (
    <div className="min-h-screen bg-gray-0">
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-550 text-gray-900">Result Types</h1>
          <p className="text-sm text-gray-600">
            Explore different template components for displaying evaluation results.
          </p>
        </div>

        {/* Text Components Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-550 text-gray-900">Text Components</h2>
            <p className="text-sm text-gray-600">
              Display textual information with flexible description options.
            </p>
          </div>

          <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-0 p-6">
            <SummaryTextSection {...mockTextSectionData} />
            <div className="border-t border-gray-200" />
            <SummaryTextSection {...mockTextSectionWithTopDescription} />
            <div className="border-t border-gray-200" />
            <SummaryTextSection {...mockTextSectionWithBothDescriptions} />
          </div>
        </div>

        {/* Table Components Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-550 text-gray-900">Table Components</h2>
            <p className="text-sm text-gray-600">
              Present structured data in tabular format with custom rendering support.
            </p>
          </div>

          <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-0 p-6">
            <SummaryTableSection {...mockTableSectionData} />
            <div className="border-t border-gray-200" />
            <SummaryTableSection {...mockTableSectionWithCustomRender} />
            <div className="border-t border-gray-200" />
            <SummaryTableSection {...mockTableSectionWithBadges} />
          </div>
        </div>

        {/* Chart Components Section */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-550 text-gray-900">Chart Components</h2>
            <p className="text-sm text-gray-600">
              Visualize data with various chart types including bar, line, area, pie, radial, and radar charts.
            </p>
          </div>

          <div className="space-y-6 rounded-lg border border-gray-200 bg-gray-0 p-6">
            {/* Bar Chart */}
            <div>
              <h3 className="mb-4 text-lg font-550 text-gray-900">Bar Chart</h3>
              <SummaryChartSection {...mockBarChartData} />
            </div>

            <div className="border-t border-gray-200" />

            {/* Line Chart */}
            <div>
              <h3 className="mb-4 text-lg font-550 text-gray-900">Line Chart</h3>
              <SummaryChartSection {...mockLineChartData} />
            </div>

            <div className="border-t border-gray-200" />

            {/* Area Chart */}
            <div>
              <h3 className="mb-4 text-lg font-550 text-gray-900">Area Chart</h3>
              <SummaryChartSection {...mockAreaChartData} />
            </div>

            <div className="border-t border-gray-200" />

            {/* Pie Chart */}
            <div>
              <h3 className="mb-4 text-lg font-550 text-gray-900">Pie Chart</h3>
              <SummaryChartSection {...mockPieChartData} />
            </div>

            <div className="border-t border-gray-200" />

            {/* Radial Chart */}
            <div>
              <h3 className="mb-4 text-lg font-550 text-gray-900">Radial Chart</h3>
              <SummaryChartSection {...mockRadialChartData} />
            </div>

            <div className="border-t border-gray-200" />

            {/* Radar Chart */}
            <div>
              <h3 className="mb-4 text-lg font-550 text-gray-900">Radar Chart</h3>
              <SummaryChartSection {...mockRadarChartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
