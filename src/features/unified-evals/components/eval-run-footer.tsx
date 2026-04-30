import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EvalRunFooterProps {
  onBack: () => void
  onContinue: () => void
  continueDisabled?: boolean
  continueLabel?: string
  continueIcon?: ReactNode
  currentStep: number
  totalSteps: number
}

export function EvalRunFooter({
  onBack,
  onContinue,
  continueDisabled = false,
  continueLabel = 'Continue',
  continueIcon,
  currentStep,
  totalSteps,
}: EvalRunFooterProps) {
  return (
    <div className="border-t border-gray-200">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between px-3 py-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 rounded-full transition-all',
                index === currentStep ? 'w-5 bg-gray-900' : 'w-1.5 bg-gray-900/30'
              )}
            />
          ))}
        </div>

        <Button
          onClick={onContinue}
          disabled={continueDisabled}
          className="gap-1"
        >
          {continueIcon}
          {continueLabel}
        </Button>
      </div>
    </div>
  )
}
