import { PageHeader } from '@/components/patterns'
import { Plus } from 'lucide-react'

export interface EvaluationHistoryHeaderProps {
  onNewEvaluation: () => void
}

export function EvaluationHistoryHeader({ onNewEvaluation }: EvaluationHistoryHeaderProps) {
  return (
    <PageHeader
      title="Evaluation"
      actions={[
        {
          icon: Plus,
          label: "New Evaluation",
          onClick: onNewEvaluation
        }
      ]}
    />
  )
}
