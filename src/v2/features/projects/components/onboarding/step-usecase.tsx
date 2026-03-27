import { Input } from '@/components/ui/input'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UseCase } from '../../types/project'
import { USE_CASES } from './onboarding-constants'
import { StepLayout, StepNav } from './step-layout'

export function StepUseCase({
  selectedId,
  selectedUseCase,
  customName,
  customDescription,
  onSelect,
  onCustomNameChange,
  onCustomDescriptionChange,
  onBack,
  onSkip,
  onContinue,
}: {
  selectedId: string | null
  selectedUseCase: UseCase | null
  customName: string
  customDescription: string
  onSelect: (id: string) => void
  onCustomNameChange: (value: string) => void
  onCustomDescriptionChange: (value: string) => void
  onBack: () => void
  onSkip: () => void
  onContinue: () => void
}) {
  const isOtherSelected = selectedId === 'other'
  const canContinue = isOtherSelected ? !!customName.trim() : !!selectedUseCase

  return (
    <StepLayout
      title="Select Your Usecase"
      subtitle="Short description about why usecase is needed"
      actions={
        <StepNav
          onBack={onBack}
          onSkip={onSkip}
          skipLabel="Skip"
          primaryDisabled={!canContinue}
          onPrimary={onContinue}
          primaryLabel={<>Continue <ArrowRight className="h-3.5 w-3.5" /></>}
        />
      }
    >
      <div className="space-y-2">
        {/* 2-col grid for built-in use cases */}
        <div className="grid grid-cols-2 gap-2">
          {USE_CASES.filter(uc => uc.id !== 'other').map(uc => {
            const isSelected = selectedId === uc.id
            return (
              <button
                key={uc.id}
                onClick={() => onSelect(uc.id)}
                className={cn(
                  'px-4 py-3 rounded-xl border transition-colors text-center text-[0.8125rem] font-[450]',
                  isSelected ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 bg-gray-0 hover:border-gray-300 text-gray-600'
                )}
              >
                {uc.name}
              </button>
            )
          })}
        </div>

        {/* Others — animates height into inline form when selected */}
        <div
          className="rounded-xl overflow-hidden border border-gray-200 bg-gray-0 transition-all duration-300 ease-out "
          style={{
            maxHeight: isOtherSelected ? '220px' : '44px',
            opacity: 1,
          }}
        >
          {!isOtherSelected ? (
            <button
              onClick={() => onSelect('other')}
              className="w-full px-4 py-3 text-[0.8125rem] font-[450] text-gray-600 text-center hover:text-gray-800 transition-colors"
            >
              Others
            </button>
          ) : (
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-[0.8125rem] font-[500] text-gray-700">Usecase Name</label>
                <Input
                  placeholder="Enter usecase name here"
                  value={customName}
                  onChange={e => onCustomNameChange(e.target.value)}
                  autoFocus
                  className="text-[0.8125rem]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.8125rem] font-[500] text-gray-700">Description</label>
                <textarea
                  placeholder="Enter usecase description here..."
                  value={customDescription}
                  onChange={e => onCustomDescriptionChange(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-[0.8125rem] shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground outline-none focus-visible:border-gray-300 focus-visible:ring-gray-200 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 min-h-[4.5rem] resize-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </StepLayout>
  )
}
