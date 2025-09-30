import { PageHeader } from '@/components/patterns'
import { Plus } from 'lucide-react'

export interface AIProvidersHeaderProps {
  onAddProvider: () => void
}

export function AIProvidersHeader({ onAddProvider }: AIProvidersHeaderProps) {
  return (
    <PageHeader
      title="AI Providers"
      actions={[
        {
          icon: Plus,
          label: "Add Provider",
          onClick: onAddProvider
        }
      ]}
    />
  )
}