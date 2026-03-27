import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { AILoader } from '@/components/ui/ai-loader'
import { Lock, Globe, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProjectVisibility } from '../../types/project'
import { StepLayout, StepNav } from './step-layout'

export function StepPermissions({
  visibility,
  onVisibilityChange,
  isSubmitting,
  error,
  onBack,
  onSkip,
  onSubmit,
}: {
  visibility: ProjectVisibility
  onVisibilityChange: (value: ProjectVisibility) => void
  isSubmitting: boolean
  error: string | null
  onBack: () => void
  onSkip: () => void
  onSubmit: () => void
}) {
  return (
    <StepLayout
      title="Access"
      subtitle="Choose who can see this project."
      actions={
        <StepNav
          onBack={onBack}
          backDisabled={isSubmitting}
          onSkip={onSkip}
          skipLabel="Skip for Now"
          skipDisabled={isSubmitting}
          onPrimary={onSubmit}
          primaryDisabled={isSubmitting}
          primaryLabel={
            <>
              {isSubmitting && <AILoader size={14} />}
              {isSubmitting ? 'Creating...' : 'Open Project'}
              {!isSubmitting && <ArrowRight className="h-3.5 w-3.5" />}
            </>
          }
        />
      }
    >
      <RadioGroup value={visibility} onValueChange={v => onVisibilityChange(v as ProjectVisibility)}>
        <div className="space-y-2.5">
          {[
            { value: 'private' as const, icon: Lock, label: 'Private', desc: 'Only you can access. Invite people later.' },
            { value: 'public' as const, icon: Globe, label: 'Public', desc: 'Anyone on your team can view.' },
          ].map(({ value, icon: Icon, label, desc }) => (
            <div
              key={value}
              onClick={() => onVisibilityChange(value)}
              className={cn(
                'flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                visibility === value ? 'border-gray-800 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <RadioGroupItem value={value} id={`vis-${value}`} className="mt-0.5" />
              <div>
                <label htmlFor={`vis-${value}`} className="flex items-center gap-1.5 text-[0.8125rem] font-[500] text-gray-800 cursor-pointer">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />{label}
                </label>
                <p className="text-[0.75rem] text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </RadioGroup>
      {error && <p className="text-[0.8125rem] text-red-600">{error}</p>}
    </StepLayout>
  )
}
