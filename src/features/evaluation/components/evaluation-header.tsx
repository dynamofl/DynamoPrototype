import { PageHeader } from '@/components/patterns'
import { Play, History } from 'lucide-react'

export interface EvaluationHeaderProps {
  onRunEvaluation: () => void
  onShowHistory: () => void
  isLoading: boolean
  isDisabled: boolean
}

export function EvaluationHeader({
  onRunEvaluation,
  onShowHistory,
  isLoading,
  isDisabled
}: EvaluationHeaderProps) {
  return (
    <PageHeader
      title="Evaluation Sandbox"
      description="Test and evaluate AI models with different configurations"
      actions={[
        {
          icon: Play,
          label: isLoading ? "Evaluating..." : "Run Evaluation",
          onClick: onRunEvaluation,
          variant: 'default',
          disabled: isDisabled
        },
        {
          icon: History,
          label: "Show History",
          onClick: onShowHistory,
          variant: 'outline'
        }
      ]}
      className='py-3'
    />
  )
}
