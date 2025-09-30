import { PageHeader } from '@/components/patterns'
import { Plus } from 'lucide-react'

export interface AISystemsHeaderProps {
  onAddSystem: () => void
}

export function AISystemsHeader({ onAddSystem }: AISystemsHeaderProps) {
  return (
    <PageHeader
      title="AI Systems"
      actions={[
        {
          icon: Plus,
          label: "Connect AI System",
          onClick: onAddSystem
        }
      ]}
    />
  )
}