// Reusable Judgement Display Component
// Displays both AI and human judgements with consistent styling

import { MessageCircleOff, CircleCheckBig, BadgeHelp } from 'lucide-react'
import type { JudgementVariant } from '../../../types/base-evaluation'

interface JudgementDisplayProps {
  variant: JudgementVariant
  judgement: string | null | undefined
  label: string
  username?: string
  confidence?: number
  tokens?: number
  className?: string
}

export function JudgementDisplay({
  variant,
  judgement,
  label,
  username,
  confidence,
  tokens,
  className = ''
}: JudgementDisplayProps) {
  const isPending = !judgement
  const isAnswered = judgement === 'Answered' || judgement === 'Compliant'
  const isRefused = judgement === 'Refused' || judgement === 'Blocked' || judgement === 'Non-Compliant'

  // Color schemes based on variant
  const iconColors = variant === 'ai'
    ? {
        answeredBg: 'bg-green-50',
        answeredIcon: 'text-green-600',
        refusedBg: 'bg-red-50',
        refusedIcon: 'text-red-600',
        pendingBg: 'bg-gray-100',
        pendingIcon: 'text-gray-500',
      }
    : {
        answeredBg: 'bg-blue-50',
        answeredIcon: 'text-blue-600',
        refusedBg: 'bg-blue-50',
        refusedIcon: 'text-blue-600',
        pendingBg: 'bg-blue-50',
        pendingIcon: 'text-blue-600',
      }

  const getJudgementIcon = () => {
    if (isPending) {
      return (
        <div className={`p-1.5 ${iconColors.pendingBg} rounded-full`}>
          <BadgeHelp className={`w-4 h-4 ${iconColors.pendingIcon}`} />
        </div>
      )
    } else if (isAnswered) {
      return (
        <div className={`p-1.5 ${iconColors.answeredBg} rounded-full`}>
          <CircleCheckBig className={`w-4 h-4 ${iconColors.answeredIcon}`} />
        </div>
      )
    } else if (isRefused) {
      return (
        <div className={`p-1.5 ${iconColors.refusedBg} rounded-full`}>
          <MessageCircleOff className={`w-4 h-4 ${iconColors.refusedIcon}`} />
        </div>
      )
    }
    // Default icon for other judgements
    return (
      <div className={`p-1.5 ${iconColors.answeredBg} rounded-full`}>
        <CircleCheckBig className={`w-4 h-4 ${iconColors.answeredIcon}`} />
      </div>
    )
  }

  return (
    <div className={`flex gap-2 items-start py-1 ${className}`}>
      {getJudgementIcon()}
      <div className="flex-1 flex flex-col gap-1 items-start justify-center min-w-0">
        <div className="flex flex-col gap-0.5 items-start justify-center w-full">
          <div className="flex gap-0.5 items-start text-[0.875rem] leading-5 text-gray-900">
            <span className="text-[0.8125rem] font-450">{label}</span>
            
          </div>
          <div className="flex gap-1 items-center text-xs leading-4 text-gray-600">
            <span className="font-400">{judgement || '--'}</span>
            {confidence !== undefined && confidence !== null && (
              <>
                <span className="font-400">•</span>
                <span className="font-400">Confidence:</span>
                <span className="font-400">{confidence.toFixed(2)}</span>
              </>
            )}
            {tokens !== undefined && (
              <>
                {confidence !== undefined && confidence !== null && <span className="font-425">•</span>}
                <span className="font-400">Tokens:</span>
                <span className="font-400">{tokens.toLocaleString()}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
