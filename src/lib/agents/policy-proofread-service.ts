import { supabase } from '@/lib/supabase/client'

export type ProofreadSuggestionType = 'add' | 'update' | 'remove'
export type ProofreadSide = 'allowed' | 'disallowed'

export interface ProofreadSuggestion {
  type: ProofreadSuggestionType
  side: ProofreadSide
  /** 0-based index into the original side's array. Set for update/remove. */
  index?: number
  /** Replacement / new behavior text. Set for add/update. */
  newText?: string
  rationale?: string
}

export interface ProofreadResult {
  suggestions: ProofreadSuggestion[]
}

export interface ProofreadInputPolicy {
  name: string
  description: string
  allowed: string[]
  disallowed: string[]
}

export interface ProofreadInputReference {
  name: string
}

interface ProofreadResponseBody {
  suggestions?: ProofreadSuggestion[]
  error?: string
}

export class PolicyProofreadService {
  static async review(
    policy: ProofreadInputPolicy,
    references: ProofreadInputReference[] = [],
  ): Promise<ProofreadResult> {
    const { data, error } = await supabase.functions.invoke<ProofreadResponseBody>(
      'proofread-policy',
      { body: { policy, references } },
    )

    if (error) {
      throw new Error(error.message || 'Failed to proofread policy.')
    }
    if (!data || data.error) {
      throw new Error(data?.error || 'Failed to proofread policy.')
    }
    if (!Array.isArray(data.suggestions)) {
      throw new Error('Proofread returned an empty response.')
    }

    return { suggestions: data.suggestions }
  }
}
