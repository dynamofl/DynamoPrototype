// Human Judgement Input Component
// Allows users to provide their own judgement for evaluation results

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HumanJudgementInputProps {
  question: string
  value: string | null
  onValueChange: (value: string | null) => void
  yesLabel?: string
  noLabel?: string
  yesValue?: string
  noValue?: string
  disabled?: boolean
}

export function HumanJudgementInput({
  question,
  value,
  onValueChange,
  yesLabel = 'Yes',
  noLabel = 'No',
  yesValue = 'Answered',
  noValue = 'Refused',
  disabled = false
}: HumanJudgementInputProps) {
  const isYesSelected = value === yesValue
  const isNoSelected = value === noValue

  return (
    <div className="flex flex-col pl-9 pt-1 pb-2 gap-1 w-full">
      <p className="text-[0.8125rem] leading-5 text-gray-700 font-400">
        {question}
      </p>
      <div className="flex gap-1 items-center">
        {/* Yes Button */}
        <button
          onClick={() => onValueChange(isYesSelected ? null : yesValue)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.8125rem] font-450 transition-all',
            'border focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1',
            isYesSelected
              ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
              : 'bg-gray-0 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Check className="w-3.5 h-3.5" />
          {yesLabel}
        </button>

        {/* No Button */}
        <button
          onClick={() => onValueChange(isNoSelected ? null : noValue)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.8125rem] font-450 transition-all',
            'border focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1',
            isNoSelected
              ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
              : 'bg-gray-0 text-gray-700 border-gray-300 hover:bg-gray-100 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <X className="w-3.5 h-3.5" />
          {noLabel}
        </button>

        {/* Clear Selection */}
        {value && (
          <button
            onClick={() => onValueChange(null)}
            disabled={disabled}
            className={cn(
              'ml-auto text-[0.75rem] text-gray-500 hover:text-gray-700 underline font-400',
              'focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1 rounded px-1',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            Clear Selection
          </button>
        )}
      </div>
    </div>
  )
}
