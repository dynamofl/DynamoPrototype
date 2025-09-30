import { PageHeader } from '@/components/patterns'
import { Plus } from 'lucide-react'

export interface GuardrailsHeaderProps {
  onAddGuardrail: () => void
}

export function GuardrailsHeader({ onAddGuardrail }: GuardrailsHeaderProps) {
  return (
    <PageHeader
      title="Policies"
      actions={[
        {
          icon: Plus,
          label: "Create New Policy",
          onClick: onAddGuardrail
        }
      ]}
    />
  )
}