import { useState, useMemo } from 'react'
import type { TableRow } from '@/types/table'
import type { AISystem } from './types'
import {
  AISystemCreateSheet,
  AISystemEditSheet
} from './components'
import {
  AISystemsTableStorage,
  aiSystemsStorageConfig,
  aiSystemsColumns,
  aiSystemsExpandableConfig,
  aiSystemsPaginationConfig,
  aiSystemsStateManager
} from './lib'
import { TablePattern, TableActions } from '@/components/patterns'
import { Button } from '@/components/ui/button'
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
import { Plus } from 'lucide-react'

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
  
  // Create custom storage instance for AI systems
  const customStorage = useMemo(() => {
    return new AISystemsTableStorage(aiSystemsStorageConfig)
  }, [])


  // Handle cell actions from TablePattern
  const handleCellAction = (action: string, row: TableRow) => {
    switch (action) {
      case 'edit':
        setEditingSystem(row as AISystem)
        setIsEditingSystem(true)
        break
      case 'delete':
        setSystemToDelete(row as AISystem)
        setIsDeleteDialogOpen(true)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  // Handle row expansion
  const handleRowExpand = (rowId: string, expanded: boolean) => {
    console.log('Row expanded:', rowId, expanded)
  }

  // Handle data changes from TablePattern
  const handleDataChange = (data: TableRow[]) => {
    console.log('Data changed:', data.length, 'systems')
  }

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


  // Handle delete system
  const handleDeleteSystem = async () => {
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

  // Handle table actions
  const handleSearch = (value: string) => {
    console.log('Search:', value)
    // TODO: Implement search functionality
  }

  const handleFilter = () => {
    console.log('Filter clicked')
    // TODO: Implement filter functionality
  }

  const handleEditColumns = () => {
    console.log('Edit columns clicked')
    // TODO: Implement column management
  }

  const handleExport = () => {
    console.log('Export clicked')
    // TODO: Implement export functionality
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto">
        <div className="space-y-4">
          {/* Page Header */}
          <div className="px-6">
            <div className="flex items-center justify-between my-4">
              <h1 className="text-lg font-450 tracking-tight">AI Systems</h1>
              <Button
                onClick={() => setIsAddingSystem(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Connect AI System
              </Button>
            </div>
          </div>

          {/* Table Actions */}
          <TableActions
            searchPlaceholder="Search AI Systems..."
            onSearch={handleSearch}
            onFilter={handleFilter}
            onEditColumns={handleEditColumns}
            onExport={handleExport}
          />

          {/* Systems Table */}
          <div className="px-6">
            <TablePattern
              key={refreshTrigger}
              mode="view"
              columns={aiSystemsColumns}
              storageConfig={aiSystemsStorageConfig}
              customStorage={customStorage}
              pagination={aiSystemsPaginationConfig}
              expandable={aiSystemsExpandableConfig}
              onDataChange={handleDataChange}
              onCellAction={handleCellAction}
              onRowExpand={handleRowExpand}
              className=""
              emptyMessage="No AI systems configured. Add your first system to get started."
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
                  onClick={handleDeleteSystem}
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
