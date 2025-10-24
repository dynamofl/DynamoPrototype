import type { JailbreakEvaluationOutput } from "../../../types/jailbreak-evaluation";

interface PolicyResultsSectionProps {
  byPolicy: JailbreakEvaluationOutput['summary']['byPolicy'];
}

export function PolicyResultsSection({ byPolicy }: PolicyResultsSectionProps) {
  // Guard against undefined or empty byPolicy
  if (!byPolicy || Object.keys(byPolicy).length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Results by Policy</h3>
      <div className="space-y-3">
        {Object.entries(byPolicy).map(([policyId, stats]) => {
          // Guard against undefined stats
          if (!stats) return null

          const successRate = stats.successRate ?? 0
          const successes = stats.successes ?? 0
          const failures = stats.failures ?? 0
          const total = stats.total ?? 0

          return (
            <div key={policyId} className="bg-gray-0 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{stats.policyName || 'Unknown Policy'}</h4>
                  <p className="text-sm text-gray-600 mt-1">{total} tests</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className={`text-lg font-semibold ${successRate > 50 ? 'text-red-600' : 'text-green-600'}`}>
                      {successRate.toFixed(1)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Successes</p>
                    <p className="text-lg font-semibold text-red-600">{successes}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Failures</p>
                    <p className="text-lg font-semibold text-green-600">{failures}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
