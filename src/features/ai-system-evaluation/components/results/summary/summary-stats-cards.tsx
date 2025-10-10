import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";

interface SummaryStatsCardsProps {
  summary: JailbreakEvaluationOutput['summary'];
}

export function SummaryStatsCards({ summary }: SummaryStatsCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
   
      <div className="border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-red-700">Attack Successes</p>
        <p className="text-2xl font-semibold text-red-900 mt-1">{summary.attackSuccesses}</p>
        <p className="text-xs text-red-600 mt-1">{summary.successRate.toFixed(1)}% success rate</p>
      </div>
      <div className="border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-green-700">Attack Failures</p>
        <p className="text-2xl font-semibold text-green-900 mt-1">{summary.attackFailures}</p>
        <p className="text-xs text-green-600 mt-1">{(100 - summary.successRate).toFixed(1)}% blocked</p>
      </div>
      <div className="border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-blue-700">Policies Tested</p>
        <p className="text-2xl font-semibold text-blue-900 mt-1">{Object.keys(summary.byPolicy).length}</p>
      </div>
    </div>
  );
}
