// Hook for managing conversation highlighting state and context

import { useState, useMemo } from 'react'
import type { BaseEvaluationResult } from '../../../types/base-evaluation'
import type { HighlightPhrase, HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'
import type { HighlightingContext } from '../../../strategies/base-strategy'

export function useConversationHighlighting(record: BaseEvaluationResult | null): {
  highlightingContext: HighlightingContext
  expandedKeys: Set<string>
  setExpandedKeys: (keys: Set<string>) => void
  hoveredBehavior: HoveredBehaviorContext | null
  setHoveredBehavior: (behavior: HoveredBehaviorContext | null) => void
  selectedBehaviors: Set<string> | null
  setSelectedBehaviors: (behaviors: Set<string> | null) => void
} {
  // Phrase highlighting state
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())
  const [hoveredBehavior, setHoveredBehavior] = useState<HoveredBehaviorContext | null>(null)
  const [selectedBehaviors, setSelectedBehaviors] = useState<Set<string> | null>(null)

  // Build map of all phrases to their guardrail keys (for click handling)
  const phraseToKeysMap = useMemo(() => {
    if (!record) return new Map<string, string[]>()

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
    if (!record) return []

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
    if (!record || expandedKeys.size === 0) return []

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

  // Create context object to pass to strategy sections
  const highlightingContext: HighlightingContext = {
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

  return {
    highlightingContext,
    expandedKeys,
    setExpandedKeys,
    hoveredBehavior,
    setHoveredBehavior,
    selectedBehaviors,
    setSelectedBehaviors
  }
}
