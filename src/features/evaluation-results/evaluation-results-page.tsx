import { useState, useEffect } from 'react'
import { 
  EvaluationResultsTable, 
  EvaluationResultsFilters, 
  EvaluationResultsPagination,
  EvaluationResultsConversationView
} from './components'
import { loadEvaluationData, filterRecords, paginateRecords } from './lib'
import { DEFAULT_PAGE_SIZE } from './constants'
import type { EvaluationRecord, FilterState, PaginationState } from './types'

type ViewType = 'table' | 'conversation'

export function EvaluationResultsPage() {
  const [allData, setAllData] = useState<EvaluationRecord[]>([])
  const [filteredData, setFilteredData] = useState<EvaluationRecord[]>([])
  const [displayData, setDisplayData] = useState<EvaluationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<ViewType>('table')
  const [conversationDisplayCount, setConversationDisplayCount] = useState(25)

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
    if (currentView === 'table') {
      const { data } = paginateRecords(filteredData, pagination.page, pagination.pageSize)
      setDisplayData(data)
    } else {
      // For conversation view, show the first N items based on conversationDisplayCount
      const conversationData = filteredData.slice(0, conversationDisplayCount)
      setDisplayData(conversationData)
    }
  }, [filteredData, pagination.page, pagination.pageSize, currentView, conversationDisplayCount])

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    // Reset conversation display count when filters change
    setConversationDisplayCount(25)
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

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    // Reset conversation display count when switching views
    if (view === 'conversation') {
      setConversationDisplayCount(25)
    }
  }

  const handleLoadMore = () => {
    setConversationDisplayCount(prev => prev + 25)
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
        currentView={currentView}
        onViewChange={handleViewChange}
      />

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Table/Conversation View */}
        <div className={`${currentView === 'conversation' ? 'w-[480px]' : 'flex-1'} ${currentView === 'table' ? 'overflow-auto' : 'flex flex-col'}`}>
          {currentView === 'table' ? (
            <EvaluationResultsTable
              data={displayData}
              selectedRows={selectedRows}
              onRowSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
            />
          ) : (
            <EvaluationResultsConversationView
              data={displayData}
              totalCount={filteredData.length}
              hasMore={displayData.length < filteredData.length}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
        
        {/* Right White Space for Conversation View */}
        {currentView === 'conversation' && (
          <div className="flex-1 bg-white border-l border-gray-200">
            {/* This will be the detailed view area later */}
          </div>
        )}
      </div>

      {/* Pagination - Only show for table view */}
      {currentView === 'table' && (
        <EvaluationResultsPagination
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      )}
    </div>
  )
}