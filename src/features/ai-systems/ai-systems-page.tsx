import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AISystem } from './types'
import { toUrlSlug } from '@/lib/utils'
import {
  AISystemCreateSheet,
  AISystemEditSheet,
  AISystemViewSheet,
  AISystemsHeader,
  AISystemsStats,
  AISystemsTableDirect
} from './components'
import { useAISystemsSupabase } from './lib/useAISystemsSupabase'
import { supabase, ensureAuthenticated } from '@/lib/supabase/client'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

/**
 * AI Systems page - Main component using modular components
 */

export function AISystemsPage() {
  const navigate = useNavigate()

  // Dialog and sheet states
  const [isAddingSystem, setIsAddingSystem] = useState(false)
  const [isEditingSystem, setIsEditingSystem] = useState(false)
  const [editingSystem, setEditingSystem] = useState<AISystem | null>(null)
  const [isViewingSystem, setIsViewingSystem] = useState(false)
  const [viewingSystem, setViewingSystem] = useState<AISystem | null>(null)

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [systemToDelete, setSystemToDelete] = useState<AISystem | null>(null)

  // Selection state
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Use Supabase hook for AI systems data
  const { aiSystems, loading: aiSystemsLoading, reload: reloadAISystems } = useAISystemsSupabase()

  // Log AI systems for debugging
  useEffect(() => {
    console.log('[AISystemsPage] AI System IDs from Supabase:', aiSystems.map((s: AISystem) => ({ id: s.id, name: s.name })))
  }, [aiSystems])



  // Handle system creation
  const handleSystemCreated = async (system: AISystem) => {
    try {
      // Ensure authenticated
      await ensureAuthenticated()

      // Create AI system in Supabase
      const { error } = await supabase
        .from('ai_systems')
        .insert({
          id: system.id,
          name: system.name,
          description: '',  // AI System type doesn't have description
          provider: system.providerId,
          model: system.selectedModel,
          config: {
            apiKeyId: system.apiKeyId,
            apiKeyName: system.apiKeyName,
            modelDetails: system.modelDetails,
            icon: system.icon,
            status: system.status,
            hasValidAPIKey: system.hasValidAPIKey
          }
        })

      if (error) {
        console.error('Failed to create system in Supabase:', error)
        throw error
      }

      // Trigger reload of AI systems
      await reloadAISystems()
    } catch (error) {
      console.error('Failed to create system:', error)
    }
  }

  // Handle system update
  const handleSystemUpdated = async (system: AISystem) => {
    try {
      // Ensure authenticated
      await ensureAuthenticated()

      // Update AI system in Supabase
      const { error } = await supabase
        .from('ai_systems')
        .update({
          name: system.name,
          description: '',  // AI System type doesn't have description
          provider: system.providerId,
          model: system.selectedModel,
          config: {
            apiKeyId: system.apiKeyId,
            apiKeyName: system.apiKeyName,
            modelDetails: system.modelDetails,
            icon: system.icon,
            status: system.status,
            hasValidAPIKey: system.hasValidAPIKey
          }
        })
        .eq('id', system.id)

      if (error) {
        console.error('Failed to update system in Supabase:', error)
        throw error
      }

      // Trigger reload of AI systems
      await reloadAISystems()
    } catch (error) {
      console.error('Failed to update system:', error)
    }
  }

  // Handle edit system from direct table
  const handleEditSystem = (system: AISystem) => {
    setEditingSystem(system)
    setIsEditingSystem(true)
  }

  // Handle delete system from direct table
  const handleDeleteSystemRequest = (system: AISystem) => {
    setSystemToDelete(system)
    setIsDeleteDialogOpen(true)
  }

  // Handle delete system confirmation
  const handleDeleteSystemConfirm = async () => {
    if (!systemToDelete) return

    try {
      // Ensure authenticated
      await ensureAuthenticated()

      // Delete AI system from Supabase
      const { error } = await supabase
        .from('ai_systems')
        .delete()
        .eq('id', systemToDelete.id)

      if (error) {
        console.error('Failed to delete system from Supabase:', error)
        throw error
      }

      // Trigger reload of AI systems
      await reloadAISystems()
      // Close dialog and reset state
      setIsDeleteDialogOpen(false)
      setSystemToDelete(null)
    } catch (error) {
      console.error('Failed to delete system:', error)
    }
  }

  // Handle delete dialog cancel
  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false)
    setSystemToDelete(null)
  }

  // Handle manage evaluation
  const handleManageEvaluation = (system: AISystem) => {
    // Navigate to the evaluation page with system name in URL
    navigate(`/ai-systems/${toUrlSlug(system.name)}/evaluation`)
  }

  // Handle view info
  const handleViewInfo = (system: AISystem) => {
    setViewingSystem(system)
    setIsViewingSystem(true)
  }

  // Handle edit from view sheet
  const handleEditFromView = () => {
    if (viewingSystem) {
      setEditingSystem(viewingSystem)
      setIsEditingSystem(true)
    }
  }

  // Handle row selection
  const handleRowSelect = (id: string, selected: boolean) => {
    setSelectedRows(prev => 
      selected 
        ? [...prev, id]
        : prev.filter(rowId => rowId !== id)
    )
  }

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedRows(selected ? aiSystems.map(system => system.id) : [])
  }

  // Show loading state while AI systems are being fetched
  if (aiSystemsLoading) {
    return (
      <div className="">
        <main className="mx-auto">
          <div className="space-y-3 py-3">
            <AISystemsHeader onAddSystem={() => setIsAddingSystem(true)} />
            <div className="px-4">
              <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Loading AI Systems...</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="">
      <main className="mx-auto">
        <div className="space-y-3 py-3">
          {/* Page Header */}
          <AISystemsHeader onAddSystem={() => setIsAddingSystem(true)} />

          {/* Stats Cards */}
          <div className="px-4">
            <AISystemsStats data={aiSystems} />
          </div>


          {/* Systems Table */}
          <div className="">
            <AISystemsTableDirect
              data={aiSystems}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              onEdit={handleEditSystem}
              onDelete={handleDeleteSystemRequest}
              onManageEvaluation={handleManageEvaluation}
              onViewInfo={handleViewInfo}
            />
          </div>

          {/* Create System Sheet */}
          <AISystemCreateSheet
            open={isAddingSystem}
            onOpenChange={setIsAddingSystem}
            onAISystemCreated={handleSystemCreated}
          />

          {/* View System Sheet */}
          <AISystemViewSheet
            open={isViewingSystem}
            onOpenChange={setIsViewingSystem}
            aiSystem={viewingSystem}
            onEditClick={handleEditFromView}
          />

          {/* Edit System Sheet */}
          <AISystemEditSheet
            open={isEditingSystem}
            onOpenChange={setIsEditingSystem}
            aiSystem={editingSystem}
            onAISystemUpdated={handleSystemUpdated}
          />

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete AI System</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{systemToDelete?.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={handleDeleteCancel}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteSystemConfirm}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          
        </div>
      </main>
    </div>
  )
}
