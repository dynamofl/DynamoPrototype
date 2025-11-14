// Custom hook for updating attack outcome based on human judgement
// Updates the attack_outcome column in the database

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface UseUpdateAttackOutcomeProps {
  promptId: string
  testType: 'jailbreak' | 'compliance'
}

export function useUpdateAttackOutcome({
  promptId,
  testType
}: UseUpdateAttackOutcomeProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateOutcome = async (humanJudgement: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('No active session. Please refresh the page.')
      }

      const userId = session.user.id

      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      if (!supabaseUrl) {
        throw new Error('Supabase URL not configured')
      }

      // Call the edge function
      const response = await fetch(`${supabaseUrl}/functions/v1/update-attack-outcome`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          promptId,
          testType,
          humanJudgement,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Edge function error response:', errorData)
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}${errorData.hint ? ` (${errorData.hint})` : ''}`
          : errorData.error || 'Failed to update outcome'
        throw new Error(errorMessage)
      }

      const result = await response.json()

      return result.data
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      setError(error)

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    updateOutcome,
    isLoading,
    error,
  }
}
