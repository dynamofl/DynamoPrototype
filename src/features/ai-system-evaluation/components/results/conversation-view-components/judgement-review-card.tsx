// Judgement Review Card Component
// Displays AI judgement review with question, Yes/No buttons, LLM reasoning, and human judgement

import { useState, useEffect } from 'react'
import { BookOpen, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useHumanJudgement } from '../../../hooks/use-human-judgement'
import type { BaseEvaluationResult, AISystemResponse } from '../../../types/base-evaluation'
import type { HoveredBehaviorContext } from '@/components/patterns/ui-patterns/phrase-highlighter'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

interface JudgementListItem {
  id: string
  text: string
  behavior?: string
  guardrailName?: string
}

interface JudgementReviewCardProps {
  record: BaseEvaluationResult
  testType: 'jailbreak' | 'compliance' | 'hallucination'
  isAnnotationModeEnabled?: boolean
  onRecordUpdate?: (record: BaseEvaluationResult) => void
  // Phrase highlighting props
  hoveredBehavior?: HoveredBehaviorContext | null
  onBehaviorHover?: (behavior: HoveredBehaviorContext | null) => void
  onBehaviorClick?: (behavior: HoveredBehaviorContext) => void
  selectedBehaviors?: Set<string> | null
}

// Question text by test type
const QUESTION_CONFIG = {
  jailbreak: {
    title: 'Did the Model Answer the Attack Prompt?',
    subtitle: 'Check if the AI system responded to the jailbreak attempt'
  },
  compliance: {
    title: 'Did the Model Response Comply with the Policy?',
    subtitle: 'Check if the AI system followed compliance requirements'
  },
  hallucination: {
    title: 'Did the Model Hallucinate in Its Response?',
    subtitle: 'Check if the AI system provided factually accurate information'
  }
}

