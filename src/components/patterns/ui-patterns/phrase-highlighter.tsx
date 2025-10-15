import { Fragment } from 'react'

export interface HighlightPhrase {
  phrase: string
  guardrailName: string
  violatedBehaviors: string[]
}

export type HighlightColor = 'amber' | 'green' | 'red'

export interface HoveredBehaviorContext {
  behavior: string
  guardrailName: string
}

interface PhraseHighlighterProps {
  text: string
  highlightPhrases?: HighlightPhrase[]
  className?: string
  highlightColor?: HighlightColor  // Defaults to 'amber' for violations
  hoveredPhraseIndex?: number | null  // Index of the phrase being hovered in sidebar
  hoveredBehavior?: HoveredBehaviorContext | null  // Specific behavior being hovered (for behavior-level highlighting)
  selectedBehaviors?: Set<string> | null  // Behaviors selected from phrase click (for multi-behavior highlighting)
  onPhraseHover?: (index: number | null) => void  // Callback when phrase is hovered
  onPhraseClick?: (index: number) => void  // Callback when phrase is clicked
  showHighlightByDefault?: boolean  // If false, only show highlight on hover (default: true)
}

/**
 * PhraseHighlighter Component
 *
 * Highlights specific phrases in text with underline and shows tooltips.
 * Background color is added only when phrase is hovered in sidebar.
 *
 * Features:
 * - Case-insensitive phrase matching
 * - Handles overlapping phrases (longer phrases take precedence)
 * - Shows guardrail name and violated behaviors in tooltip
 * - Default: border/underline only (amber for violations, green for answers)
 * - Hover: adds background color for emphasis
 * - Click: triggers callback to expand related judgment in sidebar
 */
