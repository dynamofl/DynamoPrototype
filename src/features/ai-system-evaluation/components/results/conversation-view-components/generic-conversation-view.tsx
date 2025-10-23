// Generic Conversation View Component
// Uses strategy pattern to render different test types (jailbreak, compliance, etc.)

import { useState, useMemo } from 'react'
import type { BaseEvaluationResult } from '../../../types/base-evaluation'
import type { EvaluationStrategy } from '../../../strategies/base-strategy'
import type { HighlightPhrase, HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { GenericJudgementsSidebar } from './generic-judgements-sidebar'

interface GenericConversationViewProps {
  record: BaseEvaluationResult
  strategy: EvaluationStrategy
  aiSystemName?: string
}

export function GenericConversationView({
  record,
  strategy,
  aiSystemName
}: GenericConversationViewProps) {
  // Get conversation sections from strategy
  const sections = strategy.getConversationSections()
  const title = strategy.getConversationTitle(record)
  const badge = strategy.getConversationBadge(record)

  // Phrase highlighting state
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [hoveredBehavior, setHoveredBehavior] = useState<HoveredBehaviorContext | null>(null)
  const [selectedBehaviors, setSelectedBehaviors] = useState<Set<string> | null>(null)

  // Build map of all phrases to their guardrail keys (for click handling)
  const phraseToKeysMap = useMemo(() => {
    const map = new Map<string, string[]>()
    const jbRecord = record as any

    // Add input guardrail phrases
    jbRecord.inputGuardrailDetails?.forEach((detail: any) => {
      const key = `input-${detail.guardrailId}`
      detail.violations?.forEach((v: any) => {
        const phraseKey = v.phrase.toLowerCase()
        const existing = map.get(phraseKey) || []
        existing.push(key)
        map.set(phraseKey, existing)
      })
    })

    // Add output guardrail phrases
    jbRecord.outputGuardrailDetails?.forEach((detail: any) => {
      const key = `output-${detail.guardrailId}`
      detail.violations?.forEach((v: any) => {
        const phraseKey = v.phrase.toLowerCase()
        const existing = map.get(phraseKey) || []
        existing.push(key)
        map.set(phraseKey, existing)
      })
    })

    // Add judge model answer phrases
    jbRecord.judgeModelAnswerPhrases?.forEach((ap: any) => {
      const phraseKey = ap.phrase.toLowerCase()
      const existing = map.get(phraseKey) || []
      existing.push('judge-model')
      map.set(phraseKey, existing)
    })

    return map
  }, [record])

  // Get all phrases for the current context (input or output)
  const getAllPhrasesForContext = (type: 'input' | 'output' | 'judge-model'): HighlightPhrase[] => {
    const jbRecord = record as any

    if (type === 'judge-model') {
      return jbRecord.judgeModelAnswerPhrases?.map((ap: any) => ({
        phrase: ap.phrase,
        guardrailName: 'Answer Phrase',
        violatedBehaviors: [ap.reasoning]
      })) || []
    }

    const details = type === 'input' ? jbRecord.inputGuardrailDetails : jbRecord.outputGuardrailDetails
    return details?.flatMap((detail: any) =>
      detail.violations?.map((v: any) => ({
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
    const jbRecord = record as any

    expandedKeys.forEach(expandedKey => {
      // Special case: judge model answer phrases
      if (expandedKey === 'judge-model') {
        if (jbRecord.judgeModelAnswerPhrases) {
          const phrases = jbRecord.judgeModelAnswerPhrases.map((ap: any) => ({
            phrase: ap.phrase,
            guardrailName: 'Answer Phrase',
            violatedBehaviors: [ap.reasoning]
          }))
          allPhrases.push(...phrases)
        }
        return
      }

      // Parse the expanded key to determine which guardrail detail
      const [type, ...guardrailIdParts] = expandedKey.split('-')
      const guardrailId = guardrailIdParts.join('-')

      let detail: any

      if (type === 'input' && jbRecord.inputGuardrailDetails) {
        detail = jbRecord.inputGuardrailDetails.find((d: any) => d.guardrailId === guardrailId)
      } else if (type === 'output' && jbRecord.outputGuardrailDetails) {
        detail = jbRecord.outputGuardrailDetails.find((d: any) => d.guardrailId === guardrailId)
      }

      if (detail && detail.violations) {
        const phrases = detail.violations.map((v: any) => ({
          phrase: v.phrase,
          guardrailName: detail.guardrailName,
          violatedBehaviors: v.violatedBehaviors
        }))
        allPhrases.push(...phrases)
      }
    })

    return allPhrases
  }, [expandedKeys, record])

  // Determine which text to highlight based on guardrail types
  const shouldHighlightPrompt = Array.from(expandedKeys).some(key => key.startsWith('input-'))
  const shouldHighlightResponse = Array.from(expandedKeys).some(key => key.startsWith('output-') || key === 'judge-model')
  const highlightColor = 'red' as const

  // Get all clickable phrases for input and output
  const allInputPhrases = getAllPhrasesForContext('input')
  const allOutputPhrases = [...getAllPhrasesForContext('output'), ...getAllPhrasesForContext('judge-model')]

  // Handle phrase click
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

  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  // Filter sections based on condition
  const visibleSections = sortedSections.filter(section =>
    !section.condition || section.condition(record)
  )

  // Create context object to pass to strategy sections
  const highlightingContext = {
    shouldHighlightPrompt,
    shouldHighlightResponse,
    highlightPhrases,
    allInputPhrases,
    allOutputPhrases,
    highlightColor,
    hoveredBehavior,
    selectedBehaviors,
    handlePhraseClick
  }

  return (
    <div className="h-full grid grid-cols-[1fr_450px]" onWheel={(e) => e.stopPropagation()}>
      {/* Main Content - Left Side */}
      <div className="h-full overflow-y-auto border-l border-r border-gray-200 py-6 px-12" onWheel={(e) => e.stopPropagation()}>
        <div className="max-w-2xl mx-auto space-y-8">

          {/* Header with Title and Badge */}
          {(title || badge) && (
            <section className="px-2 space-y-2 pb-2">
              {title && (
                <h2 className="text-lg font-450 leading-6 text-gray-900">
                  {title}
                </h2>
              )}
              {badge && (
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-450 ${
                      badge.variant === 'destructive'
                        ? 'bg-red-50 text-red-700'
                        : badge.variant === 'default'
                        ? 'bg-green-50 text-green-700'
                        : badge.variant === 'outline'
                        ? 'bg-gray-50 text-gray-700 border border-gray-200'
                        : 'bg-gray-100 text-gray-700'
                    } ${badge.color || ''}`}
                  >
                    {badge.text}
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Dynamic Sections from Strategy */}
          {visibleSections.map((section) => (
            <section key={section.key} className="space-y-3">
              {section.render(record, highlightingContext)}
            </section>
          ))}
        </div>
      </div>

      {/* Judgements Sidebar - Right Side */}
      <GenericJudgementsSidebar
        record={record}
        strategy={strategy}
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
