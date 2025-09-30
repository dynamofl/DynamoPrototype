import { useState, useMemo, useEffect } from 'react'
import type { AISystem } from './types'
import {
  AISystemCreateSheet,
  AISystemEditSheet,
  AISystemsHeader,
  AISystemsStats,
  AISystemsTableDirect
} from './components'
import {
  AISystemsTableStorage,
  aiSystemsStorageConfig,
  aiSystemsStateManager
} from './lib'
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
  // Dialog and sheet states
  const [isAddingSystem, setIsAddingSystem] = useState(false)
  const [isEditingSystem, setIsEditingSystem] = useState(false)
  const [editingSystem, setEditingSystem] = useState<AISystem | null>(null)
  
  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [systemToDelete, setSystemToDelete] = useState<AISystem | null>(null)
  
  // Refresh trigger for table
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // AI Systems data
  const [aiSystems, setAiSystems] = useState<AISystem[]>([])
  
  // Selection state
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  
  // Create custom storage instance for AI systems
  const customStorage = useMemo(() => {
    return new AISystemsTableStorage(aiSystemsStorageConfig)
  }, [])

  // Load AI systems data
  const loadAISystems = async () => {
    try {
      const systems = await customStorage.load()
      setAiSystems(systems as AISystem[])
    } catch (error) {
      console.error('Failed to load AI systems:', error)
      setAiSystems([])
    }
  }

  // Load data on mount and refresh trigger changes
  useEffect(() => {
    loadAISystems()
  }, [refreshTrigger, customStorage])



  // Handle system creation
  const handleSystemCreated = async (system: AISystem) => {
    try {
      // Invalidate cache for this provider BEFORE adding to ensure fresh validation
      aiSystemsStateManager.notifyAPIKeyModified(system.providerId)
      await customStorage.add(system)
      // Trigger table refresh
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Failed to create system:', error)
    }
  }

  // Handle system update
  const handleSystemUpdated = async (system: AISystem) => {
    try {
      // Invalidate cache for this provider BEFORE updating to ensure fresh validation
      aiSystemsStateManager.notifyAPIKeyModified(system.providerId)
      await customStorage.update(system.id, system)
      // Trigger table refresh
      setRefreshTrigger(prev => prev + 1)
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
      await customStorage.delete(systemToDelete.id)
      // Trigger table refresh
      setRefreshTrigger(prev => prev + 1)
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
            />
          </div>

          {/* Create System Sheet */}
          <AISystemCreateSheet
            open={isAddingSystem}
            onOpenChange={setIsAddingSystem}
            onAISystemCreated={handleSystemCreated}
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
