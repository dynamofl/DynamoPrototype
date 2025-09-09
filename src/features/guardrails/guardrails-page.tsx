import { useState, useMemo } from 'react'
import { TablePattern } from '@/components/patterns'
import { GuardrailsStats, GuardrailCreateDialog, GuardrailViewSheet, GuardrailEditSheet } from './components'
import {
  guardrailsStorageConfig,
  guardrailsColumns,
  guardrailsPaginationConfig
} from './lib/guardrails-config'
import type { TableRow } from '@/types/table'
import type { TableStorage } from '@/lib/storage/types'

// Custom storage for guardrails using localStorage
class GuardrailsTableStorage implements TableStorage {
  private storageKey = 'guardrails'

  async load(): Promise<TableRow[]> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load guardrails:', error)
      return []
    }
  }

  async save(data: TableRow[]): Promise<boolean> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to save guardrails:', error)
      return false
    }
  }

  async add(row: Omit<TableRow, 'id'>): Promise<TableRow> {
    const data = await this.load()
    const newRow: TableRow = {
      ...row,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    data.unshift(newRow)
    await this.save(data)
    return newRow
  }

  async update(id: string, updates: Partial<TableRow>): Promise<boolean> {
    const data = await this.load()
    const index = data.findIndex(item => item.id === id)
    if (index !== -1) {
      data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString().split('T')[0] }
      return await this.save(data)
    }
    return false
  }

  async delete(id: string): Promise<boolean> {
    const data = await this.load()
    const filtered = data.filter(item => item.id !== id)
    return await this.save(filtered)
  }

  async clear(): Promise<boolean> {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('Failed to clear guardrails:', error)
      return false
    }
  }

  validate(data: TableRow[]): boolean {
    // Basic validation - can be expanded
    return Array.isArray(data)
  }
}

export function Guardrails() {
  const [isAddingGuardrail, setIsAddingGuardrail] = useState(false)
  const [isViewingGuardrail, setIsViewingGuardrail] = useState(false)
  const [isEditingGuardrail, setIsEditingGuardrail] = useState(false)
  const [viewingGuardrail, setViewingGuardrail] = useState<TableRow | null>(null)
  const [editingGuardrail, setEditingGuardrail] = useState<TableRow | null>(null)

  // Create custom storage instance
  const customStorage = useMemo(() => new GuardrailsTableStorage(), [])

  // Handle cell actions
  const handleCellAction = (action: string, row: TableRow, _index: number) => {
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

  // Handle row expand
  const handleRowExpand = (rowId: string, isExpanded: boolean) => {
    console.log('Row expanded:', rowId, isExpanded)
  }

  // Handle guardrail creation
  const handleGuardrailCreated = (guardrail: TableRow) => {
    customStorage.add(guardrail)
    console.log('Guardrail created:', guardrail.name)
  }

  // Handle guardrail editing
  const handleGuardrailEdit = (guardrail: TableRow) => {
    setEditingGuardrail(guardrail)
    setIsEditingGuardrail(true)
  }

  // Handle guardrail update
  const handleGuardrailUpdated = (guardrail: TableRow) => {
    customStorage.update(guardrail.id, guardrail)
    console.log('Guardrail updated:', guardrail.name)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto">
        <div className="space-y-4">
          {/* Page Header */}
          <div className="px-6">
            <div className="flex items-center justify-between my-4">
              <h1 className="text-lg font-450 tracking-tight">Guardrails</h1>
              <GuardrailCreateDialog
                open={isAddingGuardrail}
                onOpenChange={setIsAddingGuardrail}
                onGuardrailCreated={handleGuardrailCreated}
              />
            </div>

            {/* Stats Cards */}
            <GuardrailsStats />
          </div>

          {/* Table */}
          <div className="px-6">
            <TablePattern
              mode="view"
              columns={guardrailsColumns}
              storageConfig={guardrailsStorageConfig}
              customStorage={customStorage}
              pagination={guardrailsPaginationConfig}
              onDataChange={handleDataChange}
              onCellAction={handleCellAction}
              onRowExpand={handleRowExpand}
              className="border rounded-lg"
              emptyMessage="No guardrails configured. Create your first guardrail to get started."
            />
          </div>

          {/* View Guardrail Sheet */}
          <GuardrailViewSheet
            open={isViewingGuardrail}
            onOpenChange={setIsViewingGuardrail}
            guardrail={viewingGuardrail}
            onEdit={handleGuardrailEdit}
          />

          {/* Edit Guardrail Sheet */}
          <GuardrailEditSheet
            open={isEditingGuardrail}
            onOpenChange={setIsEditingGuardrail}
            guardrail={editingGuardrail}
            onGuardrailUpdated={handleGuardrailUpdated}
          />
        </div>
      </main>
    </div>
  )
}
