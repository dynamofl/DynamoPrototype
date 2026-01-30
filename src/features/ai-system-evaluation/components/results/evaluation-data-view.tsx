import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  EvaluationDataPagination,
  EvaluationDataConversationView,
  EvaluationDataSideSheet,
} from "./data-view-components";
import { GenericEvaluationTable } from "./data-view-components/generic-evaluation-table";
import { GenericEvaluationFilters } from "./data-view-components/generic-evaluation-filters";
import { GenericConversationView } from "./conversation-view-components/generic-conversation-view";
import { DEFAULT_PAGE_SIZE } from "../../constants/evaluation-data-constants";
import type { BaseEvaluationResult } from "../../types/base-evaluation";
import type { EvaluationStrategy } from "../../strategies/base-strategy";
import { usePromptSubscription } from "../../hooks/usePromptSubscription";

type ViewType = "table" | "conversation";

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

interface EvaluationDataViewProps {
  results: BaseEvaluationResult[];
  strategy: EvaluationStrategy;
  testType: string;
  aiSystemName?: string;
  hasGuardrails?: boolean;
  systemName?: string;
  evaluationId?: string;
  evaluationStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  isReviewModeEnabled?: boolean;
}

export function EvaluationDataView({
  results,
  strategy,
  testType,
  aiSystemName,
  hasGuardrails = true,
  systemName,
  evaluationId,
  evaluationStatus,
  isReviewModeEnabled = false,
}: EvaluationDataViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allData, setAllData] = useState<BaseEvaluationResult[]>([]);
  const [filteredData, setFilteredData] = useState<BaseEvaluationResult[]>([]);
  const [displayData, setDisplayData] = useState<BaseEvaluationResult[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Initialize state from URL params
  const itemFromUrl = searchParams.get("item");
  const modeFromUrl = searchParams.get("mode") as ViewType | null;

  // Conversation view state (only when Review Mode is disabled)
  const [currentView, setCurrentView] = useState<ViewType>(
    !isReviewModeEnabled && modeFromUrl === "conversation" ? "conversation" : "table"
  );
  const [conversationDisplayCount, setConversationDisplayCount] = useState(25);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Side sheet state for table view
  const [sideSheetOpen, setSideSheetOpen] = useState(!!itemFromUrl);
  const [sideSheetRecordId, setSideSheetRecordId] = useState<string | null>(itemFromUrl);

  // Generic filter state (works for all test types)
  const [filters, setFilters] = useState<Record<string, any>>({
    searchTerm: "",
  });

  // Annotation mode state (page-level)
  // Disable annotation mode when evaluation is running or pending
  const canEnableAnnotation = evaluationStatus === 'completed' || evaluationStatus === 'failed' || !evaluationStatus;
  const [isAnnotationModeEnabled, setIsAnnotationModeEnabled] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });

  // Use real-time subscription when evaluation is running or cancelled (to keep partial data visible)
  const isRunning = evaluationStatus === 'running' || evaluationStatus === 'pending';
  const isCancelled = evaluationStatus === 'cancelled';
  const { prompts: subscriptionPrompts } = usePromptSubscription({
    evaluationId: evaluationId || '',
    testType: testType as 'jailbreak' | 'compliance' | 'hallucination',
    enabled: (isRunning || isCancelled) && !!evaluationId
  });

  // Update URL when view mode or side sheet item changes
  useEffect(() => {
    if (!systemName || !evaluationId) return;

    const newParams = new URLSearchParams(searchParams);

    // Handle mode parameter for conversation view (only when Review Mode is disabled)
    if (!isReviewModeEnabled) {
      if (currentView === "conversation") {
        newParams.set("mode", "conversation");
      } else {
        newParams.delete("mode");
      }
    } else {
      // Remove mode parameter if Review Mode is enabled
      newParams.delete("mode");
    }

    // Handle item parameter for side sheet (table view) or conversation selection
    if (currentView === "table" && sideSheetOpen && sideSheetRecordId) {
      newParams.set("item", sideSheetRecordId);
    } else if (currentView === "conversation" && selectedConversationId) {
      newParams.set("item", selectedConversationId);
    } else {
      newParams.delete("item");
    }

    // Only update if params changed
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [
    currentView,
    sideSheetOpen,
    sideSheetRecordId,
    selectedConversationId,
    systemName,
    evaluationId,
    searchParams,
    setSearchParams,
    isReviewModeEnabled,
  ]);

  // Sync view state with URL params
  useEffect(() => {
    const mode = searchParams.get("mode") as ViewType | null;
    const item = searchParams.get("item");

    // Update view mode (only when Review Mode is disabled)
    if (!isReviewModeEnabled && mode && mode !== currentView) {
      setCurrentView(mode);
    } else if (isReviewModeEnabled && currentView === "conversation") {
      // Force table view if Review Mode is enabled
      setCurrentView("table");
    }

    // Update side sheet or conversation selection based on current view
    if (currentView === "table") {
      if (item && item !== sideSheetRecordId) {
        setSideSheetRecordId(item);
        setSideSheetOpen(true);
      } else if (!item && sideSheetOpen) {
        setSideSheetOpen(false);
        setSideSheetRecordId(null);
      }
    } else if (currentView === "conversation") {
      if (item && item !== selectedConversationId) {
        setSelectedConversationId(item);
      }
    }
  }, [searchParams, isReviewModeEnabled]);

  // Load initial data
  useEffect(() => {
    let dataSource: BaseEvaluationResult[];

    if (isRunning || isCancelled) {
      // Transform subscription prompts from snake_case (database) to camelCase (application)
      // using the strategy's transformPrompts method
      // Use subscription data for running and cancelled states to show partial results
      dataSource = strategy.transformPrompts(subscriptionPrompts);
    } else {
      // Results are already transformed by the service layer (evaluation-service.ts)
      dataSource = results;
    }

    // Add unique keys for React rendering
    // Keep the original 'id' field (database UUID) intact for database operations
    const dataWithIds = dataSource.map((result, index) => ({
      ...result,
      uniqueKey: `${(result as any).policyId || (result as any).policy_id}-${index}`,
    }));

    setAllData(dataWithIds as any);
    setFilteredData(dataWithIds as any);
    setPagination((prev) => ({ ...prev, total: dataWithIds.length }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.length, subscriptionPrompts, isRunning, isCancelled]);

  // Apply filters when data or filters change
  useEffect(() => {
    // Check if any records have input/output guardrail judgements
    const hasInputGuardrails = allData.some(
      (record) =>
        (record as any).inputGuardrailJudgement !== null &&
        (record as any).inputGuardrailJudgement !== undefined
    );
    const hasOutputGuardrails = allData.some(
      (record) =>
        (record as any).outputGuardrailJudgement !== null &&
        (record as any).outputGuardrailJudgement !== undefined
    );

    // Apply filters using strategy
    const strategyFilters = strategy.getFilters({
      hasInputGuardrails,
      hasOutputGuardrails,
    });

    const filtered = allData.filter((record) => {
      // Search term filter
      if (filters.searchTerm && filters.searchTerm.length > 0) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          (record as any).basePrompt?.toLowerCase().includes(searchLower) ||
          (record as any).policyName?.toLowerCase().includes(searchLower) ||
          record.topic?.toLowerCase().includes(searchLower);

        if (!matchesSearch) return false;
      }

      // Apply strategy-defined filters
      return strategyFilters.every((filterConfig) => {
        const filterValue = filters[filterConfig.key];
        if (
          !filterValue ||
          (Array.isArray(filterValue) && filterValue.length === 0)
        ) {
          return true; // No filter applied
        }
        return filterConfig.filterFn(record, filterValue);
      });
    });

    setFilteredData(filtered);
    setPagination((prev) => ({
      ...prev,
      total: filtered.length,
      page: 1, // Reset to first page when filters change
    }));
  }, [allData, filters, strategy]);

  // Apply pagination when filtered data or pagination settings change
  useEffect(() => {
    if (currentView === "table") {
      // Pagination for table view
      const start = (pagination.page - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filteredData.slice(start, end);
      setDisplayData(paginatedData);
    } else {
      // For conversation view, show limited items with load more
      const conversationData = filteredData.slice(0, conversationDisplayCount);
      setDisplayData(conversationData);

      // Auto-select first conversation if none selected
      if (!selectedConversationId && filteredData.length > 0) {
        setSelectedConversationId((filteredData[0] as any).id);
      }
    }
  }, [
    filteredData,
    pagination.page,
    pagination.pageSize,
    currentView,
    conversationDisplayCount,
    selectedConversationId,
  ]);

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
  };

  const handlePaginationChange = (newPagination: PaginationState) => {
    setPagination(newPagination);
  };

  const handleRowSelect = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedRows(displayData.map((record) => (record as any).id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowClick = (record: BaseEvaluationResult) => {
    setSideSheetRecordId((record as any).id);
    setSideSheetOpen(true);
  };

  const handleSideSheetNavigateNext = () => {
    if (!sideSheetRecordId) return;
    const currentIndex = allData.findIndex(
      (r) => (r as any).id === sideSheetRecordId
    );
    if (currentIndex < allData.length - 1) {
      setSideSheetRecordId((allData[currentIndex + 1] as any).id);
    }
  };

  const handleSideSheetNavigatePrevious = () => {
    if (!sideSheetRecordId) return;
    const currentIndex = allData.findIndex(
      (r) => (r as any).id === sideSheetRecordId
    );
    if (currentIndex > 0) {
      setSideSheetRecordId((allData[currentIndex - 1] as any).id);
    }
  };

  const handleSideSheetExpand = () => {
    // Just close the side sheet
    if (!sideSheetRecordId) return;
    setSideSheetOpen(false);
  };

  const handleSideSheetClose = (open: boolean) => {
    setSideSheetOpen(open);
    // Clear the record ID when closing
    if (!open) {
      setSideSheetRecordId(null);
    }
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    // Reset selection when changing views
    if (view === "conversation") {
      setSideSheetOpen(false);
      setSideSheetRecordId(null);
    } else {
      setSelectedConversationId(null);
    }
  };

  const handleLoadMore = () => {
    setConversationDisplayCount((prev) => prev + 25);
  };

  const handleConversationSelect = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleRecordUpdate = (updatedRecord: BaseEvaluationResult) => {
    const recordId = (updatedRecord as any).id;

    // Update function to merge updated record with existing record
    const updateRecord = (record: BaseEvaluationResult) => {
      if ((record as any).id === recordId) {
        // The updatedRecord from the edge function is in snake_case (database format)
        // We need to merge the updated fields from the database
        const dbRecord = updatedRecord as any;

        return {
          ...record,
          // Update system_response with the new ai_system_response from database
          system_response: dbRecord.ai_system_response || (record as any).system_response,
          // Update attack_outcome (snake_case from database) - used by jailbreak
          attack_outcome: dbRecord.attack_outcome || (record as any).attack_outcome,
          // Update attackOutcome (camelCase for transformed records)
          attackOutcome: dbRecord.attack_outcome || dbRecord.final_outcome || (record as any).attackOutcome,
          // Update final_outcome (snake_case from database) - used by compliance
          final_outcome: dbRecord.final_outcome || (record as any).final_outcome,
          // Update aiSystemAttackOutcome if present
          aiSystemAttackOutcome: dbRecord.ai_system_attack_outcome || (record as any).aiSystemAttackOutcome,
          // Preserve uniqueKey
          uniqueKey: (record as any).uniqueKey,
        };
      }
      return record;
    };

    // Update all data arrays
    setAllData((prev) => prev.map(updateRecord));
    setFilteredData((prev) => prev.map(updateRecord));
    setDisplayData((prev) => prev.map(updateRecord));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full py-2"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Filters - Hide when preparing data */}
      {!(isRunning && allData.length === 0) && (
        <GenericEvaluationFilters
          strategy={strategy}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          hasGuardrails={hasGuardrails}
          data={allData}
          isAnnotationModeEnabled={!isReviewModeEnabled ? isAnnotationModeEnabled : undefined}
          onAnnotationModeChange={!isReviewModeEnabled ? setIsAnnotationModeEnabled : undefined}
          canEnableAnnotation={canEnableAnnotation}
          currentView={!isReviewModeEnabled ? currentView : undefined}
          onViewChange={!isReviewModeEnabled ? handleViewChange : undefined}
        />
      )}

      {/* Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex flex-1 overflow-hidden min-h-0"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Show preparing state when running and no data - Full width, centered */}
        {isRunning && allData.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-full gap-4">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-450 text-gray-900">Preparing Data</p>
              <p className="text-xs text-gray-500 mt-1">Generating test prompts...</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {currentView === "table" ? (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 overflow-auto"
                onWheel={(e) => e.stopPropagation()}
              >
                <div className="h-full">
                  <GenericEvaluationTable
                    data={displayData}
                    strategy={strategy}
                    selectedRows={selectedRows}
                    onRowSelect={handleRowSelect}
                    onSelectAll={handleSelectAll}
                    onRowClick={handleRowClick}
                    hasGuardrails={hasGuardrails}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="conversation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-1 h-full w-full"
                onWheel={(e) => e.stopPropagation()}
              >
                {/* Conversation List - Left Side */}
                <div
                  className="w-[400px] flex flex-col overflow-hidden"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <div className="h-full">
                    <EvaluationDataConversationView
                      data={displayData}
                      strategy={strategy}
                      totalCount={filteredData.length}
                      hasMore={displayData.length < filteredData.length}
                      onLoadMore={handleLoadMore}
                      selectedConversationId={selectedConversationId}
                      onConversationSelect={handleConversationSelect}
                    />
                  </div>
                </div>

                {/* Conversation Detail - Right Side */}
                <div
                  className="flex-1 overflow-hidden w-full"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <div className="h-full" onWheel={(e) => e.stopPropagation()}>
                    {selectedConversationId && displayData.length > 0 && (() => {
                      const selectedRecord = displayData.find(
                        (record) => (record as any).id === selectedConversationId
                      );
                      return selectedRecord ? (
                        <div className="h-full">
                          <GenericConversationView
                            key={selectedConversationId}
                            record={selectedRecord}
                            strategy={strategy}
                            aiSystemName={aiSystemName}
                            testType={testType as 'jailbreak' | 'compliance' | 'hallucination'}
                            isAnnotationModeEnabled={isAnnotationModeEnabled}
                            onRecordUpdate={handleRecordUpdate}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-lg text-gray-500">
                            No conversation selected
                          </div>
                        </div>
                      );
                    })()}
                    {(!selectedConversationId || displayData.length === 0) && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-lg text-gray-500 mb-2">
                            {filteredData.length === 0
                              ? "No Conversations Available"
                              : "Select a Conversation to View Details"}
                          </div>
                          {filteredData.length === 0 && (
                            <div className="text-sm text-gray-400">
                              Run an evaluation to see conversations here
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Pagination - Only show in table view when there are more than 20 items */}
      {currentView === "table" && pagination.total > 20 && (
        <EvaluationDataPagination
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      )}

      {/* Side Sheet - Only show in table view */}
      {currentView === "table" && (
        <EvaluationDataSideSheet
          open={sideSheetOpen}
          onOpenChange={handleSideSheetClose}
          record={
            sideSheetRecordId
              ? (allData.find((r) => (r as any).id === sideSheetRecordId) as any) || null
              : null
          }
          allRecords={allData as any}
          onNavigateNext={handleSideSheetNavigateNext}
          onNavigatePrevious={handleSideSheetNavigatePrevious}
          onExpand={handleSideSheetExpand}
          hasGuardrails={hasGuardrails}
        />
      )}
    </motion.div>
  );
}
