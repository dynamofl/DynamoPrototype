export type StepState = 'completed' | 'active' | 'pending'

export type StepProgress = 'before' | 'in-progress' | 'completed'

export type UsecaseOption = {
  value: string
  label: string
  description: string
}

export { createGeneratedPolicyId } from './generated-policy'
export type { GeneratedPolicy } from './generated-policy'
