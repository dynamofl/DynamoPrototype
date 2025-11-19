import React, { useEffect, useRef } from 'react'
import { MessagesSquare, ChevronUp, ChevronDown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { BaseEvaluationResult } from '../../../types/base-evaluation'
import type { EvaluationStrategy } from '../../../strategies/base-strategy'

interface EvaluationDataConversationViewProps {
  data: BaseEvaluationResult[]
  strategy: EvaluationStrategy
  totalCount: number
  hasMore: boolean
  onLoadMore: () => void
  selectedConversationId: string | null
  onConversationSelect: (id: string) => void
}

export function EvaluationDataConversationView({
  data,
  strategy,
  totalCount,
  hasMore,
  onLoadMore,
  selectedConversationId,
  onConversationSelect
}: EvaluationDataConversationViewProps) {

  const containerRef = useRef<HTMLDivElement>(null)

  // Find the selected conversation's position
  const selectedIndex = selectedConversationId
    ? data.findIndex(record => (record as any).id === selectedConversationId)
    : -1
  const selectedPosition = selectedIndex >= 0 ? selectedIndex + 1 : 0

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.shiftKey || data.length === 0) return

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault()

        const currentIndex = selectedIndex >= 0 ? selectedIndex : 0

        if (event.key === 'ArrowUp') {
          // Only navigate up if not at the top
          if (currentIndex > 0) {
            onConversationSelect((data[currentIndex - 1] as any).id)
          }
        } else if (event.key === 'ArrowDown') {
          // Only navigate down if not at the bottom
          if (currentIndex < data.length - 1) {
            onConversationSelect((data[currentIndex + 1] as any).id)
          }
        }
      }
    }

    // Add event listener to document to capture keyboard events globally
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, data, onConversationSelect])

  // Navigation functions
  const navigateUp = () => {
    if (data.length === 0 || selectedIndex <= 0) return
    onConversationSelect((data[selectedIndex - 1] as any).id)
  }

  const navigateDown = () => {
    if (data.length === 0 || selectedIndex >= data.length - 1) return
    onConversationSelect((data[selectedIndex + 1] as any).id)
  }

  // Check if navigation buttons should be disabled
  const isUpDisabled = data.length === 0 || selectedIndex <= 0
  const isDownDisabled = data.length === 0 || selectedIndex >= data.length - 1

  const renderOutcomeBadge = (record: BaseEvaluationResult) => {
    const badge = strategy.getConversationBadge(record)
    if (!badge) return null

    return (
      <Badge
        variant="secondary"
        className={`text-xs ${badge.color} bg-transparent border-0 font-400 text-gray-500`}
      >
        {badge.text}
      </Badge>
    )
  }


  return (
    <div
      ref={containerRef}
      className="pl-4 pr-2 h-full flex flex-col "
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Header Row - Fixed */}
      <div className="flex items-center h-8 border-b flex-shrink-0 px-2 my-1 ">
        <div className="w-8 flex items-center justify-center">
          <MessagesSquare className="h-4 w-4 text-gray-500" strokeWidth="2" />
        </div>
        <div className="flex-1 text-xs font-medium text-gray-600 pl-3">
          Test Conversations
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-normal text-gray-600 text-right min-w-fit">
            {totalCount > 0 ? `${selectedPosition}/${totalCount}` : '0/0'}
          </div>
          <div className="flex gap-1 p-0.5">
            <button
              onClick={navigateUp}
              disabled={isUpDisabled}
              className="w-5 h-5 bg-gray-50 rounded flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              title="Previous conversation (Shift + ↑)"
            >
              <ChevronUp className="w-3 h-3 text-gray-600" />
            </button>
            <button
              onClick={navigateDown}
              disabled={isDownDisabled}
              className="w-5 h-5 bg-gray-50 rounded flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              title="Next conversation (Shift + ↓)"
            >
              <ChevronDown className="w-3 h-3 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Conversation List - Scrollable */}
      <div className="flex-1 overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
        {data.length > 0 ? (
          <div>
            {data.map((record, index) => {
              const recordWithId = record as any
              const isSelected = selectedConversationId === recordWithId.id
              // Check if record has human judgement
              const hasHumanJudgement = recordWithId.system_response?.human_judgement

              // Check for judgement contradiction
              const aiJudgement = recordWithId.judgeModelJudgement || recordWithId.modelJudgement || recordWithId.compliance_judgement
              const humanJudgement = hasHumanJudgement?.judgement
              const hasContradiction = humanJudgement && aiJudgement && (
                (aiJudgement === 'Answered' && humanJudgement === 'Refused') ||
                (aiJudgement === 'Refused' && humanJudgement === 'Answered') ||
                (aiJudgement === 'Compliant' && humanJudgement === 'Non-Compliant') ||
                (aiJudgement === 'Non-Compliant' && humanJudgement === 'Compliant')
              )

              // Check if outcome has been updated - only show amber if contradiction exists and not yet updated
              const isOutcomeUpdated = hasHumanJudgement?.outcome_updated
              const showAmberDot = hasContradiction && !isOutcomeUpdated

              return (
                <div
                  key={recordWithId.uniqueKey || recordWithId.id}
                  onClick={() => onConversationSelect(recordWithId.id)}
                  className={`flex p-2 items-center group transition-colors rounded-md cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 border-blue-200'
                      : 'hover:bg-gray-100 border-none'
                  }`}
                >
                {/* Row Number Cell */}
                <div className="w-8 flex items-center justify-center relative">
                  {hasHumanJudgement && (
                    <div className={`absolute left-0 w-1 h-1 rounded-full ${
                      showAmberDot ? 'bg-amber-600' : 'bg-blue-600'
                    }`} />
                  )}
                  <span className="text-[0.8125rem]  text-gray-500">
                    {index + 1}
                  </span>
                </div>

                {/* Conversation Content */}
                <div className="flex-1 min-w-0 pl-3">
                  {(() => {
                    // Access base prompt - check both snake_case and camelCase
                    const recordAny = record as any
                    const basePromptText = record.base_prompt || recordAny.basePrompt || 'No prompt'
                    return (
                      <div className="text-[0.8125rem]  font-450 text-gray-800 truncate max-w-md" title={basePromptText}>
                        {basePromptText}
                      </div>
                    )
                  })()}
                </div>

                {/* Status Badge */}
                <div className="w-[120px] flex justify-end ">
                  {renderOutcomeBadge(record)}
                </div>
              </div>
            )
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-8 text-gray-500">
            No evaluation results found
          </div>
        )}

        {/* Load More Button */}
        {hasMore && data.length > 0 && (
          <div className="p-4 text-center">
            <Button
              variant="outline"
              onClick={onLoadMore}
              className="w-full"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
