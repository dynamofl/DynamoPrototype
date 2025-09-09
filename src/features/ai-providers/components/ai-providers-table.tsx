/**
 * AI Providers table component using the new table pattern
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TablePattern } from '@/components/patterns'
import { CreateDialog } from '@/components/patterns'
import { ViewEditSheet } from '@/components/patterns'
import { 
  aiProvidersStorageConfig,
  aiProvidersColumns,
  aiProvidersExpandableConfig,
  aiProvidersPaginationConfig,
  createDefaultAIProvider,
  validateAIProvider
} from '../lib/ai-providers-config'
import type { TableRow } from '@/types/table'

interface AIProvidersTableProps {
  className?: string
}

export function AIProvidersTable({ className = '' }: AIProvidersTableProps) {
  const [isAddingProvider, setIsAddingProvider] = useState(false)
  const [isViewingProvider, setIsViewingProvider] = useState(false)
  const [isEditingProvider, setIsEditingProvider] = useState(false)
  const [viewingProvider, setViewingProvider] = useState<TableRow | null>(null)
  const [editingProvider, setEditingProvider] = useState<TableRow | null>(null)

  // Handle cell actions
  const handleCellAction = (action: string, row: TableRow, index: number) => {
    switch (action) {
      case 'view':
        setViewingProvider(row)
        setIsViewingProvider(true)
        break
      case 'edit':
        setEditingProvider(row)
        setIsEditingProvider(true)
        break
      case 'delete':
        // Handle delete action
        console.log('Delete provider:', row.id)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  // Handle row expansion
  const handleRowExpand = (rowId: string, expanded: boolean) => {
    console.log('Row expanded:', rowId, expanded)
  }

  // Handle data changes
  const handleDataChange = (data: TableRow[]) => {
    console.log('Data changed:', data.length, 'providers')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Providers</h2>
          <p className="text-sm text-gray-600">
            Manage your AI service providers and their configurations
          </p>
        </div>
        <CreateDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          }
          title="Add AI Provider"
          description="Add a new AI service provider to your configuration"
          open={isAddingProvider}
          onOpenChange={setIsAddingProvider}
          maxWidth="lg"
        >
          {/* Add provider form content will go here */}
          <div className="p-4">
            <p>Add provider form will be implemented here</p>
          </div>
        </CreateDialog>
      </div>

      {/* Table */}
      <TablePattern
        mode="view"
        columns={aiProvidersColumns}
        storageConfig={aiProvidersStorageConfig}
        pagination={aiProvidersPaginationConfig}
        expandable={aiProvidersExpandableConfig}
        onDataChange={handleDataChange}
        onCellAction={handleCellAction}
        onRowExpand={handleRowExpand}
        className="border rounded-lg"
        emptyMessage="No AI providers configured. Add your first provider to get started."
      />

      {/* View Provider Sheet */}
      <ViewEditSheet
        open={isViewingProvider}
        onOpenChange={setIsViewingProvider}
        title={viewingProvider?.name || "Provider Details"}
        description="View detailed information about this AI service provider"
        size="lg"
      >
        {viewingProvider && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-450 text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{viewingProvider.name}</p>
              </div>
              <div>
                <label className="text-sm font-450 text-gray-700">Type</label>
                <p className="text-sm text-gray-900">{viewingProvider.type}</p>
              </div>
              <div>
                <label className="text-sm font-450 text-gray-700">Status</label>
                <p className="text-sm text-gray-900">{viewingProvider.status}</p>
              </div>
              <div>
                <label className="text-sm font-450 text-gray-700">Models</label>
                <p className="text-sm text-gray-900">{viewingProvider.models?.length || 0}</p>
              </div>
            </div>
          </div>
        )}
      </ViewEditSheet>

      {/* Edit Provider Sheet */}
      <ViewEditSheet
        open={isEditingProvider}
        onOpenChange={setIsEditingProvider}
        title="Edit Provider"
        description="Update the AI service provider configuration"
        size="lg"
      >
        {editingProvider && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-450 text-gray-700">Name</label>
                <p className="text-sm text-gray-900">{editingProvider.name}</p>
              </div>
              <div>
                <label className="text-sm font-450 text-gray-700">Type</label>
                <p className="text-sm text-gray-900">{editingProvider.type}</p>
              </div>
            </div>
            {/* Edit form content will go here */}
          </div>
        )}
      </ViewEditSheet>
    </div>
  )
}

