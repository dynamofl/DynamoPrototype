import { useState, useMemo, useEffect } from 'react'
import { GuardrailsHeader, GuardrailsStats, GuardrailCreateDialog, GuardrailViewSheet, GuardrailEditSheet } from './components'
import { GuardrailsTableDirect } from './components/guardrails-table-direct'
import type { Guardrail } from './types'
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
  const [viewingGuardrail, setViewingGuardrail] = useState<Guardrail | null>(null)
  const [editingGuardrail, setEditingGuardrail] = useState<Guardrail | null>(null)
  const [guardrails, setGuardrails] = useState<Guardrail[]>([])
  
  // Selection state
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Create custom storage instance
  const customStorage = useMemo(() => new GuardrailsTableStorage(), [])

  // Load guardrails on mount
  useEffect(() => {
    const loadGuardrails = async () => {
      const data = await customStorage.load()
      setGuardrails(data as Guardrail[])
    }
    loadGuardrails()
  }, [])

  // Handle guardrail edit
  const handleEdit = (guardrail: Guardrail | TableRow) => {
    setEditingGuardrail(guardrail as Guardrail)
    setIsEditingGuardrail(true)
  }

  // Handle guardrail delete
  const handleDelete = async (guardrail: Guardrail) => {
    if (confirm(`Are you sure you want to delete "${guardrail.name}"?`)) {
      await customStorage.delete(guardrail.id)
      const updatedData = await customStorage.load()
      setGuardrails(updatedData as Guardrail[])
    }
  }

  // Handle guardrail creation
  const handleGuardrailCreated = async (guardrail: TableRow) => {
    await customStorage.add(guardrail)
    const updatedData = await customStorage.load()
    setGuardrails(updatedData as Guardrail[])
    console.log('Guardrail created:', guardrail.name)
  }

  // Handle guardrail update
  const handleGuardrailUpdated = async (guardrail: TableRow) => {
    await customStorage.update(guardrail.id, guardrail)
    const updatedData = await customStorage.load()
    setGuardrails(updatedData as Guardrail[])
    console.log('Guardrail updated:', guardrail.name)
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
    setSelectedRows(selected ? guardrails.map(guardrail => guardrail.id) : [])
  }

  return (
    <div className="">
      <main className="mx-auto">
        <div className="space-y-3 py-3">
          {/* Page Header */}
          <GuardrailsHeader onAddGuardrail={() => setIsAddingGuardrail(true)} />

          {/* Stats Cards */}
          <div className="px-4">
            <GuardrailsStats />
          </div>

          {/* Table */}
          <div className="">
            <GuardrailsTableDirect
              data={guardrails}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* View Guardrail Sheet */}
          <GuardrailViewSheet
            open={isViewingGuardrail}
            onOpenChange={setIsViewingGuardrail}
            guardrail={viewingGuardrail}
            onEdit={handleEdit}
          />

          {/* Edit Guardrail Sheet */}
          <GuardrailEditSheet
            open={isEditingGuardrail}
            onOpenChange={setIsEditingGuardrail}
            guardrail={editingGuardrail}
            onGuardrailUpdated={handleGuardrailUpdated}
          />

          {/* Create Guardrail Dialog */}
          <GuardrailCreateDialog
            open={isAddingGuardrail}
            onOpenChange={setIsAddingGuardrail}
            onGuardrailCreated={handleGuardrailCreated}
          />
        </div>
      </main>
    </div>
  )
}
