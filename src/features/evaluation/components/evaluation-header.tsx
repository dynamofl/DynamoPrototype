import { PageHeader } from '@/components/patterns'
import { Play, History, Plus } from 'lucide-react'

export interface EvaluationHeaderProps {
  onRunEvaluation: () => void
  onShowHistory: () => void
  onNewEvaluation?: () => void
  isLoading: boolean
  isDisabled: boolean
  showHistory: boolean
}

export function EvaluationHeader({
  onRunEvaluation,
  onShowHistory,
  onNewEvaluation,
  isLoading,
  isDisabled,
  showHistory
}: EvaluationHeaderProps) {
  return (
    <PageHeader
      title="Evaluation Sandbox"
      description="Test and evaluate AI models with different configurations"
      actions={[
        {
          icon: showHistory ? Plus : Play,
          label: showHistory ? "New Evaluation" : (isLoading ? "Evaluating..." : "Run Evaluation"),
          onClick: showHistory ? (onNewEvaluation || (() => {})) : onRunEvaluation,
          variant: 'default',
          disabled: !showHistory && isDisabled
        },
        {
          icon: History,
          label: showHistory ? "Hide History" : "Manage Evaluations",
          onClick: onShowHistory,
          variant: 'outline'
        }
      ]}
      className='py-3'
    />
  )
}
