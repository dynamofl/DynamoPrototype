/**
 * ConversationFeedItem Component
 * Reusable component for rendering conversation sections with configurable features
 */

import React, { useState } from 'react'
import { HighlightedText } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { HighlightedMarkdownRenderer } from './shared-components'
import { MarkdownRenderer } from '@/components/patterns/ui-patterns/markdown-renderer'
import type { HighlightingContext } from '../../../strategies/base-strategy'

export interface ConversationTurn {
  role: string
  content: string
}

export interface ConversationFeedItemProps {
  title: string
  subtitle?: string | React.ReactNode
  variant: 'single-turn' | 'multi-turn'
  content: string | ConversationTurn[]

  // Feature toggles
  enableMarkdown?: boolean
  enableHighlight?: boolean
  enableReadMore?: boolean

  // Highlighting configuration (required when enableHighlight is true)
  highlightingContext?: HighlightingContext
  highlightType?: 'input' | 'output'
  showHighlightByDefault?: boolean

  className?: string
}

export function ConversationFeedItem({
  title,
  subtitle,
  variant,
  content,
  enableMarkdown = false,
  enableHighlight = false,
  enableReadMore = false,
  highlightingContext,
  highlightType = 'input',
  showHighlightByDefault = true,
  className
}: ConversationFeedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Validate that highlighting context is provided when highlighting is enabled
  if (enableHighlight && !highlightingContext) {
    console.warn('ConversationFeedItem: enableHighlight is true but highlightingContext is not provided')
  }

  // Render multi-turn conversation
  if (variant === 'multi-turn') {
    const turns = Array.isArray(content) ? content : []

    return (
      <div className={`space-y-2 ${className || ''}`}>
        <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
          {title}
          {subtitle && <span className="text-gray-500"> {subtitle}</span>}
        </h3>
        <div className="p-2 space-y-4 border border-gray-200 rounded-md">
          {turns.map((turn, index) => (
            <div key={index} className="space-y-1">
              <div className="text-xs font-450 uppercase tracking-wide text-gray-600">
                {turn.role}
              </div>
              <div className="rounded-lg pt-1 pb-2 text-sm font-400 leading-5">
                {renderContent(
                  turn.content,
                  enableMarkdown,
                  enableHighlight,
                  highlightingContext,
                  highlightType,
                  showHighlightByDefault
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Render single-turn conversation
  const textContent = typeof content === 'string' ? content : ''

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <h3 className="px-2 text-[0.8125rem] font-450 leading-4 text-gray-600">
        {title}
        {subtitle && <span className="text-gray-500"> {subtitle}</span>}
      </h3>
      <div className="px-2">
        <div className={enableReadMore && !isExpanded ? 'line-clamp-3' : ''}>
          <div className="text-sm font-425 leading-5 text-gray-900">
            {renderContent(
              textContent,
              enableMarkdown,
              enableHighlight,
              highlightingContext,
              highlightType,
              showHighlightByDefault
            )}
          </div>
        </div>
        {enableReadMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-[0.8125rem] font-450 text-blue-600 hover:text-amber-700 transition-colors"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Helper function to render content based on markdown and highlight settings
 */
function renderContent(
  text: string,
  enableMarkdown: boolean,
  enableHighlight: boolean,
  ctx: HighlightingContext | undefined,
  highlightType: 'input' | 'output',
  showHighlightByDefault: boolean
): React.ReactNode {
  // Case 1: Markdown + Highlighting
  if (enableMarkdown && enableHighlight && ctx) {
    const highlightPhrases = highlightType === 'input'
      ? (ctx.shouldHighlightPrompt ? ctx.highlightPhrases : ctx.allInputPhrases)
      : (ctx.shouldHighlightResponse ? ctx.highlightPhrases : ctx.allOutputPhrases)

    return (
      <HighlightedMarkdownRenderer
        content={text}
        highlightPhrases={highlightPhrases}
        highlightColor={ctx.highlightColor}
        hoveredBehavior={ctx.hoveredBehavior}
        selectedBehavior={ctx.selectedBehavior}
        selectedBehaviors={ctx.selectedBehaviors}
        selectedPhraseText={ctx.selectedPhraseText}
        onPhraseClick={(idx) => ctx.handlePhraseClick(idx, highlightType)}
        showHighlightByDefault={showHighlightByDefault}
      />
    )
  }

  // Case 2: Markdown only (no highlighting)
  if (enableMarkdown && !enableHighlight) {
    return <MarkdownRenderer content={text} />
  }

  // Case 3: Highlighting only (no markdown)
  if (enableHighlight && ctx && !enableMarkdown) {
    const highlightPhrases = highlightType === 'input'
      ? (ctx.shouldHighlightPrompt ? ctx.highlightPhrases : ctx.allInputPhrases)
      : (ctx.shouldHighlightResponse ? ctx.highlightPhrases : ctx.allOutputPhrases)

    return (
      <HighlightedText
        highlightPhrases={highlightPhrases}
        className="text-sm leading-5 text-gray-900"
        highlightColor={ctx.highlightColor}
        hoveredBehavior={ctx.hoveredBehavior}
        selectedBehavior={ctx.selectedBehavior}
        selectedBehaviors={ctx.selectedBehaviors}
        selectedPhraseText={ctx.selectedPhraseText}
        onPhraseClick={(idx) => ctx.handlePhraseClick(idx, highlightType)}
        showHighlightByDefault={showHighlightByDefault}
      >
        {text}
      </HighlightedText>
    )
  }

  // Case 4: Plain text (no markdown, no highlighting)
  return text
}
