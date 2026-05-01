import { StepRow } from './step-row'
import type { StepProgress } from '../types'

interface ConnectAISystemStepProps {
  progress: StepProgress
  provider?: string
  modelId?: string
  connectedAt?: string
}

export function ConnectAISystemStep({
  progress,
  provider = 'OpenAI',
  modelId = '3.5 Turbo',
  connectedAt = 'Jan 27, 2026',
}: ConnectAISystemStepProps) {
  if (progress === 'completed') {
    return (
      <StepRow
        number={1}
        state="completed"
        title="Connect Your AI System"
        description={
          <>
            Provider: {provider}
            <span className="px-1 text-gray-400">•</span>
            Model ID: {modelId}
            <span className="px-1 text-gray-400">•</span>
            Connected: {connectedAt}
            <span className="px-1 text-gray-400">•</span>
            <button
              type="button"
              className="border-b border-dashed border-gray-300 hover:text-gray-900"
            >
              View Model ID
            </button>
          </>
        }
      />
    )
  }

  if (progress === 'in-progress') {
    return (
      <StepRow
        number={1}
        state="active"
        title="Connect Your AI System"
        description="Connect the AI system you want to evaluate."
      />
    )
  }

  return (
    <StepRow
      number={1}
      state="pending"
      title="Connect Your AI System"
      description="Connect the AI system you want to evaluate."
    />
  )
}
