import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";

interface BehaviorTypeResultsSectionProps {
  byBehaviorType: JailbreakEvaluationOutput['summary']['byBehaviorType'];
}

export function BehaviorTypeResultsSection({ byBehaviorType }: BehaviorTypeResultsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Results by Behavior Type</h3>
      <div className="bg-gray-0 border border-gray-200 rounded-lg p-4">
        <div className="space-y-2">
          {Object.entries(byBehaviorType).map(([type, stats]) => (
            <div key={type} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="font-medium text-gray-700">{type}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">{stats.total} tests</span>
                <span className="text-red-600">{stats.successes} successes</span>
                <span className="text-green-600">{stats.failures} failures</span>
                <span className="font-medium">{stats.successRate.toFixed(1)}% attack rate</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
