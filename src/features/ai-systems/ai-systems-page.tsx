import { useState, useMemo } from 'react'
import type { TableRow } from '@/types/table'
import type { AISystem } from './types'
import {
  AISystemCreateSheet,
  AISystemViewSheet
} from './components'
import {
  AISystemsTableStorage,
  aiSystemsStorageConfig,
  aiSystemsColumns,
  aiSystemsExpandableConfig,
  aiSystemsPaginationConfig
} from './lib'
import { TablePattern } from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

/**
 * AI Systems page - Main component using modular components
 */

export function AISystemsPage() {
  // Dialog and sheet states
  const [isAddingSystem, setIsAddingSystem] = useState(false)
  const [isViewingSystem, setIsViewingSystem] = useState(false)
  const [viewingSystem, setViewingSystem] = useState<TableRow | null>(null)
  
  // Create custom storage instance for AI systems
  const customStorage = useMemo(() => {
    return new AISystemsTableStorage(aiSystemsStorageConfig)
  }, [])

  // Handle cell actions from TablePattern
  const handleCellAction = (action: string, row: TableRow) => {
    switch (action) {
      case 'view':
        setViewingSystem(row)
        setIsViewingSystem(true)
        break
      case 'edit':
        setViewingSystem(row)
        setIsViewingSystem(true)
        break
      case 'delete':
        handleDeleteSystem(row.id)
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
      await customStorage.add(system)
    } catch (error) {
      console.error('Failed to create system:', error)
    }
  }

  // Handle system update
  const handleSystemUpdated = async (system: AISystem) => {
    try {
      await customStorage.update(system.id, system)
    } catch (error) {
      console.error('Failed to update system:', error)
    }
  }

  // Handle delete system
  const handleDeleteSystem = async (id: string) => {
    try {
      await customStorage.delete(id)
    } catch (error) {
      console.error('Failed to delete system:', error)
    }
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
                Add System
              </Button>
            </div>
          </div>

          {/* Systems Table */}
          <div className="px-6">
            <TablePattern
              mode="view"
              columns={aiSystemsColumns}
              storageConfig={aiSystemsStorageConfig}
              customStorage={customStorage}
              pagination={aiSystemsPaginationConfig}
              expandable={aiSystemsExpandableConfig}
              onDataChange={handleDataChange}
              onCellAction={handleCellAction}
              onRowExpand={handleRowExpand}
              className="border rounded-lg"
              emptyMessage="No AI systems configured. Add your first system to get started."
            />
          </div>

          {/* View System Sheet */}
          <AISystemViewSheet
            open={isViewingSystem}
            onOpenChange={setIsViewingSystem}
            system={viewingSystem as AISystem | null}
            onSystemUpdate={handleSystemUpdated}
            onSystemDelete={handleDeleteSystem}
          />

          {/* Create System Sheet */}
          <AISystemCreateSheet
            open={isAddingSystem}
            onOpenChange={setIsAddingSystem}
            onAISystemCreated={handleSystemCreated}
          />
        </div>
      </main>
    </div>
  )
}
