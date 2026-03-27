import { Input } from '@/components/ui/input'
import { ArrowRight } from 'lucide-react'
import { StepLayout, PrimaryAction } from './step-layout'

export function StepCreate({ name, onNameChange, onContinue }: {
  name: string
  onNameChange: (value: string) => void
  onContinue: () => void
}) {
  return (
    <StepLayout
      title="Create your First Project"
      subtitle="Short description about why project is needed"
      actions={
        <div className="flex justify-end">
          <PrimaryAction onClick={onContinue} disabled={!name.trim()}>
            Continue <ArrowRight className="h-3.5 w-3.5" />
          </PrimaryAction>
        </div>
      }
    >
      <Input
        placeholder="Ex: Project Mars"
        value={name}
        onChange={e => onNameChange(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onContinue() }}
        autoFocus
        className="text-[0.8125rem] h-10"
      />
    </StepLayout>
  )
}