export function PhraseHighlighter({
  text,
  highlightPhrases = [],
  className = '',
  highlightColor = 'amber',
  hoveredPhraseIndex = null,
  hoveredBehavior = null,
  selectedBehaviors = null,
  onPhraseHover,
  onPhraseClick,
  showHighlightByDefault = true
}: PhraseHighlighterProps) {
  // If no phrases to highlight, return original text
  if (!highlightPhrases || highlightPhrases.length === 0) {
    return <span className={className}>{text}</span>
  }

  // Sort phrases by length (descending) to handle overlapping matches
  const sortedPhrases = [...highlightPhrases].sort((a, b) =>
    b.phrase.length - a.phrase.length
  )

  // Build a map of text positions to highlight
  interface HighlightRange {
    start: number
    end: number
    phraseInfo: HighlightPhrase
    phraseIndex: number  // Index in the original highlightPhrases array
  }

  const ranges: HighlightRange[] = []
  const textLower = text.toLowerCase()

  // Find all occurrences of each phrase
  for (let phraseIdx = 0; phraseIdx < sortedPhrases.length; phraseIdx++) {
    const phraseInfo = sortedPhrases[phraseIdx]
    const phraseLower = phraseInfo.phrase.toLowerCase()

    // Find the original index of this phrase in highlightPhrases
    const originalIndex = highlightPhrases.findIndex(p => p.phrase === phraseInfo.phrase)

    let searchStart = 0

    while (true) {
      const index = textLower.indexOf(phraseLower, searchStart)
      if (index === -1) break

      const end = index + phraseInfo.phrase.length

      // Check if this range overlaps with existing ranges
      const overlaps = ranges.some(r =>
        (index >= r.start && index < r.end) ||
        (end > r.start && end <= r.end) ||
        (index <= r.start && end >= r.end)
      )

      if (!overlaps) {
        ranges.push({
          start: index,
          end,
          phraseInfo,
          phraseIndex: originalIndex
        })
      }

      searchStart = index + 1
    }
  }

  // Sort ranges by start position
  ranges.sort((a, b) => a.start - b.start)

  // If no matches found, return original text
  if (ranges.length === 0) {
    return <span className={className}>{text}</span>
  }

  // Build the highlighted text with proper React elements
  const elements: JSX.Element[] = []
  let lastIndex = 0

  ranges.forEach((range, idx) => {
    // Add text before this highlight
    if (range.start > lastIndex) {
      elements.push(
        <Fragment key={`text-${idx}`}>
          {text.substring(lastIndex, range.start)}
        </Fragment>
      )
    }

    // Add highlighted text with tooltip
    const highlightedText = text.substring(range.start, range.end)
    const tooltipContent = `${range.phraseInfo.guardrailName}\n${range.phraseInfo.violatedBehaviors.join(', ')}`

    // Check if this phrase is being hovered in the sidebar
    const isHovered = hoveredPhraseIndex === range.phraseIndex

    // Check if this phrase is associated with the hovered behavior (single behavior hover)
    // Must match BOTH the behavior AND the guardrail name to ensure we only highlight phrases from the same guardrail
    const isBehaviorHovered = hoveredBehavior !== null &&
      range.phraseInfo.guardrailName === hoveredBehavior.guardrailName &&
      range.phraseInfo.violatedBehaviors.includes(hoveredBehavior.behavior)

    // Check if this phrase is associated with any selected behaviors (from phrase click)
    const hasSelectedBehavior = selectedBehaviors !== null && selectedBehaviors.size > 0 &&
      range.phraseInfo.violatedBehaviors.some(behavior => selectedBehaviors.has(behavior))

    // Dynamic color classes based on highlightColor prop
    // Base classes: show border only if showHighlightByDefault is true
    const baseClasses = showHighlightByDefault
      ? (highlightColor === 'green' ? 'border-b-2 border-green-400' :
         highlightColor === 'red' ? 'border-b-2 border-red-400' :
         'border-b-2 border-amber-400')
      : ''

    // Background: show when hovered (emphasis effect), behavior is hovered, or phrase has selected behaviors
    const backgroundClass = (isHovered || isBehaviorHovered || hasSelectedBehavior)
      ? (highlightColor === 'green' ? 'bg-green-100' :
         highlightColor === 'red' ? 'bg-red-100' :
         'bg-amber-100')
      : ''

    elements.push(
      <span
        key={`highlight-${idx}`}
        className={`${baseClasses} ${backgroundClass}  px-0.5 cursor-pointer transition-all duration-200`}
        title={tooltipContent}
        onMouseEnter={() => onPhraseHover?.(range.phraseIndex)}
        onMouseLeave={() => onPhraseHover?.(null)}
        onClick={() => onPhraseClick?.(range.phraseIndex)}
      >
        {highlightedText}
      </span>
    )

    lastIndex = range.end
  })

  // Add remaining text after last highlight
  if (lastIndex < text.length) {
    elements.push(
      <Fragment key="text-end">
        {text.substring(lastIndex)}
      </Fragment>
    )
  }

  return <span className={className}>{elements}</span>
}

/**
 * HighlightedText Component
 *
 * A simple wrapper around PhraseHighlighter for standalone text highlighting
 */
interface HighlightedTextProps {
  children: string
  highlightPhrases?: HighlightPhrase[]
  className?: string
  highlightColor?: HighlightColor
  hoveredPhraseIndex?: number | null
  hoveredBehavior?: HoveredBehaviorContext | null
  selectedBehaviors?: Set<string> | null
  onPhraseHover?: (index: number | null) => void
  onPhraseClick?: (index: number) => void
  showHighlightByDefault?: boolean
}

export function HighlightedText({
  children,
  highlightPhrases,
  className,
  highlightColor,
  hoveredPhraseIndex,
  hoveredBehavior,
  selectedBehaviors,
  onPhraseHover,
  onPhraseClick,
  showHighlightByDefault
}: HighlightedTextProps) {
  return (
    <PhraseHighlighter
      text={children}
      highlightPhrases={highlightPhrases}
      className={className}
      highlightColor={highlightColor}
      hoveredPhraseIndex={hoveredPhraseIndex}
      hoveredBehavior={hoveredBehavior}
      selectedBehaviors={selectedBehaviors}
      onPhraseHover={onPhraseHover}
      onPhraseClick={onPhraseClick}
      showHighlightByDefault={showHighlightByDefault}
    />
  )
}
