import { Fragment } from 'react'

export interface HighlightPhrase {
  phrase: string
  guardrailName: string
  violatedBehaviors: string[]
}

interface PhraseHighlighterProps {
  text: string
  highlightPhrases?: HighlightPhrase[]
  className?: string
}

/**
 * PhraseHighlighter Component
 *
 * Highlights specific phrases in text with amber background and shows tooltips
 * with guardrail information on hover.
 *
 * Features:
 * - Case-insensitive phrase matching
 * - Handles overlapping phrases (longer phrases take precedence)
 * - Shows guardrail name and violated behaviors in tooltip
 * - Uses amber color scheme for violations
 */
export function PhraseHighlighter({
  text,
  highlightPhrases = [],
  className = ''
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
  }

  const ranges: HighlightRange[] = []
  const textLower = text.toLowerCase()

  // Find all occurrences of each phrase
  for (const phraseInfo of sortedPhrases) {
    const phraseLower = phraseInfo.phrase.toLowerCase()
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
          phraseInfo
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

    elements.push(
      <span
        key={`highlight-${idx}`}
        className="bg-amber-100 border-b-2 border-amber-400 rounded-sm px-0.5 cursor-help transition-colors hover:bg-amber-200"
        title={tooltipContent}
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
}

export function HighlightedText({
  children,
  highlightPhrases,
  className
}: HighlightedTextProps) {
  return (
    <PhraseHighlighter
      text={children}
      highlightPhrases={highlightPhrases}
      className={className}
    />
  )
}
