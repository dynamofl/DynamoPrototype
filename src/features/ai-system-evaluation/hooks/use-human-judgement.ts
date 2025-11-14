// Custom hook for managing human judgements
// Handles API calls, optimistic updates, and error handling

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { JudgementType } from '../types/base-evaluation'

interface UseHumanJudgementProps {
  promptId: string
  testType: 'jailbreak' | 'compliance'
  judgementType: JudgementType
}

interface UpdateJudgementParams {
  judgementValue: string | null
}

export function useHumanJudgement({
  promptId,
  testType,
  judgementType
}: UseHumanJudgementProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateJudgement = async ({ judgementValue }: UpdateJudgementParams) => {
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
      const response = await fetch(`${supabaseUrl}/functions/v1/update-human-judgement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          promptId,
          testType,
          judgementType,
          judgementValue,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Edge function error response:', errorData)
        const errorMessage = errorData.details
          ? `${errorData.error}: ${errorData.details}${errorData.hint ? ` (${errorData.hint})` : ''}`
          : errorData.error || 'Failed to update judgement'
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
    updateJudgement,
    isLoading,
    error,
  }
}
