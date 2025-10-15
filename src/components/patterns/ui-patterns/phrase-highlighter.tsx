import { Fragment } from 'react'

export interface HighlightPhrase {
  phrase: string
  guardrailName: string
  violatedBehaviors: string[]
}

export type HighlightColor = 'amber' | 'green'

interface PhraseHighlighterProps {
  text: string
  highlightPhrases?: HighlightPhrase[]
  className?: string
  highlightColor?: HighlightColor  // Defaults to 'amber' for violations
  hoveredPhraseIndex?: number | null  // Index of the phrase being hovered in sidebar
  onPhraseHover?: (index: number | null) => void  // Callback when phrase is hovered
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
 */
export function PhraseHighlighter({
  text,
  highlightPhrases = [],
  className = '',
  highlightColor = 'amber',
  hoveredPhraseIndex = null,
  onPhraseHover
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

    // Dynamic color classes based on highlightColor prop
    // Base classes: always show border (underline effect)
    const baseClasses = highlightColor === 'green'
      ? 'border-b-2 border-green-400'
      : 'border-b-2 border-amber-400'

    // Background: only show when hovered (emphasis effect)
    const backgroundClass = isHovered
      ? (highlightColor === 'green' ? 'bg-green-100' : 'bg-amber-100')
      : ''

    elements.push(
      <span
        key={`highlight-${idx}`}
        className={`${baseClasses} ${backgroundClass} rounded-sm px-0.5 cursor-help transition-all duration-200`}
        title={tooltipContent}
        onMouseEnter={() => onPhraseHover?.(range.phraseIndex)}
        onMouseLeave={() => onPhraseHover?.(null)}
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
  onPhraseHover?: (index: number | null) => void
}

export function HighlightedText({
  children,
  highlightPhrases,
  className,
  highlightColor,
  hoveredPhraseIndex,
  onPhraseHover
}: HighlightedTextProps) {
  return (
    <PhraseHighlighter
      text={children}
      highlightPhrases={highlightPhrases}
      className={className}
      highlightColor={highlightColor}
      hoveredPhraseIndex={hoveredPhraseIndex}
      onPhraseHover={onPhraseHover}
    />
  )
}
