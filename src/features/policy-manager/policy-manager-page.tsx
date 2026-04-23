import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PolicyManagerHeader, PolicyManagerStats, PolicyViewSheet } from './components'
import { PolicyManagerTable } from './components/policy-manager-table'
import type { Policy } from './types'
import type { TableRow } from '@/types/table'
import type { TableStorage } from '@/lib/storage/types'

// Custom storage for policies using localStorage
class PolicyTableStorage implements TableStorage {
  private storageKey = 'policies'

  async load(): Promise<TableRow[]> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to load policies:', error)
      return []
    }
  }

  async save(data: TableRow[]): Promise<boolean> {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to save policies:', error)
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
      console.error('Failed to clear policies:', error)
      return false
    }
  }

  validate(data: TableRow[]): boolean {
    return Array.isArray(data)
  }
}

export function PolicyManager() {
  const navigate = useNavigate()
  const [isViewingPolicy, setIsViewingPolicy] = useState(false)
  const [viewingPolicy, setViewingPolicy] = useState<Policy | null>(null)
  const [policies, setPolicies] = useState<Policy[]>([])

  // Selection state
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Create custom storage instance
  const customStorage = useMemo(() => new PolicyTableStorage(), [])

  // Load policies on mount
  useEffect(() => {
    const loadPolicies = async () => {
      const data = await customStorage.load()
      setPolicies(data as Policy[])
    }
    loadPolicies()
  }, [])

  // Handle policy edit — navigate to full-page editor
  const handleEdit = (policy: Policy | TableRow) => {
    navigate(`/policy-manager/${policy.id}/edit`)
  }

  // Handle policy delete
  const handleDelete = async (policy: Policy) => {
    if (confirm(`Are you sure you want to delete "${policy.name}"?`)) {
      await customStorage.delete(policy.id)
      const updatedData = await customStorage.load()
      setPolicies(updatedData as Policy[])
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
    setSelectedRows(selected ? policies.map(policy => policy.id) : [])
  }

  return (
    <div className="">
      <main className="mx-auto">
        <div className="space-y-3 py-3">
          {/* Page Header */}
          <PolicyManagerHeader onAddPolicy={() => navigate('/policy-manager/new')} />

          {/* Stats Cards */}
          <div className="px-4">
            <PolicyManagerStats />
          </div>

          {/* Table */}
          <div className="">
            <PolicyManagerTable
              data={policies}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>

          {/* View Policy Sheet */}
          <PolicyViewSheet
            open={isViewingPolicy}
            onOpenChange={setIsViewingPolicy}
            policy={viewingPolicy}
            onEdit={handleEdit}
          />
        </div>
      </main>
    </div>
  )
}
