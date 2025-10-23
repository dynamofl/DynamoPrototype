// Generic Summary Cards Component
// Uses strategy pattern to display metrics for different test types

import type { EvaluationStrategy } from '../../../strategies/base-strategy'
import type { BaseEvaluationSummary } from '../../../types/base-evaluation'

interface GenericSummaryCardsProps {
  summary: BaseEvaluationSummary
  strategy: EvaluationStrategy
  testType: string
}

export function GenericSummaryCards({
  summary,
  strategy,
  testType
}: GenericSummaryCardsProps) {
  const summaryCards = strategy.getSummaryCards()

  const formatValue = (value: number | string, format?: 'number' | 'percentage' | 'duration' | 'custom', formatFn?: (value: number | string) => string): string => {
    if (formatFn) {
      return formatFn(value)
    }

    if (typeof value === 'string') {
      return value
    }

    switch (format) {
      case 'percentage':
        return `${(value * 100).toFixed(1)}%`
      case 'number':
        return value.toLocaleString()
      case 'duration':
        return `${value}ms`
      default:
        return String(value)
    }
  }

  const getColorClasses = (color?: 'red' | 'green' | 'blue' | 'amber' | 'gray') => {
    switch (color) {
      case 'green':
        return 'bg-green-50 border-green-200'
      case 'red':
        return 'bg-red-50 border-red-200'
      case 'amber':
        return 'bg-amber-50 border-amber-200'
      case 'blue':
        return 'bg-blue-50 border-blue-200'
      case 'gray':
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
      {summaryCards.map((card) => {
        const value = card.getValue(summary)
        const formattedValue = formatValue(value, card.format, card.formatFn)

        return (
          <div
            key={card.title}
            className={`border rounded-lg p-4 ${getColorClasses(card.color)}`}
          >
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-450 text-gray-600">{card.title}</span>
                {card.icon}
              </div>
              <div className="text-2xl font-semibold text-gray-900">
                {formattedValue}
              </div>
              {card.description && (
                <span className="text-xs text-gray-500">{card.description}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
