import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { V2Project, ProjectVisibility } from '../types/project'

export function useProjects() {
  const [projects, setProjects] = useState<V2Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setProjects(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects'
      setError(message)
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const createProject = async (name: string, useCase?: string, visibility: ProjectVisibility = 'private'): Promise<V2Project | null> => {
    try {
      setError(null)

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          name,
          use_case: useCase || null,
          visibility,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Refresh the list
      await loadProjects()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project'
      setError(message)
      console.error('Error creating project:', err)
      return null
    }
  }

  const updateProject = async (id: string, updates: Partial<Pick<V2Project, 'name' | 'use_case' | 'visibility'>>): Promise<V2Project | null> => {
    try {
      setError(null)

      const { data, error: updateError } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      await loadProjects()
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update project'
      setError(message)
      console.error('Error updating project:', err)
      return null
    }
  }

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      setError(null)

      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (deleteError) {
        throw deleteError
      }

      await loadProjects()
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project'
      setError(message)
      console.error('Error deleting project:', err)
      return false
    }
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refreshProjects: loadProjects,
  }
}
