import { useState, useEffect } from 'react'
import {
  EvaluationDataTable,
  EvaluationDataFilters,
  EvaluationDataPagination,
  EvaluationDataConversationView,
  EvaluationDataSideSheet
} from './data-view-components'
import { EvaluationDataDetail } from './evaluation-data-detail'
import { EvaluationConversationView } from './evaluation-conversation-view'
import { filterJailbreakRecords, paginateJailbreakRecords } from '../../lib/evaluation-data-utils'
import { DEFAULT_PAGE_SIZE } from '../../constants/evaluation-data-constants'
import type { JailbreakEvaluationResult } from '../../types/jailbreak-evaluation'
import type { JailbreakFilterState, JailbreakPaginationState } from '../../types/evaluation-data-types'

type ViewType = 'table' | 'conversation'

interface EvaluationDataViewProps {
  results: JailbreakEvaluationResult[]
  hasGuardrails?: boolean
}

export function EvaluationDataView({ results, hasGuardrails = true }: EvaluationDataViewProps) {
  const [allData, setAllData] = useState<JailbreakEvaluationResult[]>([])
  const [filteredData, setFilteredData] = useState<JailbreakEvaluationResult[]>([])
  const [displayData, setDisplayData] = useState<JailbreakEvaluationResult[]>([])
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [currentView, setCurrentView] = useState<ViewType>('table')
  const [conversationDisplayCount, setConversationDisplayCount] = useState(25)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [transitionState, setTransitionState] = useState<'idle' | 'exiting' | 'entering'>('idle')
  const [sideSheetOpen, setSideSheetOpen] = useState(false)
  const [sideSheetRecordId, setSideSheetRecordId] = useState<string | null>(null)

  const [filters, setFilters] = useState<JailbreakFilterState>({
    attackOutcome: [],
    attackType: [],
    guardrailJudgment: [],
    modelJudgment: [],
    behaviorType: [],
    topic: [],
    searchTerm: ''
  })

  const [pagination, setPagination] = useState<JailbreakPaginationState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0
  })

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
    const filtered = filterJailbreakRecords(allData, filters)
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
      const { data } = paginateJailbreakRecords(filteredData, pagination.page, pagination.pageSize)
      setDisplayData(data)
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

  const handleFiltersChange = (newFilters: JailbreakFilterState) => {
    setFilters(newFilters)
    // Reset conversation display count when filters change
    setConversationDisplayCount(25)
  }

  const handlePaginationChange = (newPagination: JailbreakPaginationState) => {
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

    // Start exit animation
    setTransitionState('exiting')

    // After exit animation, switch view and start entrance
    setTimeout(() => {
      setCurrentView(view)
      // Reset conversation display count when switching to conversation view
      if (view === 'conversation') {
        setConversationDisplayCount(25)
      }
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

  const handleRowClick = (record: JailbreakEvaluationResult) => {
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

  return (
    <div className="flex flex-col h-full py-2">
      {/* Filters */}
      <EvaluationDataFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        currentView={currentView}
        onViewChange={handleViewChange}
        hasGuardrails={hasGuardrails}
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
              <EvaluationDataTable
                data={displayData}
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
                      <EvaluationConversationView record={selectedRecord} />
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
        onOpenChange={setSideSheetOpen}
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
