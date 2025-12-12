import type { HallucinationEvaluationSummary } from "../../../types/hallucination-evaluation"

interface CategoryResultsSectionProps {
  byCategory: HallucinationEvaluationSummary['by_category']
}

export function CategoryResultsSection({ byCategory }: CategoryResultsSectionProps) {
  // Guard against undefined or empty byCategory
  if (!byCategory || Object.keys(byCategory).length === 0) {
    return null
  }

  // Define category order and display labels
  const categoryOrder: Record<string, string> = {
    'N/A': 'No Hallucination',
    'Citation / Attribution Errors': 'Citation / Attribution Errors',
    'Entity Inaccuracies': 'Entity Inaccuracies',
    'Context contradictions': 'Context Contradictions'
  }

  // Sort categories by order defined above
  const sortedCategories = Object.entries(byCategory).sort((a, b) => {
    const orderA = Object.keys(categoryOrder).indexOf(a[0])
    const orderB = Object.keys(categoryOrder).indexOf(b[0])
    return orderA - orderB
  })

  return (
    <div className="border-t border-dashed border-gray-200 py-6 mx-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sortedCategories.map(([category, stats]) => {
          // Guard against undefined stats
          if (!stats) return null

          const count = stats.count ?? 0
          const percentage = stats.percentage ?? 0
          const avgSafetyScore = stats.avg_safety_score ?? 0
          const displayLabel = categoryOrder[category] || category

          // Determine color based on category type
          const isHallucination = category !== 'N/A'

          return (
            <div
              key={category}
              className="bg-gray-0 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{displayLabel}</h4>
                  <p className="text-sm text-gray-600 mt-0.5">{count} tests</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Percentage</p>
                  <p className={`text-lg font-semibold ${
                    isHallucination ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Safety Score</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {(avgSafetyScore * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Safety score visual indicator */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div
                    className={`h-1.5 rounded-full ${
                      avgSafetyScore >= 0.8 ? 'bg-green-600' :
                      avgSafetyScore >= 0.5 ? 'bg-amber-500' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${avgSafetyScore * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
