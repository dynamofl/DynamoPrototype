import type { LucideIcon } from 'lucide-react'

export type OnboardingStep = 'create' | 'usecase' | 'providers' | 'permissions'

export const STEPS: OnboardingStep[] = ['create', 'usecase', 'providers', 'permissions']

export interface UseCaseOption {
  id: string
  name: string
  description: string
  icon: LucideIcon
}
