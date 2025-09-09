/**
 * AI Systems table component using the table pattern
 * Maintains the same styling as the static ai-systems-table.tsx
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Search, Filter, Download, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { TablePattern } from '@/components/patterns'
import { AISystemCreateSheet, AISystemViewSheet } from './'
import { AISystemsStorage } from '../lib'
import { 
  aiSystemsColumns,
  aiSystemsStorageConfig,
  aiSystemsPaginationConfig,
  aiSystemsExpandableConfig
} from '../lib/ai-systems-config'
import type { TableRow } from '@/types/table'
import type { AISystem } from '../types'

interface AISystemsTableProps {
  className?: string
}

export function AISystemsTable({ className = '' }: AISystemsTableProps) {
  const [isAddingSystem, setIsAddingSystem] = useState(false)
  const [isViewingSystem, setIsViewingSystem] = useState(false)
  const [viewingSystem, setViewingSystem] = useState<AISystem | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Create custom storage instance
  const customStorage = new AISystemsStorage()

  // Handle cell actions
  const handleCellAction = (action: string, row: TableRow) => {
    switch (action) {
      case 'view':
        setViewingSystem(row as AISystem)
        setIsViewingSystem(true)
        break
      case 'edit':
        setViewingSystem(row as AISystem)
        setIsViewingSystem(true)
        break
      case 'delete':
        handleDeleteSystem(row.id)
        break
      default:
        console.log('Unknown action:', action)
    }
  }


  // Handle system creation
  const handleSystemCreated = async (system: AISystem) => {
    try {
      await customStorage.addAISystem(system)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Failed to create AI system:', error)
    }
  }

  // Handle system update
  const handleSystemUpdate = async (system: AISystem) => {
    try {
      await customStorage.updateAISystem(system.id, system)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Failed to update AI system:', error)
    }
  }

  // Handle system deletion
  const handleDeleteSystem = async (systemId: string) => {
    try {
      await customStorage.deleteAISystem(systemId)
      setRefreshTrigger(prev => prev + 1)
    } catch (error) {
      console.error('Failed to delete AI system:', error)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Actions - matching the static table style */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search AI systems..."
              className="pl-8 w-[300px]"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Edit Columns
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsAddingSystem(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add AI System
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border-t border-b">
        <TablePattern
          columns={aiSystemsColumns}
          storageConfig={aiSystemsStorageConfig}
          pagination={aiSystemsPaginationConfig}
          expandable={aiSystemsExpandableConfig}
          onCellAction={handleCellAction}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Create System Sheet */}
      <AISystemCreateSheet
        open={isAddingSystem}
        onOpenChange={setIsAddingSystem}
        onAISystemCreated={handleSystemCreated}
      />

      {/* View/Edit System Sheet */}
      <AISystemViewSheet
        open={isViewingSystem}
        onOpenChange={setIsViewingSystem}
        system={viewingSystem}
        onSystemUpdate={handleSystemUpdate}
        onSystemDelete={handleDeleteSystem}
      />
    </div>
  )
}
