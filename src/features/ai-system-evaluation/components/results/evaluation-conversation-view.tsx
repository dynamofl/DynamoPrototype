import type { JailbreakEvaluationResult, GuardrailEvaluationDetail, ConversationTurn } from '../../types/jailbreak-evaluation'
import { JudgementsSidebar } from './judgements-sidebar'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/patterns/ui-patterns/markdown-renderer'
import { HighlightedText, type HighlightPhrase } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { useState, useMemo } from 'react'

interface EvaluationConversationViewProps {
  record: JailbreakEvaluationResult
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

export function EvaluationConversationView({ record }: EvaluationConversationViewProps) {
  const isAttackSuccess = record.attackOutcome === 'Attack Success'
  const isMultiTurn = isMultiTurnPrompt(record.adversarialPrompt)
  const adversarialPromptText = getAdversarialPromptText(record.adversarialPrompt)

  // Track which guardrail detail is expanded
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  // Track which phrase is being hovered
  const [hoveredPhraseIndex, setHoveredPhraseIndex] = useState<number | null>(null)

  // Determine which violations to highlight based on expanded guardrail
  const highlightPhrases = useMemo((): HighlightPhrase[] => {
    console.log('🔍 Debug - All Input Guardrail Details:', record.inputGuardrailDetails)
    console.log('🔍 Debug - All Output Guardrail Details:', record.outputGuardrailDetails)

    if (!expandedKey) return []

    // Special case: judge model answer phrases
    if (expandedKey === 'judge-model') {
      if (!record.judgeModelAnswerPhrases) return []

      // Convert answer phrases to HighlightPhrase format
      const phrases = record.judgeModelAnswerPhrases.map(ap => ({
        phrase: ap.phrase,
        guardrailName: 'Answer Phrase',
        violatedBehaviors: [ap.reasoning]
      }))

      console.log('🔍 Debug - Judge Model Answer Phrases:', phrases)
      console.log('🔍 Debug - System Response Length:', record.systemResponse.length)
      console.log('🔍 Debug - System Response Preview:', record.systemResponse.substring(0, 200))
      return phrases
    }

    // Parse the expanded key to determine which guardrail detail
    // Format is now: type-guardrailId (e.g., "input-42f44c4e-b0aa-4ae7-b5b8-5c5c99c771cd")
    const [type, ...guardrailIdParts] = expandedKey.split('-')
    const guardrailId = guardrailIdParts.join('-') // Rejoin in case UUID contains dashes

    let detail: GuardrailEvaluationDetail | undefined

    if (type === 'input' && record.inputGuardrailDetails) {
      detail = record.inputGuardrailDetails.find(d => d.guardrailId === guardrailId)
    } else if (type === 'output' && record.outputGuardrailDetails) {
      detail = record.outputGuardrailDetails.find(d => d.guardrailId === guardrailId)
    }

    console.log('🔍 Debug - Expanded Key:', expandedKey)
    console.log('🔍 Debug - Type:', type, 'Guardrail ID:', guardrailId)
    console.log('🔍 Debug - Detail:', detail)
    console.log('🔍 Debug - Violations:', detail?.violations)

    if (!detail || !detail.violations) return []

    // Convert violations to HighlightPhrase format
    const phrases = detail.violations.map(v => ({
      phrase: v.phrase,
      guardrailName: detail!.guardrailName,
      violatedBehaviors: v.violatedBehaviors
    }))

    console.log('🔍 Debug - Highlight Phrases:', phrases)
    return phrases
  }, [expandedKey, record.inputGuardrailDetails, record.outputGuardrailDetails, record.judgeModelAnswerPhrases])

  // Determine which text to highlight based on guardrail type
  const shouldHighlightPrompt = expandedKey?.startsWith('input-')
  const shouldHighlightResponse = expandedKey?.startsWith('output-') || expandedKey === 'judge-model'
  const highlightColor = expandedKey === 'judge-model' ? 'green' : 'amber'

  return (
    <div className="h-full grid grid-cols-[1fr_450px]">
      {/* Main Content - Left Side */}
      <div className="h-full overflow-y-auto border-l border-r border-gray-200 py-6 px-12">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Prompt Title & Attack Outcome Header */}
          <section className="space-y-2 pb-4">
            {record.promptTitle && (
              <h2 className="text-lg font-550 leading-6 text-gray-900">
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
            <h3 className="text-[0.8125rem] font-550 leading-4 text-gray-600">
              Base Prompt
            </h3>
            <div className="text-sm font-425 leading-5 text-gray-900">
              {record.basePrompt}
            </div>
          </section>

          {/* Jailbreak Prompt */}
          <section className="space-y-2">
            <h3 className="text-[0.8125rem] font-550 leading-4 text-gray-600">
              Jailbreak Prompt {isMultiTurn && <span className="text-gray-500">(Multi-turn)</span>}
            </h3>
            {isMultiTurn ? (
              <div className="border border-gray-200 rounded p-2 space-y-4">
                {(record.adversarialPrompt as ConversationTurn[]).map((turn, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-[0.8125rem] font-425 leading-4 text-gray-600 capitalize">
                      {turn.role}
                    </p>
                    <div className="text-sm leading-5 text-gray-900 whitespace-pre-wrap">
                      {shouldHighlightPrompt && turn.role === 'user' ? (
                        <HighlightedText
                          highlightPhrases={highlightPhrases}
                          className="text-sm leading-5 text-gray-900"
                          highlightColor={highlightColor}
                          hoveredPhraseIndex={hoveredPhraseIndex}
                          onPhraseHover={setHoveredPhraseIndex}
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
              <div className="border border-gray-200 rounded p-2 space-y-6">
                <div className="space-y-2">
                  <p className="text-[0.8125rem] font-425 leading-4 text-gray-600">User</p>
                  <div className="text-sm leading-5 text-gray-900">
                    {shouldHighlightPrompt ? (
                      <HighlightedText
                        highlightPhrases={highlightPhrases}
                        className="text-sm leading-5 text-gray-900"
                        highlightColor={highlightColor}
                        hoveredPhraseIndex={hoveredPhraseIndex}
                        onPhraseHover={setHoveredPhraseIndex}
                      >
                        {adversarialPromptText}
                      </HighlightedText>
                    ) : (
                      adversarialPromptText
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* AI System Response */}
          <section className="space-y-2">
            <h3 className="text-[0.8125rem] font-550 leading-4 text-gray-600">
              AI System Response
            </h3>
            <div>
              {shouldHighlightResponse ? (
                <HighlightedMarkdownRenderer
                  content={record.systemResponse}
                  highlightPhrases={highlightPhrases}
                  highlightColor={highlightColor}
                  hoveredPhraseIndex={hoveredPhraseIndex}
                  onPhraseHover={setHoveredPhraseIndex}
                />
              ) : (
                <MarkdownRenderer content={record.systemResponse} />
              )}
            </div>
          </section>

        </div>
      </div>

      {/* Judgements Sidebar - Right Side */}
      <JudgementsSidebar
        record={record}
        expandedKey={expandedKey}
        onExpandedKeyChange={setExpandedKey}
        hoveredPhraseIndex={hoveredPhraseIndex}
        onPhraseHover={setHoveredPhraseIndex}
      />
    </div>
  )
}

// Helper component to highlight phrases in markdown content
interface HighlightedMarkdownRendererProps {
  content: string
  highlightPhrases: HighlightPhrase[]
  highlightColor: 'amber' | 'green'
  hoveredPhraseIndex?: number | null
  onPhraseHover?: (index: number | null) => void
}

function HighlightedMarkdownRenderer({ content, highlightPhrases, highlightColor, hoveredPhraseIndex, onPhraseHover }: HighlightedMarkdownRendererProps) {
  // Helper function to recursively process children and apply highlighting
  const processChildren = (children: any): any => {
    if (typeof children === 'string') {
      return (
        <HighlightedText
          highlightPhrases={highlightPhrases}
          highlightColor={highlightColor}
          hoveredPhraseIndex={hoveredPhraseIndex}
          onPhraseHover={onPhraseHover}
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
      <h1 className="text-xl font-550 leading-6 text-gray-900 mb-3" {...props}>
        {processChildren(children)}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-lg font-550 leading-6 text-gray-900 mb-2" {...props}>
        {processChildren(children)}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-base font-550 leading-5 text-gray-900 mb-2" {...props}>
        {processChildren(children)}
      </h3>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-550" {...props}>
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
