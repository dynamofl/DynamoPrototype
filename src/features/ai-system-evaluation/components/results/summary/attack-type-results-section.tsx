import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";

interface AttackTypeResultsSectionProps {
  byAttackType: JailbreakEvaluationOutput['summary']['byAttackType'];
}

export function AttackTypeResultsSection({ byAttackType }: AttackTypeResultsSectionProps) {
  if (!byAttackType) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Results by Attack Type</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(byAttackType).map(([attackType, stats]) => (
          <div key={attackType} className="bg-gray-0 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{attackType}</h4>
              <span className={`text-xs px-2 py-1 rounded ${
                (stats.successRate ?? 0) > 50 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {(stats.successRate ?? 0).toFixed(1)}% success
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{stats.total ?? 0} tests</span>
              <div className="flex gap-3">
                <span className="text-red-600">{stats.successes ?? 0} successes</span>
                <span className="text-green-600">{stats.failures ?? 0} failures</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
