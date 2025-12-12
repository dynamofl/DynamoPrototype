import type { HallucinationEvaluationSummary } from "../../../types/hallucination-evaluation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CategoryBreakdownTableSectionProps {
  summary: HallucinationEvaluationSummary;
}

export function CategoryBreakdownTableSection({ summary }: CategoryBreakdownTableSectionProps) {
  // Get categories sorted by count (excluding N/A)
  const categories = summary.by_category
    ? Object.entries(summary.by_category)
        .filter(([category]) => category !== 'N/A')
        .sort((a, b) => b[1].count - a[1].count)
    : [];

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-dashed border-gray-200 py-6 mx-3">
      <div>
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="text-gray-600 font-medium">Category</TableHead>
              <TableHead className="text-right text-gray-600 font-medium">Count</TableHead>
              <TableHead className="text-right text-gray-600 font-medium">Percentage</TableHead>
              <TableHead className="text-right text-gray-600 font-medium">Avg Safety Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(([category, stats]) => (
              <TableRow key={category} className="border-gray-200">
                <TableCell className="font-medium text-gray-900">{category}</TableCell>
                <TableCell className="text-right text-gray-900">{stats.count}</TableCell>
                <TableCell className="text-right">
                  <span className="text-red-600 font-medium">
                    {stats.percentage.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-right text-gray-900">
                  {(stats.avg_safety_score * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
