import type { JailbreakEvaluationResult, GuardrailEvaluationDetail } from '../../types/jailbreak-evaluation'
import { JudgementsSidebar } from './judgements-sidebar'
import { Badge } from '@/components/ui/badge'
import { MarkdownRenderer } from '@/components/patterns/ui-patterns/markdown-renderer'
import { HighlightedText, type HighlightPhrase } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { useState, useMemo } from 'react'

interface EvaluationConversationViewProps {
  record: JailbreakEvaluationResult
}

export function EvaluationConversationView({ record }: EvaluationConversationViewProps) {
  const isAttackSuccess = record.attackOutcome === 'Attack Success'

  // Track which guardrail detail is expanded
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  // Determine which violations to highlight based on expanded guardrail
  const highlightPhrases = useMemo((): HighlightPhrase[] => {
    console.log('🔍 Debug - All Input Guardrail Details:', record.inputGuardrailDetails)
    console.log('🔍 Debug - All Output Guardrail Details:', record.outputGuardrailDetails)

    if (!expandedKey) return []

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
  }, [expandedKey, record.inputGuardrailDetails, record.outputGuardrailDetails])

  // Determine which text to highlight based on guardrail type
  const shouldHighlightPrompt = expandedKey?.startsWith('input-')
  const shouldHighlightResponse = expandedKey?.startsWith('output-')

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
              Jailbreak Prompt
            </h3>
            <div className="border border-gray-200 rounded p-2 space-y-6">
              <div className="space-y-2">
                <p className="text-[0.8125rem] font-425 leading-4 text-gray-600">User</p>
                <p className="text-sm leading-5 text-gray-900">
                  {shouldHighlightPrompt ? (
                    <HighlightedText
                      highlightPhrases={highlightPhrases}
                      className="text-sm leading-5 text-gray-900"
                    >
                      {record.adversarialPrompt}
                    </HighlightedText>
                  ) : (
                    record.adversarialPrompt
                  )}
                </p>
              </div>
            </div>
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
      />
    </div>
  )
}

// Helper component to highlight phrases in markdown content
interface HighlightedMarkdownRendererProps {
  content: string
  highlightPhrases: HighlightPhrase[]
}

function HighlightedMarkdownRenderer({ content, highlightPhrases }: HighlightedMarkdownRendererProps) {
  // For markdown content, we'll use a custom component override for paragraph elements
  const customComponents = {
    p: ({ children, ...props }: any) => {
      // Convert children to string if possible
      const text = typeof children === 'string' ? children : String(children)

      return (
        <p className="text-sm font-425 leading-relaxed text-gray-900 mb-4 last:mb-0" {...props}>
          <HighlightedText highlightPhrases={highlightPhrases}>
            {text}
          </HighlightedText>
        </p>
      )
    },
    li: ({ children, ...props }: any) => {
      const text = typeof children === 'string' ? children : String(children)

      return (
        <li className="text-sm font-425 leading-relaxed text-gray-900 pl-1" {...props}>
          <HighlightedText highlightPhrases={highlightPhrases}>
            {text}
          </HighlightedText>
        </li>
      )
    }
  }

  return (
    <MarkdownRenderer
      content={content}
      components={customComponents}
    />
  )
}
