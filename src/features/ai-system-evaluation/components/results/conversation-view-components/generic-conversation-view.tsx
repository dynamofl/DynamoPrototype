// Generic Conversation View Component
// Composed wrapper that combines content and sidebar for backward compatibility

import type { BaseEvaluationResult } from '../../../types/base-evaluation'
import type { EvaluationStrategy } from '../../../strategies/base-strategy'
import { GenericConversationContent } from './generic-conversation-content'
import { GenericJudgementsSidebar } from './generic-judgements-sidebar'
import { useConversationHighlighting } from './use-conversation-highlighting'

interface GenericConversationViewProps {
  record: BaseEvaluationResult
  strategy: EvaluationStrategy
  aiSystemName?: string
  judgementSidebarWidth?: number  // Width in pixels for the judgement sidebar (default: 450)
  testType?: 'jailbreak' | 'compliance'
  onRecordUpdate?: (record: BaseEvaluationResult) => void
  isAnnotationModeEnabled?: boolean
}

export function GenericConversationView({
  record,
  strategy,
  aiSystemName,
  judgementSidebarWidth = 450,
  testType,
  onRecordUpdate,
  isAnnotationModeEnabled = false
}: GenericConversationViewProps) {
  // Use highlighting hook for state management
  const {
    highlightingContext,
    expandedKeys,
    setExpandedKeys,
    hoveredBehavior,
    setHoveredBehavior,
    selectedBehaviors
  } = useConversationHighlighting(record)

  return (
    <div
      className="h-full grid"
      style={{ gridTemplateColumns: `1fr ${judgementSidebarWidth}px` }}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Main Content - Left Side */}
      <GenericConversationContent
        record={record}
        strategy={strategy}
        highlightingContext={highlightingContext}
        testType={testType}
      />

      {/* Judgements Sidebar - Right Side */}
      <GenericJudgementsSidebar
        record={record}
        strategy={strategy}
        aiSystemName={aiSystemName}
        expandedKeys={expandedKeys}
        onExpandedKeysChange={setExpandedKeys}
        hoveredBehavior={hoveredBehavior}
        onBehaviorHover={setHoveredBehavior}
        selectedBehaviors={selectedBehaviors}
        isAnnotationModeEnabled={isAnnotationModeEnabled}
        testType={testType}
        onRecordUpdate={onRecordUpdate}
      />
    </div>
  )
}
