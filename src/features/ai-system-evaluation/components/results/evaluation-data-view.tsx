import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  EvaluationDataPagination,
  EvaluationDataConversationView,
  EvaluationDataSideSheet
} from './data-view-components'
import { GenericEvaluationTable } from './data-view-components/generic-evaluation-table'
import { GenericEvaluationFilters } from './data-view-components/generic-evaluation-filters'
import { EvaluationConversationView } from './evaluation-conversation-view'
import { DEFAULT_PAGE_SIZE } from '../../constants/evaluation-data-constants'
import type { BaseEvaluationResult } from '../../types/base-evaluation'
import type { EvaluationStrategy } from '../../strategies/base-strategy'

type ViewType = 'table' | 'conversation'

interface PaginationState {
  page: number
  pageSize: number
  total: number
}

interface EvaluationDataViewProps {
  results: BaseEvaluationResult[]
  strategy: EvaluationStrategy
  testType: string
  aiSystemName?: string
  hasGuardrails?: boolean
  systemName?: string
  evaluationId?: string
}

export function EvaluationDataView({
  results,
  strategy,
  testType,
  aiSystemName,
  hasGuardrails = true,
  systemName,
  evaluationId
}: EvaluationDataViewProps) {
  const [searchParams, setSearchParams] = useSearchParams()

  const [allData, setAllData] = useState<BaseEvaluationResult[]>([])
  const [filteredData, setFilteredData] = useState<BaseEvaluationResult[]>([])
  const [displayData, setDisplayData] = useState<BaseEvaluationResult[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  // Initialize state from URL params
  const modeFromUrl = searchParams.get('mode') as ViewType | null
  const itemFromUrl = searchParams.get('item')

  const [currentView, setCurrentView] = useState<ViewType>(modeFromUrl || 'table')
  const [conversationDisplayCount, setConversationDisplayCount] = useState(25)

  // In conversation view, initialize selectedConversationId from URL
  // In table view, it will be set by the auto-select logic
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    modeFromUrl === 'conversation' ? itemFromUrl : null
  )

  const [transitionState, setTransitionState] = useState<'idle' | 'exiting' | 'entering'>('idle')

  // In table view with item param, initialize side sheet as open
  const [sideSheetOpen, setSideSheetOpen] = useState(modeFromUrl === 'table' && !!itemFromUrl)
  const [sideSheetRecordId, setSideSheetRecordId] = useState<string | null>(
    modeFromUrl === 'table' ? itemFromUrl : null
  )

  // Generic filter state (works for all test types)
  const [filters, setFilters] = useState<Record<string, any>>({
    searchTerm: ''
  })

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

  console.log(`📊 EvaluationDataView: testType="${testType}", strategy="${strategy.displayName}", results=${results.length}`)

  // Update URL when view mode or selected item changes
  useEffect(() => {
    if (!systemName || !evaluationId) return

    const newParams = new URLSearchParams(searchParams)

    // Handle mode parameter
    if (currentView !== 'table') {
      newParams.set('mode', currentView)
    } else {
      newParams.delete('mode')
    }

    // Handle item parameter based on view mode
    if (currentView === 'conversation') {
      // Conversation view: item is mandatory (always a selected conversation)
      if (selectedConversationId) {
        newParams.set('item', selectedConversationId)
      } else {
        newParams.delete('item')
      }
    } else if (currentView === 'table') {
      // Table view: item only exists when side sheet is open
      if (sideSheetOpen && sideSheetRecordId) {
        newParams.set('item', sideSheetRecordId)
      } else {
        newParams.delete('item')
      }
    }

    // Only update if params changed
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true })
    }
  }, [currentView, selectedConversationId, sideSheetOpen, sideSheetRecordId, systemName, evaluationId, searchParams, setSearchParams])

  // Sync state with URL params when they change externally (e.g., browser back/forward)
  useEffect(() => {
    const mode = searchParams.get('mode') as ViewType | null
    const item = searchParams.get('item')

    // Determine the target view (default to table if no mode param)
    const targetView = mode === 'conversation' ? 'conversation' : 'table'

    // Only sync if view actually needs to change
    if (targetView !== currentView) {
      setCurrentView(targetView)
      // When changing views, clear conflicting state
      if (targetView === 'table') {
        setSelectedConversationId(null)
        setSideSheetOpen(false)
        setSideSheetRecordId(null)
      } else {
        setSideSheetOpen(false)
        setSideSheetRecordId(null)
      }
      return
    }

    // Sync item based on current view
    if (currentView === 'conversation') {
      // In conversation view, sync selected conversation from URL
      if (item && item !== selectedConversationId) {
        setSelectedConversationId(item)
      }
    } else if (currentView === 'table') {
      // In table view, sync side sheet from URL
      if (item && item !== sideSheetRecordId) {
        setSideSheetRecordId(item)
        setSideSheetOpen(true)
      } else if (!item && sideSheetOpen) {
        // If no item in URL but side sheet is open, close it
        setSideSheetOpen(false)
        setSideSheetRecordId(null)
      }
    }
  }, [searchParams])

  // Load initial data
  useEffect(() => {
    // Add unique IDs to results for tracking
    const dataWithIds = results.map((result, index) => ({
      ...result,
      id: `${result.policyId}-${index}`
    }))
    setAllData(dataWithIds as any)
    setFilteredData(dataWithIds as any)
    setPagination(prev => ({ ...prev, total: dataWithIds.length }))
  }, [results])

  // Apply filters when data or filters change
  useEffect(() => {
    // Apply filters using strategy
    const strategyFilters = strategy.getFilters(hasGuardrails)

    const filtered = allData.filter(record => {
      // Search term filter
      if (filters.searchTerm && filters.searchTerm.length > 0) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesSearch =
          record.base_prompt?.toLowerCase().includes(searchLower) ||
          record.policy_name?.toLowerCase().includes(searchLower) ||
          record.topic?.toLowerCase().includes(searchLower)

        if (!matchesSearch) return false
      }

      // Apply strategy-defined filters
      return strategyFilters.every(filterConfig => {
        const filterValue = filters[filterConfig.key]
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
          return true // No filter applied
        }
        return filterConfig.filterFn(record, filterValue)
      })
    })

    setFilteredData(filtered)
    setPagination(prev => ({
      ...prev,
      total: filtered.length,
      page: 1 // Reset to first page when filters change
    }))
  }, [allData, filters, strategy, hasGuardrails])

  // Apply pagination when filtered data or pagination settings change
  useEffect(() => {
    if (currentView === 'table') {
      // Pagination for table view
      const start = (pagination.page - 1) * pagination.pageSize
      const end = start + pagination.pageSize
      const paginatedData = filteredData.slice(start, end)
      setDisplayData(paginatedData)
    } else {
      // For conversation view, show the first N items based on conversationDisplayCount
      const conversationData = filteredData.slice(0, conversationDisplayCount)
      setDisplayData(conversationData)

      // Auto-select first conversation if none selected or current selection not in data
      if (conversationData.length > 0) {
        const currentSelectionExists = selectedConversationId &&
          conversationData.some(record => (record as any).id === selectedConversationId)

        if (!currentSelectionExists) {
          setSelectedConversationId((conversationData[0] as any).id)
        }
      } else {
        setSelectedConversationId(null)
      }
    }
  }, [filteredData, pagination.page, pagination.pageSize, currentView, conversationDisplayCount, selectedConversationId])

  const handleFiltersChange = (newFilters: Record<string, any>) => {
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
      setSelectedRows(displayData.map(record => (record as any).id))
    } else {
      setSelectedRows([])
    }
  }

  const handleViewChange = (view: ViewType) => {
    if (view === currentView || transitionState !== 'idle') return

    // Immediately update view and clear related state
    setCurrentView(view)

    if (view === 'conversation') {
      // Clear side sheet state when switching to conversation view
      setSideSheetOpen(false)
      setSideSheetRecordId(null)
      setConversationDisplayCount(25)
    } else if (view === 'table') {
      // Clear conversation selection when switching to table view
      setSelectedConversationId(null)
      setSideSheetOpen(false)
      setSideSheetRecordId(null)
    }

    // Start exit animation
    setTransitionState('exiting')

    // After exit animation, start entrance
    setTimeout(() => {
      setTransitionState('entering')

      // Complete entrance animation
      setTimeout(() => {
        setTransitionState('idle')
      }, 150) // Duration of entrance animation
    }, 150) // Duration of exit animation
  }

  const handleLoadMore = () => {
    setConversationDisplayCount(prev => prev + 25)
  }

  const handleConversationSelect = (id: string) => {
    setSelectedConversationId(id)
  }

  const handleRowClick = (record: BaseEvaluationResult) => {
    setSideSheetRecordId((record as any).id)
    setSideSheetOpen(true)
  }

  const handleSideSheetNavigateNext = () => {
    if (!sideSheetRecordId) return
    const currentIndex = allData.findIndex(r => (r as any).id === sideSheetRecordId)
    if (currentIndex < allData.length - 1) {
      setSideSheetRecordId((allData[currentIndex + 1] as any).id)
    }
  }

  const handleSideSheetNavigatePrevious = () => {
    if (!sideSheetRecordId) return
    const currentIndex = allData.findIndex(r => (r as any).id === sideSheetRecordId)
    if (currentIndex > 0) {
      setSideSheetRecordId((allData[currentIndex - 1] as any).id)
    }
  }

  const handleSideSheetExpand = () => {
    if (!sideSheetRecordId) return
    // Close side sheet
    setSideSheetOpen(false)
    // Switch to conversation view
    handleViewChange('conversation')
    // Set the selected conversation
    setSelectedConversationId(sideSheetRecordId)
  }

  const handleSideSheetClose = (open: boolean) => {
    setSideSheetOpen(open)
    // Clear the record ID when closing
    if (!open) {
      setSideSheetRecordId(null)
    }
  }

  return (
    <div className="flex flex-col h-full py-2">
      {/* Filters */}
      <GenericEvaluationFilters
        strategy={strategy}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        currentView={currentView}
        onViewChange={handleViewChange}
        hasGuardrails={hasGuardrails}
        data={allData}
      />

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Table/Conversation View */}
        <div className={`${currentView === 'conversation' ? 'max-w-[400px]' : 'flex-1'} ${currentView === 'table' ? 'overflow-auto' : 'flex flex-col overflow-hidden'}`}>
          <div
            className={`h-full transition-all  ${
              transitionState === 'exiting'
                ? currentView === 'table'
                  ? 'opacity-0 transform -translate-x-4' // Table exit: slide left + fade
                  : 'opacity-0 transform translate-x-4' // Conversation exit: slide right + fade
                : transitionState === 'entering'
                ? currentView === 'table'
                  ? 'opacity-0 transform -translate-x-4' // Table entrance: from right + fade
                  : 'opacity-0 transform translate-x-4' // Conversation entrance: from left + fade
                : 'opacity-100 transform translate-x-0' // Normal state: visible + centered
            }`}
          >
            {currentView === 'table' ? (
              <GenericEvaluationTable
                data={displayData}
                strategy={strategy}
                selectedRows={selectedRows}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
                onRowClick={handleRowClick}
                hasGuardrails={hasGuardrails}
              />
            ) : (
              <EvaluationDataConversationView
                data={displayData}
                totalCount={filteredData.length}
                hasMore={displayData.length < filteredData.length}
                onLoadMore={handleLoadMore}
                selectedConversationId={selectedConversationId}
                onConversationSelect={handleConversationSelect}
              />
            )}
          </div>
        </div>

        {/* Right Detail Area for Conversation View */}
        {currentView === 'conversation' && (
          <div className="flex-1 overflow-hidden">
            <div className="transition-all duration-300 ease-in-out h-full">
              {selectedConversationId && displayData.length > 0 && (
                (() => {
                  const selectedRecord = displayData.find(record => (record as any).id === selectedConversationId)
                  return selectedRecord ? (
                    <div className="animate-in fade-in-0 slide-in-from-right-2 duration-300 h-full">
                      <EvaluationConversationView record={selectedRecord} aiSystemName={aiSystemName} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 animate-in fade-in-0 duration-300">
                      <div className="text-lg text-gray-500">No conversation selected</div>
                    </div>
                  )
                })()
              )}
              {(!selectedConversationId || displayData.length === 0) && (
                <div className="flex items-center justify-center h-64 animate-in fade-in-0 duration-300">
                  <div className="text-lg text-gray-500">Select a conversation to view details</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pagination - Only show for table view and when there are more than 20 items */}
      {currentView === 'table' && pagination.total > 20 && (
        <EvaluationDataPagination
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      )}

      {/* Side Sheet */}
      <EvaluationDataSideSheet
        open={sideSheetOpen}
        onOpenChange={handleSideSheetClose}
        record={sideSheetRecordId ? allData.find(r => (r as any).id === sideSheetRecordId) || null : null}
        allRecords={allData}
        onNavigateNext={handleSideSheetNavigateNext}
        onNavigatePrevious={handleSideSheetNavigatePrevious}
        onExpand={handleSideSheetExpand}
        hasGuardrails={hasGuardrails}
      />
    </div>
  )
}
