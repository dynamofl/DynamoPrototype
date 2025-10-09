import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { Guardrail } from '@/types'

/**
 * Hook to fetch guardrails (policies) from Supabase backend
 * Replaces localStorage-based useGuardrails hook
 */
export function useGuardrailsSupabase() {
  const [guardrails, setGuardrails] = useState<Guardrail[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load guardrails from Supabase
  useEffect(() => {
    loadGuardrails()

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('guardrails-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guardrails'
        },
        () => {
          loadGuardrails()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function loadGuardrails() {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('guardrails')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform Supabase data to match Guardrail type
      const transformedGuardrails: Guardrail[] = (data || []).map((item) => {
        // Extract policy data from policies JSONB array
        const policyData = Array.isArray(item.policies) && item.policies.length > 0
          ? item.policies[0]
          : {}

        return {
          id: item.id,
          name: item.name,
          description: policyData.description || '',
          content: policyData.disallowedBehavior || '', // Map disallowedBehavior to content for backward compatibility
          allowedBehavior: policyData.allowedBehavior || '',
          disallowedBehavior: policyData.disallowedBehavior || '',
          category: item.category || 'Content',
          type: item.type || 'Input Policy',
          status: item.status || 'active',
          createdAt: item.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
          updatedAt: item.updated_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        }
      })

      setGuardrails(transformedGuardrails)
    } catch (err) {
      console.error('Failed to load guardrails from Supabase:', err)
      setError(err instanceof Error ? err.message : 'Failed to load guardrails')
      setGuardrails([])
    } finally {
      setLoading(false)
    }
  }

  const addGuardrail = async (guardrail: Guardrail) => {
    try {
      const policies = [{
        description: guardrail.description || '',
        allowedBehavior: guardrail.allowedBehavior || '',
        disallowedBehavior: guardrail.disallowedBehavior || guardrail.content || ''
      }]

      const { error } = await supabase
        .from('guardrails')
        .insert({
          name: guardrail.name,
          type: guardrail.type || 'Input Policy',
          category: guardrail.category || 'Content',
          status: 'active',
          policies
        })

      if (error) throw error

      // Reload guardrails after adding
      await loadGuardrails()
    } catch (err) {
      console.error('Failed to add guardrail:', err)
      throw err
    }
  }

  const updateGuardrail = async (id: string, updates: Partial<Guardrail>) => {
    try {
      const updateData: any = {}

      if (updates.name) updateData.name = updates.name
      if (updates.type) updateData.type = updates.type
      if (updates.category) updateData.category = updates.category
      if (updates.status) updateData.status = updates.status

      // Update policies JSONB if any policy-related fields are updated
      if (updates.description || updates.allowedBehavior || updates.disallowedBehavior || updates.content) {
        // Get current guardrail to merge updates
        const current = guardrails.find(g => g.id === id)
        if (current) {
          updateData.policies = [{
            description: updates.description ?? current.description,
            allowedBehavior: updates.allowedBehavior ?? current.allowedBehavior,
            disallowedBehavior: updates.disallowedBehavior ?? updates.content ?? current.disallowedBehavior
          }]
        }
      }

      const { error } = await supabase
        .from('guardrails')
        .update(updateData)
        .eq('id', id)

      if (error) throw error

      // Reload guardrails after updating
      await loadGuardrails()
    } catch (err) {
      console.error('Failed to update guardrail:', err)
      throw err
    }
  }

  const deleteGuardrail = async (id: string) => {
    try {
      const { error } = await supabase
        .from('guardrails')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Reload guardrails after deleting
      await loadGuardrails()
    } catch (err) {
      console.error('Failed to delete guardrail:', err)
      throw err
    }
  }

  const toggleGuardrailStatus = async (id: string) => {
    try {
      const current = guardrails.find(g => g.id === id)
      if (!current) return

      const newStatus = current.status === 'active' ? 'inactive' : 'active'

      const { error } = await supabase
        .from('guardrails')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error

      // Reload guardrails after toggling
      await loadGuardrails()
    } catch (err) {
      console.error('Failed to toggle guardrail status:', err)
      throw err
    }
  }

  const getActiveGuardrails = () => {
    return guardrails.filter(guardrail => guardrail.status === 'active')
  }

  const getGuardrailById = (id: string) => {
    return guardrails.find(guardrail => guardrail.id === id)
  }

  return {
    guardrails,
    loading,
    error,
    addGuardrail,
    updateGuardrail,
    deleteGuardrail,
    toggleGuardrailStatus,
    getActiveGuardrails,
    getGuardrailById,
    reload: loadGuardrails
  }
}
