/**
 * JudgementItemCard Component
 * Reusable card component for displaying judgement information with expandable details
 */

import { motion, AnimatePresence } from 'framer-motion'
import { Circle, ChevronsUpDown, ChevronsDownUp } from 'lucide-react'
import type { HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'

export interface JudgementListItem {
  id: string
  text: string
  behavior?: string
  guardrailName?: string
}

export interface JudgementItemCardProps {
  // Visual representation
  icon?: React.ReactNode

  // Main content slot - flexible for different card types
  children: React.ReactNode

  // Card behavior
  expandable?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  onMainClick?: () => void

  // Expandable list
  expandedItems?: JudgementListItem[]
  onItemHover?: (behavior: HoveredBehaviorContext | null) => void
  onItemClick?: (behavior: HoveredBehaviorContext) => void
  hoveredBehavior?: HoveredBehaviorContext | null
  selectedBehaviors?: Set<string> | null

  // Actions
  showExpandIcon?: boolean
  primaryAction?: {
    label: string
    icon?: React.ReactNode
    onClick: (e: React.MouseEvent) => void
  }
  expandedAction?: {
    label: string
    icon?: React.ReactNode
    onClick: (e: React.MouseEvent) => void
  }

  // Styling
  className?: string
  isAnnotationMode?: boolean
}

export function JudgementItemCard({
  icon,
  children,
  expandable = false,
  isExpanded = false,
  onToggle,
  onMainClick,
  expandedItems = [],
  onItemHover,
  onItemClick,
  hoveredBehavior,
  selectedBehaviors,
  showExpandIcon = true,
  primaryAction,
  expandedAction,
  className = '',
  isAnnotationMode = false
}: JudgementItemCardProps) {
  const hasExpandedItems = expandedItems.length > 0

  const handleMainClick = () => {
    if (expandable && hasExpandedItems && onToggle) {
      onToggle()
    }
    onMainClick?.()
  }

  return (
    <motion.div
      className={`bg-gray-0 border border-gray-200  px-1 flex flex-col w-full ${
        isAnnotationMode
          ? 'rounded-t-lg'
          : isExpanded
            ? 'shadow-md rounded-lg'
            : 'hover:bg-gray-50 rounded-lg'
      } ${className}`}
    >
      {/* Main Content Area */}
      <div
        className={`flex gap-2 items-start p-1 ${expandable && hasExpandedItems ? 'cursor-pointer' : ''}`}
        onClick={handleMainClick}
      >
        {/* Icon - rendered as-is to preserve background colors and styling */}
        {icon}

        {/* Main content passed as children */}
        <div className="flex-1 min-w-0">
          {children}
        </div>

        {/* Primary Action Button - shown before expand icon */}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="flex items-center gap-0.5 px-2 py-1 text-xs font-450 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            {primaryAction.label}
            {primaryAction.icon}
          </button>
        )}

        {/* Expand/Collapse Icon */}
        {expandable && hasExpandedItems && showExpandIcon && (
          <div className="flex gap-2 p-2 items-center">
            {isExpanded ? (
              <ChevronsDownUp className="w-4 h-4 shrink-0 text-gray-600" />
            ) : (
              <ChevronsUpDown className="w-4 h-4 shrink-0 text-gray-600" />
            )}
          </div>
        )}
      </div>

      {/* Expandable List */}
      <AnimatePresence initial={false}>
        {isExpanded && hasExpandedItems && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex flex-col gap-2 overflow-hidden pb-3"
          >
            {/* List Items */}
            {expandedItems.map((item) => {
              const isHovered =
                hoveredBehavior !== null &&
                hoveredBehavior !== undefined &&
                hoveredBehavior.behavior === item.behavior &&
                hoveredBehavior.guardrailName === item.guardrailName
              const isSelected =
                selectedBehaviors !== null &&
                selectedBehaviors !== undefined &&
                item.behavior &&
                selectedBehaviors.has(item.behavior)

              return (
                <div
                  key={item.id}
                  className="flex gap-2 items-start px-2 cursor-pointer"
                  onMouseEnter={() =>
                    item.behavior &&
                    item.guardrailName &&
                    onItemHover?.({ behavior: item.behavior, guardrailName: item.guardrailName })
                  }
                  onMouseLeave={() => onItemHover?.(null)}
                  onClick={() =>
                    item.behavior &&
                    item.guardrailName &&
                    onItemClick?.({ behavior: item.behavior, guardrailName: item.guardrailName })
                  }
                >
                  <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    <Circle
                      className={`w-2 h-2 transition-all ${
                        isHovered || isSelected
                          ? 'fill-gray-600 stroke-gray-600'
                          : 'fill-none stroke-gray-600'
                      }`}
                    />
                  </div>
                  <div
                    className={`flex-1 text-[0.8125rem] leading-5 transition-colors ${
                      isHovered || isSelected ? 'text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    {item.text}
                  </div>
                </div>
              )
            })}

            {/* Expanded Action Button */}
            {expandedAction && (
              <div className="flex justify-start ml-6 px-2 pt-1">
                <button
                  onClick={expandedAction.onClick}
                  className="flex items-center gap-0.5 px-2 py-1 text-xs font-450 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  {expandedAction.label}
                  {expandedAction.icon}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
