import { supabase } from '@/lib/supabase/client'

export type PolicyDirection = 'input' | 'output' | 'both'

export interface GeneratedPolicy {
  name: string
  description: string
  useCase: string
  inputOutputDirection: PolicyDirection
  allowedBehaviors: string[]
  disallowedBehaviors: string[]
}

export type PolicyWarningKind =
  | 'boundary_collision'
  | 'ambiguous_pair'
  | 'granularity_imbalance'
  | 'scope_gap'
  | 'description_contradiction'

export interface PolicyWarning {
  kind: PolicyWarningKind
  severity: 'high' | 'medium' | 'low'
  behaviors: Array<{ side: 'allowed' | 'disallowed'; index: number }>
  boundaryPrompt?: string
  explanation: string
  recommendation: string
}

export interface PolicyGenerationResult {
  policy: GeneratedPolicy
  warnings: PolicyWarning[]
}

interface GeneratePolicyResponse {
  policy?: GeneratedPolicy
  warnings?: PolicyWarning[]
  error?: string
}

export class PolicyGeneratorService {
  static async generate(objective: string): Promise<PolicyGenerationResult> {
    const trimmed = objective.trim()
    if (!trimmed) {
      throw new Error('Objective is required.')
    }

    const { data, error } = await supabase.functions.invoke<GeneratePolicyResponse>(
      'generate-policy',
      { body: { objective: trimmed } },
    )

    if (error) {
      throw new Error(error.message || 'Failed to generate policy.')
    }

    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to generate policy.')
    }

    if (!data.policy) {
      throw new Error('Policy generation returned an empty response.')
    }

    return {
      policy: data.policy,
      warnings: data.warnings ?? [],
    }
  }
}