export function JudgementReviewCard({
  record,
  testType,
  isAnnotationModeEnabled = false,
  onRecordUpdate,
  hoveredBehavior,
  onBehaviorHover,
  onBehaviorClick,
  selectedBehaviors
}: JudgementReviewCardProps) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  // Get current user's email
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setCurrentUserEmail(session.user.email)
      }
    }
    getCurrentUser()
  }, [])

  // Get question config for test type
  const questionConfig = QUESTION_CONFIG[testType]

  // Get AI judgement
  const aiJudgement = (record as any).judgeModelJudgement ||
                      (record as any).modelJudgement ||
                      (record as any).compliance_judgement ||
                      'Answered'

  // Map to Yes/No
  const aiChoice = aiJudgement === 'Answered' ? 'Yes' : 'No'

  // Build list items for phrase highlighting
  const listItems: JudgementListItem[] = ((record as any).judgeModelAnswerPhrases || []).map(
    (answerPhrase: any, idx: number) => ({
      id: `answer-phrase-${idx}`,
      text: answerPhrase.reasoning,
      behavior: answerPhrase.reasoning,
      guardrailName: 'LLM Reasoning'
    })
  )

  // Get human judgement
  const systemResponse = (record as any).system_response as AISystemResponse | undefined
  const humanJudgement = systemResponse?.human_judgement

  // Human judgement hook
  const { updateJudgement, isLoading } = useHumanJudgement({
    promptId: (record as any).id || '',
    testType,
    judgementType: 'ai_system_response'
  })

  const handleHumanJudgementChange = async (value: string | null) => {
    try {
      const updatedRecord = await updateJudgement({ judgementValue: value })
      if (onRecordUpdate && updatedRecord) {
        onRecordUpdate(updatedRecord)
      }
    } catch (error) {
      console.error('Failed to update human judgement:', error)
    }
  }

  const isYesSelected = humanJudgement?.judgement === 'Answered'
  const isNoSelected = humanJudgement?.judgement === 'Refused'

  // Get reviewer initials from email
  // Extract initials from email (e.g., "pratheep.kumar@example.com" -> "PK")
  const getInitialsFromEmail = (email: string | null): string => {
    if (!email) return 'You'

    const namePart = email.split('@')[0] // Get part before @
    const parts = namePart.split(/[._-]/) // Split by . _ or -

    if (parts.length >= 2) {
      // If we have multiple parts, take first letter of first two parts
      return (parts[0][0] + parts[1][0]).toUpperCase()
    } else if (parts[0].length >= 2) {
      // If single part, take first 2 letters
      return parts[0].substring(0, 2).toUpperCase()
    }

    return 'You'
  }

  const reviewerInitials = getInitialsFromEmail(currentUserEmail)

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Question Section with Number */}
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-xs font-500 text-gray-700">2</span>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-450 text-gray-900">
            {questionConfig.title}
          </h3>
          <p className="text-sm font-400 text-gray-600">
            {questionConfig.subtitle}
          </p>
        </div>
      </div>

      {/* Yes/No Options */}
      <div className="flex flex-col w-full">
        {/* Yes Option */}
        <div
          onClick={() => !isLoading && isAnnotationModeEnabled && handleHumanJudgementChange(isYesSelected ? null : 'Answered')}
          className={cn(
            'flex items-center gap-3 px-3 py-3 transition-all border-b border-gray-100 cursor-pointer',
            isYesSelected && 'bg-blue-50',
            (!isAnnotationModeEnabled || isLoading) && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            isYesSelected
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-400 bg-gray-0'
          )}>
            {isYesSelected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="flex-1 text-sm font-400 text-gray-900">Yes</span>
          <div className="flex items-center gap-1.5">
            {isYesSelected && (
              <Badge variant="secondary" className="text-xs bg-blue-600 text-white hover:bg-blue-600">
                {reviewerInitials}
              </Badge>
            )}
            {aiChoice === 'Yes' && (
              <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                {isYesSelected ? 'LLM' : 'LLM-Answer'}
              </Badge>
            )}
          </div>
        </div>

        {/* No Option */}
        <div
          onClick={() => !isLoading && isAnnotationModeEnabled && handleHumanJudgementChange(isNoSelected ? null : 'Refused')}
          className={cn(
            'flex items-center gap-3 px-3 py-3 transition-all cursor-pointer',
            isNoSelected && 'bg-blue-50',
            (!isAnnotationModeEnabled || isLoading) && 'cursor-not-allowed opacity-50'
          )}
        >
          <div className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            isNoSelected
              ? 'bg-blue-600 border-blue-600'
              : 'border-gray-400 bg-gray-0'
          )}>
            {isNoSelected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="flex-1 text-sm font-400 text-gray-900">No</span>
          <div className="flex items-center gap-1.5">
            {isNoSelected && (
              <Badge variant="secondary" className="text-xs bg-blue-600 text-white hover:bg-blue-600">
                {reviewerInitials}
              </Badge>
            )}
            {aiChoice === 'No' && (
              <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                {isNoSelected ? 'LLM' : 'LLM-Answer'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Show LLM Reasoning Section */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
          className="flex items-center gap-2 text-sm font-400 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Show LLM Reasoning</span>
          <ChevronUp className={cn(
            "w-4 h-4 transition-transform",
            !isReasoningExpanded && "rotate-180"
          )} />
        </button>

        {isReasoningExpanded && listItems.length > 0 && (
          <ul className="list-disc pl-11 space-y-2">
            {listItems.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "text-sm text-gray-600 leading-relaxed cursor-pointer transition-colors",
                  hoveredBehavior?.behavior === item.behavior && "text-blue-600 font-450",
                  selectedBehaviors?.has(item.behavior || '') && "text-blue-700 font-500"
                )}
                onMouseEnter={() => onBehaviorHover?.({
                  behavior: item.behavior || '',
                  guardrailName: item.guardrailName || ''
                })}
                onMouseLeave={() => onBehaviorHover?.(null)}
                onClick={() => onBehaviorClick?.({
                  behavior: item.behavior || '',
                  guardrailName: item.guardrailName || ''
                })}
              >
                {item.text}
              </li>
            ))}
          </ul>
        )}

        {isReasoningExpanded && listItems.length === 0 && (
          <p className="text-sm text-gray-500 pl-6">No reasoning available from the LLM.</p>
        )}
      </div>
    </div>
  )
}
