import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SummaryTableSectionProps } from "./types";

export function SummaryTableSection({
  title,
  columns,
  data,
  topDescription,
  bottomDescription,
  className = "",
}: SummaryTableSectionProps) {
  return (
    <div className={`max-w-4xl mx-auto space-y-4 my-4 ${className}`}>
      <div className="space-y-3 pt-4 pb-2 rounded-xl">
        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-3">
            <p className="text-sm font-550 leading-4 text-gray-900">{title}</p>
          </div>
        </div>

        {/* Top Description */}
        {topDescription && (
          <div className="space-y-2 px-3">
            <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
              {topDescription}
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="px-3">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 border-0 hover:bg-gray-100">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`font-450 ${
                    column.align === "right"
                      ? "text-right"
                      : column.align === "center"
                        ? "text-center"
                        : "pl-3"
                  } ${column.width ? `w-[${column.width}]` : ""}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={`text-gray-900 font-450 ${
                      column.align === "right"
                        ? "text-right"
                        : column.align === "center"
                          ? "text-center"
                          : "pl-3"
                    }`}
                  >
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Bottom Description */}
      {bottomDescription && (
        <div className="space-y-2 px-3 pb-2">
          <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
            {bottomDescription}
          </p>
        </div>
      )}
    </div>
  );
}

// Mock data example for demonstration
export const mockTableSectionData: SummaryTableSectionProps = {
  title: "Performance Metrics",
  columns: [
    { key: "metric", header: "Metric", align: "left" },
    { key: "value", header: "Value", align: "right", width: "100px" },
    { key: "status", header: "Status", align: "center", width: "120px" },
  ],
  data: [
    { metric: "Total Tests", value: "1,247", status: "Completed" },
    { metric: "Success Rate", value: "94.3%", status: "Good" },
    { metric: "Average Response Time", value: "234ms", status: "Excellent" },
    { metric: "Error Rate", value: "5.7%", status: "Acceptable" },
    { metric: "Coverage", value: "98.2%", status: "Excellent" },
  ],
  bottomDescription: "All metrics measured over 30-day evaluation period.",
};

// Example with custom rendering
export const mockTableSectionWithCustomRender: SummaryTableSectionProps = {
  title: "Attack Type Results",
  columns: [
    { key: "attackType", header: "Attack Type", align: "left" },
    { key: "total", header: "Total", align: "right", width: "80px" },
    { key: "blocked", header: "Blocked", align: "right", width: "80px" },
    {
      key: "successRate",
      header: "Success Rate",
      align: "right",
      width: "120px",
      render: (value: number) => {
        const color =
          value >= 90
            ? "text-green-600"
            : value >= 70
              ? "text-amber-600"
              : "text-red-600";
        return <span className={`${color} font-550`}>{value}%</span>;
      },
    },
  ],
  data: [
    { attackType: "Direct Attacks", total: 342, blocked: 298, successRate: 87 },
    { attackType: "Obfuscation", total: 267, blocked: 246, successRate: 92 },
    {
      attackType: "Context Manipulation",
      total: 198,
      blocked: 154,
      successRate: 78,
    },
    { attackType: "Role Play", total: 289, blocked: 246, successRate: 85 },
    { attackType: "Payload Splitting", total: 151, blocked: 137, successRate: 91 },
  ],
  topDescription:
    "Breakdown of system performance across different attack categories.",
  bottomDescription:
    "Success rates indicate the percentage of attacks successfully blocked by the system.",
};

// Example with status badges
export const mockTableSectionWithBadges: SummaryTableSectionProps = {
  title: "Compliance Status",
  columns: [
    { key: "requirement", header: "Requirement", align: "left" },
    { key: "category", header: "Category", align: "left", width: "150px" },
    {
      key: "status",
      header: "Status",
      align: "center",
      width: "120px",
      render: (value: string) => {
        const statusStyles = {
          Compliant: "bg-green-100 text-green-700",
          "Partially Compliant": "bg-amber-100 text-amber-700",
          "Non-Compliant": "bg-red-100 text-red-700",
          "Under Review": "bg-gray-100 text-gray-700",
        };
        const style =
          statusStyles[value as keyof typeof statusStyles] ||
          "bg-gray-100 text-gray-700";
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-450 ${style}`}
          >
            {value}
          </span>
        );
      },
    },
  ],
  data: [
    {
      requirement: "Data Privacy Controls",
      category: "Privacy",
      status: "Compliant",
    },
    {
      requirement: "Access Management",
      category: "Security",
      status: "Compliant",
    },
    {
      requirement: "Audit Logging",
      category: "Compliance",
      status: "Partially Compliant",
    },
    {
      requirement: "Encryption Standards",
      category: "Security",
      status: "Compliant",
    },
    {
      requirement: "Incident Response",
      category: "Operations",
      status: "Under Review",
    },
  ],
  bottomDescription: "Compliance status reviewed as of current evaluation date.",
};
