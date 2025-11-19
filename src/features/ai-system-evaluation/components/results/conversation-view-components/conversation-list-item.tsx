/**
 * ConversationListItem Component
 * Reusable component for displaying conversation items in a list
 */

import React from 'react'

export interface ConversationListItemProps {
  // Row identification
  rowNumber: number

  // Main content
  content: string
  contentTitle?: string // Optional tooltip text

  // Indicator dot
  indicator?: {
    show: boolean
    color: 'blue' | 'amber' | 'green' | 'red'
  }

  // Right-side badge/status
  badge?: React.ReactNode

  // State
  isSelected?: boolean

  // Interaction
  onClick?: () => void

  // Styling
  className?: string
}

const indicatorColorMap = {
  blue: 'bg-blue-600',
  amber: 'bg-amber-600',
  green: 'bg-green-600',
  red: 'bg-red-600'
}

export function ConversationListItem({
  rowNumber,
  content,
  contentTitle,
  indicator,
  badge,
  isSelected = false,
  onClick,
  className = ''
}: ConversationListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex p-2 items-center group transition-colors rounded-md cursor-pointer ${
        isSelected
          ? 'bg-blue-50 border-blue-200'
          : 'hover:bg-gray-100 border-none'
      } ${className}`}
    >
      {/* Row Number Cell with Indicator */}
      <div className="w-8 flex items-center justify-center relative">
        {indicator?.show && (
          <div className={`absolute left-0 w-1 h-1 rounded-full ${indicatorColorMap[indicator.color]}`} />
        )}
        <span className="text-[0.8125rem] text-gray-500">
          {rowNumber}
        </span>
      </div>

      {/* Conversation Content */}
      <div className="flex-1 min-w-0 pl-3">
        <div
          className="text-[0.8125rem] font-450 text-gray-800 truncate max-w-md"
          title={contentTitle || content}
        >
          {content}
        </div>
      </div>

      {/* Status Badge */}
      {badge && (
        <div className="w-[120px] flex justify-end">
          {badge}
        </div>
      )}
    </div>
  )
}
