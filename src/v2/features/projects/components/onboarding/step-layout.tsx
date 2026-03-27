import { Button } from '@/components/ui/button'
import { ArrowLeft, SkipForward } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OnboardingStep } from './onboarding-types'
import { STEPS } from './onboarding-types'

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */
export function StepIndicator({ current }: { current: OnboardingStep }) {
  const idx = STEPS.indexOf(current)
  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-[3px] rounded-full transition-all duration-300',
            i === idx ? 'w-6 bg-gray-700' : i < idx ? 'w-2 bg-gray-400' : 'w-2 bg-gray-200'
          )}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Step layout — header + body + actions                              */
/* ------------------------------------------------------------------ */
export function StepLayout({ title, subtitle, children, actions }: {
  title: string
  subtitle: string
  children: React.ReactNode
  actions: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-[500] text-gray-900">{title}</h1>
        <p className="text-[0.8125rem] text-gray-400">{subtitle}</p>
      </div>
      {children}
      {actions}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Primary action button                                              */
/* ------------------------------------------------------------------ */
export function PrimaryAction({ onClick, disabled, children }: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <Button size="lg" onClick={onClick} disabled={disabled} className="gap-2 px-4">
      {children}
    </Button>
  )
}

/* ------------------------------------------------------------------ */
/*  Step navigation — back / skip / primary                            */
/* ------------------------------------------------------------------ */
export function StepNav({ onBack, onSkip, onPrimary, skipLabel, primaryLabel, backDisabled, skipDisabled, primaryDisabled }: {
  onBack: () => void
  onSkip?: () => void
  onPrimary: () => void
  skipLabel?: string
  primaryLabel: React.ReactNode
  backDisabled?: boolean
  skipDisabled?: boolean
  primaryDisabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="ghost" size="lg" onClick={onBack} disabled={backDisabled} className="text-gray-400 gap-1.5 px-4">
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </Button>
      <div className="flex items-center gap-2">
        {onSkip && (
          <Button variant="ghost" size="lg" onClick={onSkip} disabled={skipDisabled} className="text-gray-400 gap-1.5 px-4">
            <SkipForward className="h-3.5 w-3.5" /> {skipLabel ?? 'Skip'}
          </Button>
        )}
        <PrimaryAction onClick={onPrimary} disabled={primaryDisabled}>
          {primaryLabel}
        </PrimaryAction>
      </div>
    </div>
  )
}
