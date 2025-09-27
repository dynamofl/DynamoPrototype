import { useState, useEffect } from 'react'
import { 
  EvaluationResultsTable, 
  EvaluationResultsFilters, 
  EvaluationResultsPagination 
} from './components'
import { loadEvaluationData, filterRecords, paginateRecords } from './lib'
import { DEFAULT_PAGE_SIZE } from './constants'
import type { EvaluationRecord, FilterState, PaginationState } from './types'

export function EvaluationResultsPage() {
  const [allData, setAllData] = useState<EvaluationRecord[]>([])
  const [filteredData, setFilteredData] = useState<EvaluationRecord[]>([])
  const [displayData, setDisplayData] = useState<EvaluationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const [filters, setFilters] = useState<FilterState>({
    attackOutcome: [],
    attackType: [],
    guardrailJudgment: [],
    aiSystemJudgment: [],
    severity: [],
    searchTerm: ''
  })

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await loadEvaluationData()
        setAllData(data)
        setFilteredData(data)
        setPagination(prev => ({ ...prev, total: data.length }))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters when data or filters change
  useEffect(() => {
    const filtered = filterRecords(allData, filters)
    setFilteredData(filtered)
    setPagination(prev => ({ 
      ...prev, 
      total: filtered.length,
      page: 1 // Reset to first page when filters change
    }))
  }, [allData, filters])

  // Apply pagination when filtered data or pagination settings change
  useEffect(() => {
    const { data } = paginateRecords(filteredData, pagination.page, pagination.pageSize)
    setDisplayData(data)
  }, [filteredData, pagination.page, pagination.pageSize])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handlePaginationChange = (newPagination: PaginationState) => {
    setPagination(newPagination)
  }

  const handleRowSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedRows(prev => [...prev, id])
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(displayData.map(record => record.id))
    } else {
      setSelectedRows([])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading evaluation results...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
   

      {/* Filters */}
      <EvaluationResultsFilters 
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <EvaluationResultsTable
          data={displayData}
          selectedRows={selectedRows}
          onRowSelect={handleRowSelect}
          onSelectAll={handleSelectAll}
        />
      </div>

      {/* Pagination */}
      <EvaluationResultsPagination
        pagination={pagination}
        onPaginationChange={handlePaginationChange}
      />
    </div>
  )
}