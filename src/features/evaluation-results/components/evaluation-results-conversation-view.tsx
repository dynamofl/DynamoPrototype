import React from 'react'
import { MessagesSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { EvaluationRecord } from '../types'

interface EvaluationResultsConversationViewProps {
  data: EvaluationRecord[]
  totalCount: number
  hasMore: boolean
  onLoadMore: () => void
}

export function EvaluationResultsConversationView({ 
  data, 
  totalCount,
  hasMore,
  onLoadMore
}: EvaluationResultsConversationViewProps) {

  const renderAttackOutcome = (outcome: string) => (
    <Badge 
      variant="secondary" 
      className={`text-xs ${
        outcome === 'Attack Failed' 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-red-100 text-red-800 border-red-200'
      }`}
    >
      {outcome}
    </Badge>
  )


  return (
    <div className="h-full flex flex-col px-4">
      {/* Header Row - Fixed */}
      <div className="flex items-center h-8 border-b bg-gray-100 flex-shrink-0">
        <div className="w-12 flex items-center justify-center">
          <MessagesSquare className="h-4 w-4 text-gray-500" strokeWidth="2" />
        </div>
        <div className="flex-1 text-xs font-450 text-gray-600 pl-3">
          Test Conversations
        </div>
        <div className="w-[150px] text-sm text-gray-600 text-right pr-2">
          {totalCount > 0 ? `${data.length}/${totalCount}` : '0/0'}
        </div>
      </div>

      {/* Conversation List - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {data.length > 0 ? (
          <div>
            {data.map((record, index) => (
              <div
                key={record.id}
                className="flex py-2 items-center border-b group transition-colors hover:bg-gray-50"
              >
                {/* Row Number Cell */}
                <div className="w-12 flex items-center justify-center">
                  <span className="text-sm text-gray-500">
                    {index + 1}
                  </span>
                </div>

                {/* Conversation Content */}
                <div className="flex-1 min-w-0 pl-3">
                  <div className="text-[13px] font-450 text-gray-800 truncate max-w-md" title={record.basePrompt}>
                    {record.basePrompt}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="w-[150px] flex justify-end pr-2">
                  {renderAttackOutcome(record.attackOutcome)}
                </div>
              </div>
            ))}
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