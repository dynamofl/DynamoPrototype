// Generic Conversation Content Component
// Displays the main content area without the sidebar

import type { BaseEvaluationResult } from '../../../types/base-evaluation'
import type { EvaluationStrategy, HighlightingContext } from '../../../strategies/base-strategy'

interface GenericConversationContentProps {
  record: BaseEvaluationResult
  strategy: EvaluationStrategy
  highlightingContext: HighlightingContext
  className?: string
}

export function GenericConversationContent({
  record,
  strategy,
  highlightingContext,
  className = ''
}: GenericConversationContentProps) {
  // Get conversation sections from strategy
  const sections = strategy.getConversationSections()
  const title = strategy.getConversationTitle(record)
  const badge = strategy.getConversationBadge(record)

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  // Filter sections based on condition
  const visibleSections = sortedSections.filter(section =>
    !section.condition || section.condition(record)
  )

  return (
    <div className={`h-full overflow-y-auto border-l border-r border-gray-200 py-6 px-12 ${className}`} onWheel={(e) => e.stopPropagation()}>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header with Title and Badge */}
        {(title || badge) && (
          <section className="px-2 space-y-2 pb-2">
            {title && (
              <h2 className="text-lg font-450 leading-6 text-gray-900">
                {title}
              </h2>
            )}
            {badge && (
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-450 ${
                    badge.variant === 'destructive'
                      ? 'bg-red-50 text-red-700'
                      : badge.variant === 'default'
                      ? 'bg-green-50 text-green-700'
                      : badge.variant === 'outline'
                      ? 'bg-gray-50 text-gray-700 border border-gray-200'
                      : 'bg-gray-100 text-gray-700'
                  } ${badge.color || ''}`}
                >
                  {badge.text}
                </span>
              </div>
            )}
          </section>
        )}

        {/* Dynamic Sections from Strategy */}
        {visibleSections.map((section) => (
          <section key={section.key} className="space-y-3">
            {section.render(record, highlightingContext)}
          </section>
        ))}
      </div>
    </div>
  )
}
