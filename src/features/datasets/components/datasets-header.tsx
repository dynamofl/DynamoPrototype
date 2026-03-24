import { PageHeader } from '@/components/patterns'
import { Plus } from 'lucide-react'

export interface DatasetsHeaderProps {
  onAddDataset: () => void
}

export function DatasetsHeader({ onAddDataset }: DatasetsHeaderProps) {
  return (
    <PageHeader
      title="Datasets"
      actions={[
        {
          icon: Plus,
          label: 'Add Dataset',
          onClick: onAddDataset,
        },
      ]}
    />
  )
}
