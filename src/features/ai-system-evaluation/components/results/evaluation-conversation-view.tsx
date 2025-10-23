import type { JailbreakEvaluationResult, GuardrailEvaluationDetail, ConversationTurn } from '../../types/jailbreak-evaluation'
import { JudgementsSidebar } from './judgements-sidebar'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/patterns/ui-patterns/markdown-renderer'
import { HighlightedText, type HighlightPhrase, type HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { useState, useMemo } from 'react'

interface EvaluationConversationViewProps {
  record: JailbreakEvaluationResult
  aiSystemName?: string
}

// Helper functions to handle adversarial prompt format
function isMultiTurnPrompt(prompt: any): prompt is ConversationTurn[] {
  return Array.isArray(prompt)
}

function isSingleTurnPrompt(prompt: any): prompt is { text: string } {
  return prompt && typeof prompt === 'object' && 'text' in prompt && !Array.isArray(prompt)
}

function getAdversarialPromptText(prompt: any): string {
  if (isSingleTurnPrompt(prompt)) {
    return prompt.text
  }
  if (isMultiTurnPrompt(prompt)) {
    // For multi-turn, we'll display the conversation in a different format
    return prompt.map((turn, idx) => `[${turn.role}]: ${turn.content}`).join('\n\n')
  }
  // Fallback for legacy string format (shouldn't happen with new data)
  return typeof prompt === 'string' ? prompt : ''
}

export function EvaluationConversationView({ record, aiSystemName }: EvaluationConversationViewProps) {
  const isAttackSuccess = record.attackOutcome === 'Attack Success'
  const isMultiTurn = isMultiTurnPrompt(record.adversarialPrompt)
  const adversarialPromptText = getAdversarialPromptText(record.adversarialPrompt)

  // Track which guardrail details are expanded (now supports multiple)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  // Track which behavior is being hovered in the sidebar (for single behavior hover)
  // Now includes guardrail context to distinguish between same behaviors in different guardrails
  const [hoveredBehavior, setHoveredBehavior] = useState<{ behavior: string; guardrailName: string } | null>(null)

  // Track which behaviors are selected from phrase click (for multi-behavior highlighting)
  const [selectedBehaviors, setSelectedBehaviors] = useState<Set<string> | null>(null)

  // Build map of all phrases to their guardrail keys (for click handling)
  // A single phrase can map to multiple guardrails
  const phraseToKeysMap = useMemo(() => {
    const map = new Map<string, string[]>()

    // Add input guardrail phrases
    record.inputGuardrailDetails?.forEach(detail => {
      const key = `input-${detail.guardrailId}`
      detail.violations?.forEach(v => {
        const phraseKey = v.phrase.toLowerCase()
        const existing = map.get(phraseKey) || []
        existing.push(key)
        map.set(phraseKey, existing)
      })
    })

    // Add output guardrail phrases
    record.outputGuardrailDetails?.forEach(detail => {
      const key = `output-${detail.guardrailId}`
      detail.violations?.forEach(v => {
        const phraseKey = v.phrase.toLowerCase()
        const existing = map.get(phraseKey) || []
        existing.push(key)
        map.set(phraseKey, existing)
      })
    })

    // Add judge model answer phrases
    record.judgeModelAnswerPhrases?.forEach(ap => {
      const phraseKey = ap.phrase.toLowerCase()
      const existing = map.get(phraseKey) || []
      existing.push('judge-model')
      map.set(phraseKey, existing)
    })

    return map
  }, [record.inputGuardrailDetails, record.outputGuardrailDetails, record.judgeModelAnswerPhrases])

  // Get all phrases for the current context (input or output)
  const getAllPhrasesForContext = (type: 'input' | 'output' | 'judge-model'): HighlightPhrase[] => {
    if (type === 'judge-model') {
      return record.judgeModelAnswerPhrases?.map(ap => ({
        phrase: ap.phrase,
        guardrailName: 'Answer Phrase',
        violatedBehaviors: [ap.reasoning]
      })) || []
    }

    const details = type === 'input' ? record.inputGuardrailDetails : record.outputGuardrailDetails
    return details?.flatMap(detail =>
      detail.violations?.map(v => ({
        phrase: v.phrase,
        guardrailName: detail.guardrailName,
        violatedBehaviors: v.violatedBehaviors
      })) || []
    ) || []
  }

  // Determine which violations to highlight based on expanded guardrails
  const highlightPhrases = useMemo((): HighlightPhrase[] => {
    if (expandedKeys.size === 0) return []

    const allPhrases: HighlightPhrase[] = []

    // Process each expanded key
    expandedKeys.forEach(expandedKey => {
      // Special case: judge model answer phrases
      if (expandedKey === 'judge-model') {
        if (record.judgeModelAnswerPhrases) {
          const phrases = record.judgeModelAnswerPhrases.map(ap => ({
            phrase: ap.phrase,
            guardrailName: 'Answer Phrase',
            violatedBehaviors: [ap.reasoning]
          }))
          allPhrases.push(...phrases)
        }
        return
      }

      // Parse the expanded key to determine which guardrail detail
      // Format is: type-guardrailId (e.g., "input-42f44c4e-b0aa-4ae7-b5b8-5c5c99c771cd")
      const [type, ...guardrailIdParts] = expandedKey.split('-')
      const guardrailId = guardrailIdParts.join('-') // Rejoin in case UUID contains dashes

      let detail: GuardrailEvaluationDetail | undefined

      if (type === 'input' && record.inputGuardrailDetails) {
        detail = record.inputGuardrailDetails.find(d => d.guardrailId === guardrailId)
      } else if (type === 'output' && record.outputGuardrailDetails) {
        detail = record.outputGuardrailDetails.find(d => d.guardrailId === guardrailId)
      }

      if (detail && detail.violations) {
        // Convert violations to HighlightPhrase format
        const phrases = detail.violations.map(v => ({
          phrase: v.phrase,
          guardrailName: detail!.guardrailName,
          violatedBehaviors: v.violatedBehaviors
        }))
        allPhrases.push(...phrases)
      }
    })

    return allPhrases
  }, [expandedKeys, record.inputGuardrailDetails, record.outputGuardrailDetails, record.judgeModelAnswerPhrases])

  // Determine which text to highlight based on guardrail types
  const shouldHighlightPrompt = Array.from(expandedKeys).some(key => key.startsWith('input-'))
  const shouldHighlightResponse = Array.from(expandedKeys).some(key => key.startsWith('output-') || key === 'judge-model')
  const highlightColor = 'red' as const

  // Get all clickable phrases for input and output
  const allInputPhrases = getAllPhrasesForContext('input')
  const allOutputPhrases = [...getAllPhrasesForContext('output'), ...getAllPhrasesForContext('judge-model')]

  // Handle phrase click - expand all corresponding guardrails and highlight all associated behaviors
  const handlePhraseClick = (phraseIndex: number, type: 'input' | 'output') => {
    const phrases = type === 'input' ? allInputPhrases : allOutputPhrases
    const phrase = phrases[phraseIndex]
    if (!phrase) return

    const phraseKey = phrase.phrase.toLowerCase()
    const guardrailKeys = phraseToKeysMap.get(phraseKey)
    if (guardrailKeys && guardrailKeys.length > 0) {
      // Expand all guardrail keys for this phrase
      setExpandedKeys(new Set(guardrailKeys))

      // Collect all behaviors associated with this phrase from all guardrails
      const behaviorsToHighlight = new Set<string>()

      // Add behaviors from the clicked phrase
      phrase.violatedBehaviors.forEach(behavior => {
        behaviorsToHighlight.add(behavior)
      })

      // Find all other phrases with the same text and collect their behaviors too
      const allPhrases = [...allInputPhrases, ...allOutputPhrases]
      allPhrases.forEach(p => {
        if (p.phrase.toLowerCase() === phraseKey) {
          p.violatedBehaviors.forEach(behavior => {
            behaviorsToHighlight.add(behavior)
          })
        }
      })

      // Set the selected behaviors
      setSelectedBehaviors(behaviorsToHighlight)
    }
  }

  return (
    <div className="h-full grid grid-cols-[1fr_450px]" onWheel={(e) => e.stopPropagation()}>
      {/* Main Content - Left Side */}
      <div className="h-full overflow-y-auto border-l border-r border-gray-200 py-6 px-12" onWheel={(e) => e.stopPropagation()}>
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Prompt Title & Attack Outcome Header */}
          <section className="space-y-2 pb-2">
            {record.promptTitle && (
              <h2 className="text-lg font-450 leading-6 text-gray-900">
                {record.promptTitle}
              </h2>
            )}
            <div className="flex items-center gap-2">

              <Badge
                variant="secondary"
                className={` ${
                  isAttackSuccess
                    ? 'bg-red-50 text-red-700 '
                    : 'bg-green-50 text-green-700 '
                }`}
              >
                {record.attackOutcome}
              </Badge>
            </div>
          </section>

          {/* Base Prompt */}
          <section className="space-y-2">
            <h3 className="text-[0.8125rem] font-450 leading-4 text-gray-600">
              Base Prompt
            </h3>
            <div className="text-sm font-425 leading-5 text-gray-900">
              {record.basePrompt}
            </div>
          </section>

          {/* Jailbreak Prompt */}
          <section className="space-y-2">
            <h3 className="text-[0.8125rem] font-450 leading-4 text-gray-600">
              Jailbreak Prompt {isMultiTurn && <span className="text-gray-500">(Multi-turn)</span>}
            </h3>
            {isMultiTurn ? (
              <div className="border border-gray-200 rounded-lg p-2 space-y-4">
                {(record.adversarialPrompt as ConversationTurn[]).map((turn, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-[0.8125rem] font-425 leading-4 text-gray-600 capitalize">
                      {turn.role}
                    </p>
                    <div className="text-sm leading-5 text-gray-900 whitespace-pre-wrap">
                      {turn.role === 'user' ? (
                        <HighlightedText
                          highlightPhrases={shouldHighlightPrompt ? highlightPhrases : allInputPhrases}
                          className="text-sm leading-5 text-gray-900"
                          highlightColor={highlightColor}
                          hoveredBehavior={hoveredBehavior}
                          selectedBehaviors={selectedBehaviors}
                          onPhraseClick={(idx) => handlePhraseClick(idx, 'input')}
                          showHighlightByDefault={true}
                        >
                          {turn.content}
                        </HighlightedText>
                      ) : (
                        turn.content
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-2 space-y-6">
                <div className="space-y-2">
                  <p className="text-[0.8125rem] font-425 leading-4 text-gray-600">User</p>
                  <div className="text-sm leading-5 text-gray-900">
                    <HighlightedText
                      highlightPhrases={shouldHighlightPrompt ? highlightPhrases : allInputPhrases}
                      className="text-sm leading-5 text-gray-900"
                      highlightColor={highlightColor}
                      hoveredBehavior={hoveredBehavior}
                      selectedBehaviors={selectedBehaviors}
                      onPhraseClick={(idx) => handlePhraseClick(idx, 'input')}
                      showHighlightByDefault={true}
                    >
                      {adversarialPromptText}
                    </HighlightedText>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* AI System Response */}
          <section className="space-y-2">
            <h3 className="text-[0.8125rem] font-450 leading-4 text-gray-600">
              AI System Response
            </h3>
            <div>
              <HighlightedMarkdownRenderer
                content={record.systemResponse}
                highlightPhrases={shouldHighlightResponse ? highlightPhrases : allOutputPhrases}
                highlightColor={highlightColor}
                hoveredBehavior={hoveredBehavior}
                selectedBehaviors={selectedBehaviors}
                onPhraseClick={(idx) => handlePhraseClick(idx, 'output')}
                showHighlightByDefault={true}
              />
            </div>
          </section>

        </div>
      </div>

      {/* Judgements Sidebar - Right Side */}
      <JudgementsSidebar
        record={record}
        aiSystemName={aiSystemName}
        expandedKeys={expandedKeys}
        onExpandedKeysChange={setExpandedKeys}
        hoveredBehavior={hoveredBehavior}
        onBehaviorHover={setHoveredBehavior}
        selectedBehaviors={selectedBehaviors}
      />
    </div>
  )
}

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

function HighlightedMarkdownRenderer({ content, highlightPhrases, highlightColor, hoveredBehavior, selectedBehaviors, onPhraseClick, showHighlightByDefault }: HighlightedMarkdownRendererProps) {
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
