// Shared Components for Conversation Views
// Reusable components used by both jailbreak and compliance conversation views

import { MarkdownRenderer } from '@/components/patterns/ui-patterns/markdown-renderer'
import { HighlightedText, type HighlightPhrase, type HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'

// Helper component to highlight phrases in markdown content
interface HighlightedMarkdownRendererProps {
  content: string
  highlightPhrases: HighlightPhrase[]
  highlightColor: 'amber' | 'green' | 'red'
  hoveredBehavior?: HoveredBehaviorContext | null
  selectedBehaviors?: Set<string> | null
  onPhraseClick?: (index: number) => void
  showHighlightByDefault?: boolean
}

export function HighlightedMarkdownRenderer({
  content,
  highlightPhrases,
  highlightColor,
  hoveredBehavior,
  selectedBehaviors,
  onPhraseClick,
  showHighlightByDefault
}: HighlightedMarkdownRendererProps) {
  // Helper function to recursively process children and apply highlighting
  const processChildren = (children: any): any => {
    if (typeof children === 'string') {
      return (
        <HighlightedText
          highlightPhrases={highlightPhrases}
          highlightColor={highlightColor}
          hoveredBehavior={hoveredBehavior}
          selectedBehaviors={selectedBehaviors}
          onPhraseClick={onPhraseClick}
          showHighlightByDefault={showHighlightByDefault}
        >
          {children}
        </HighlightedText>
      )
    }
    if (Array.isArray(children)) {
      return children.map((child, idx) => (
        <span key={idx}>{processChildren(child)}</span>
      ))
    }
    return children
  }

  // Custom components for all markdown elements to support highlighting
  const customComponents = {
    p: ({ children, ...props }: any) => (
      <p className="text-sm font-425 leading-relaxed text-gray-900 mb-4 last:mb-0" {...props}>
        {processChildren(children)}
      </p>
    ),
    li: ({ children, ...props }: any) => (
      <li className="text-sm font-425 leading-relaxed text-gray-900 pl-1" {...props}>
        {processChildren(children)}
      </li>
    ),
    h1: ({ children, ...props }: any) => (
      <h1 className="text-xl font-450 leading-6 text-gray-900 mb-3" {...props}>
        {processChildren(children)}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-lg font-450 leading-6 text-gray-900 mb-2" {...props}>
        {processChildren(children)}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-base font-450 leading-5 text-gray-900 mb-2" {...props}>
        {processChildren(children)}
      </h3>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-450" {...props}>
        {processChildren(children)}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic" {...props}>
        {processChildren(children)}
      </em>
    ),
    code: ({ children, ...props }: any) => (
      <code className="bg-gray-100 px-1 rounded text-sm" {...props}>
        {processChildren(children)}
      </code>
    )
  }

  return (
    <MarkdownRenderer
      content={content}
      components={customComponents}
    />
  )
}
