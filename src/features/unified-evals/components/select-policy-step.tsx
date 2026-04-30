import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StepRow } from './step-row'
import type { StepProgress } from '../types'

interface SelectPolicyStepProps {
  progress: StepProgress
}

export function SelectPolicyStep({ progress }: SelectPolicyStepProps) {
  const navigate = useNavigate()

  if (progress === 'completed') {
    return (
      <StepRow
        number={3}
        state="completed"
        title="Select Policy and Run Evaluation"
        description="Policies have been selected and the evaluation is ready to run."
      />
    )
  }

  if (progress === 'before') {
    return (
      <StepRow
        number={3}
        state="pending"
        title="Select Policy and Run Evaluation"
        description="Choose a policy to evaluate your AI system's performance against specific criteria and compliance standards."
      />
    )
  }

  return (
    <StepRow
      number={3}
      state="active"
      title="Select Policy and Run Evaluation"
      description="We have found 18 created policies and 20 out of box policies from the directory."
    >
      <div>
        <Button
          size="sm"
          className="h-8 rounded-lg px-3 text-sm"
          onClick={() => navigate('/unified-evals/create')}
        >
          Start Adding Policies to Evaluate
        </Button>
      </div>
    </StepRow>
  )
}
