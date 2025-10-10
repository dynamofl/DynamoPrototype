import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";

interface PolicyResultsSectionProps {
  byPolicy: JailbreakEvaluationOutput['summary']['byPolicy'];
}

export function PolicyResultsSection({ byPolicy }: PolicyResultsSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Results by Policy</h3>
      <div className="space-y-3">
        {Object.entries(byPolicy).map(([policyId, stats]) => (
          <div key={policyId} className="bg-gray-0 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{stats.policyName}</h4>
                <p className="text-sm text-gray-600 mt-1">{stats.total} tests</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className={`text-lg font-semibold ${stats.successRate > 50 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Successes</p>
                  <p className="text-lg font-semibold text-red-600">{stats.successes}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Failures</p>
                  <p className="text-lg font-semibold text-green-600">{stats.failures}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
