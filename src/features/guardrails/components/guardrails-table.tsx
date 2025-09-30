/**
 * Guardrails table component using the new table pattern
 */

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TablePattern } from '@/components/patterns'
import { CreateDialog } from '@/components/patterns'
import { ViewEditSheet } from '@/components/patterns'
import { 
  guardrailsStorageConfig,
  guardrailsColumns,
  guardrailsPaginationConfig,
  createDefaultGuardrail,
  validateGuardrail
} from '../lib/guardrails-config'
import type { TableRow } from '@/types/table'

interface GuardrailsTableProps {
  className?: string
}

export function GuardrailsTable({ className = '' }: GuardrailsTableProps) {
  const [isAddingGuardrail, setIsAddingGuardrail] = useState(false)
  const [isViewingGuardrail, setIsViewingGuardrail] = useState(false)
  const [isEditingGuardrail, setIsEditingGuardrail] = useState(false)
  const [viewingGuardrail, setViewingGuardrail] = useState<TableRow | null>(null)
  const [editingGuardrail, setEditingGuardrail] = useState<TableRow | null>(null)

  // Handle cell actions
  const handleCellAction = (action: string, row: TableRow, index: number) => {
    switch (action) {
      case 'view':
        setViewingGuardrail(row)
        setIsViewingGuardrail(true)
        break
      case 'edit':
        setEditingGuardrail(row)
        setIsEditingGuardrail(true)
        break
      case 'copy':
        // Handle copy action
        console.log('Copy guardrail:', row.id)
        break
      case 'delete':
        // Handle delete action
        console.log('Delete guardrail:', row.id)
        break
      default:
        console.log('Unknown action:', action)
    }
  }

  // Handle data changes
  const handleDataChange = (data: TableRow[]) => {
    console.log('Data changed:', data.length, 'guardrails')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Guardrails</h2>
          <p className="text-[13px] text-gray-600">
            Define and manage content safety and compliance rules
          </p>
        </div>
        <CreateDialog
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Guardrail
            </Button>
          }
          title="Create New Guardrail"
          description="Define a new guardrail to protect against harmful or inappropriate content"
          open={isAddingGuardrail}
          onOpenChange={setIsAddingGuardrail}
          maxWidth="lg"
        >
          {/* Create guardrail form content will go here */}
          <div className="p-4">
            <p>Create guardrail form will be implemented here</p>
          </div>
        </CreateDialog>
      </div>

      {/* Table */}
      <TablePattern
        mode="edit"
        columns={guardrailsColumns}
        storageConfig={guardrailsStorageConfig}
        pagination={guardrailsPaginationConfig}
        onDataChange={handleDataChange}
        onCellAction={handleCellAction}
        className="border rounded-lg"
        emptyMessage="No guardrails configured. Create your first guardrail to get started."
      />

      {/* View Guardrail Sheet */}
      <ViewEditSheet
        open={isViewingGuardrail}
        onOpenChange={setIsViewingGuardrail}
        title={viewingGuardrail?.name || "Guardrail Details"}
        description="View detailed information about this guardrail"
        size="lg"
      >
        {viewingGuardrail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-450 text-gray-700">Name</label>
                <p className="text-[13px] text-gray-900">{viewingGuardrail.name}</p>
              </div>
              <div>
                <label className="text-[13px] font-450 text-gray-700">Category</label>
                <p className="text-[13px] text-gray-900">{viewingGuardrail.category}</p>
              </div>
              <div>
                <label className="text-[13px] font-450 text-gray-700">Status</label>
                <p className="text-[13px] text-gray-900">{viewingGuardrail.status}</p>
              </div>
              <div>
                <label className="text-[13px] font-450 text-gray-700">Created</label>
                <p className="text-[13px] text-gray-900">{viewingGuardrail.createdAt}</p>
              </div>
            </div>
            <div>
              <label className="text-[13px] font-450 text-gray-700">Description</label>
              <p className="text-[13px] text-gray-900">{viewingGuardrail.description}</p>
            </div>
            <div>
              <label className="text-[13px] font-450 text-gray-700">Content</label>
              <p className="text-[13px] text-gray-900 whitespace-pre-wrap">{viewingGuardrail.content}</p>
            </div>
          </div>
        )}
      </ViewEditSheet>

      {/* Edit Guardrail Sheet */}
      <ViewEditSheet
        open={isEditingGuardrail}
        onOpenChange={setIsEditingGuardrail}
        title="Edit Guardrail"
        description="Update the guardrail configuration"
        size="lg"
      >
        {editingGuardrail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[13px] font-450 text-gray-700">Name</label>
                <p className="text-[13px] text-gray-900">{editingGuardrail.name}</p>
              </div>
              <div>
                <label className="text-[13px] font-450 text-gray-700">Category</label>
                <p className="text-[13px] text-gray-900">{editingGuardrail.category}</p>
              </div>
            </div>
            {/* Edit form content will go here */}
          </div>
        )}
      </ViewEditSheet>
    </div>
  )
}

