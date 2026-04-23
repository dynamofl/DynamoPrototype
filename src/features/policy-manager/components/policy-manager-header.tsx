import { PageHeader } from '@/components/patterns'
import { Plus } from 'lucide-react'

export interface PolicyManagerHeaderProps {
  onAddPolicy: () => void
}

export function PolicyManagerHeader({ onAddPolicy }: PolicyManagerHeaderProps) {
  return (
    <PageHeader
      title="Policy Manager"
      actions={[
        {
          icon: Plus,
          label: "Create New Policy",
          onClick: onAddPolicy
        }
      ]}
    />
  )
}
