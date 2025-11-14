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
}

export function EvaluationDataView({
  results,
  strategy,
  testType,
  aiSystemName,
  hasGuardrails = true,
  systemName,
  evaluationId,
}: EvaluationDataViewProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [allData, setAllData] = useState<BaseEvaluationResult[]>([]);
  const [filteredData, setFilteredData] = useState<BaseEvaluationResult[]>([]);
  const [displayData, setDisplayData] = useState<BaseEvaluationResult[]>([]);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Initialize state from URL params
  const modeFromUrl = searchParams.get("mode") as ViewType | null;
  const itemFromUrl = searchParams.get("item");

  const [currentView, setCurrentView] = useState<ViewType>(
    modeFromUrl || "conversation"
  );
  const [conversationDisplayCount, setConversationDisplayCount] = useState(25);

  // In conversation view, initialize selectedConversationId from URL
  // In table view, it will be set by the auto-select logic
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(modeFromUrl === "conversation" ? itemFromUrl : null);

  // In table view with item param, initialize side sheet as open
  const [sideSheetOpen, setSideSheetOpen] = useState(
    modeFromUrl === "table" && !!itemFromUrl
  );
  const [sideSheetRecordId, setSideSheetRecordId] = useState<string | null>(
    modeFromUrl === "table" ? itemFromUrl : null
  );

  // Generic filter state (works for all test types)
  const [filters, setFilters] = useState<Record<string, any>>({
    searchTerm: "",
  });

  // Annotation mode state (page-level)
  const [isAnnotationModeEnabled, setIsAnnotationModeEnabled] = useState(false);

  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });

  // Update URL when view mode or selected item changes
  useEffect(() => {
    if (!systemName || !evaluationId) return;

    const newParams = new URLSearchParams(searchParams);

    // Handle mode parameter - conversation is default, so only set mode for table
    if (currentView !== "conversation") {
      newParams.set("mode", currentView);
    } else {
      newParams.delete("mode");
    }

    // Handle item parameter based on view mode
    if (currentView === "conversation") {
      // Conversation view: item is mandatory (always a selected conversation)
      if (selectedConversationId) {
        newParams.set("item", selectedConversationId);
      } else {
        newParams.delete("item");
      }
    } else if (currentView === "table") {
      // Table view: item only exists when side sheet is open
      if (sideSheetOpen && sideSheetRecordId) {
        newParams.set("item", sideSheetRecordId);
      } else {
        newParams.delete("item");
      }
    }

    // Only update if params changed
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [
    currentView,
    selectedConversationId,
    sideSheetOpen,
    sideSheetRecordId,
    systemName,
    evaluationId,
    searchParams,
    setSearchParams,
  ]);

  // Sync state with URL params when they change externally (e.g., browser back/forward)
  useEffect(() => {
    const mode = searchParams.get("mode") as ViewType | null;
    const item = searchParams.get("item");

    // Determine the target view (default to conversation if no mode param)
    const targetView = mode === "table" ? "table" : "conversation";

    // Only sync if view actually needs to change
    if (targetView !== currentView) {
      setCurrentView(targetView);
      // When changing views, clear conflicting state
      if (targetView === "table") {
        setSelectedConversationId(null);
        setSideSheetOpen(false);
        setSideSheetRecordId(null);
      } else {
        setSideSheetOpen(false);
        setSideSheetRecordId(null);
      }
      return;
    }

    // Sync item based on current view
    if (currentView === "conversation") {
      // In conversation view, sync selected conversation from URL
      if (item && item !== selectedConversationId) {
        setSelectedConversationId(item);
      }
    } else if (currentView === "table") {
      // In table view, sync side sheet from URL
      if (item && item !== sideSheetRecordId) {
        setSideSheetRecordId(item);
        setSideSheetOpen(true);
      } else if (!item && sideSheetOpen) {
        // If no item in URL but side sheet is open, close it
        setSideSheetOpen(false);
        setSideSheetRecordId(null);
      }
    }
  }, [searchParams]);

  // Load initial data
  useEffect(() => {
    // Results are already transformed by the service layer (evaluation-service.ts)
    // Don't transform again - just add unique keys for React rendering
    // Keep the original 'id' field (database UUID) intact for database operations
    const dataWithIds = results.map((result, index) => ({
      ...result,
      uniqueKey: `${(result as any).policyId || (result as any).policy_id}-${index}`,
    }));

    setAllData(dataWithIds as any);
    setFilteredData(dataWithIds as any);
    setPagination((prev) => ({ ...prev, total: dataWithIds.length }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.length]);

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
      // For conversation view, show the first N items based on conversationDisplayCount
      const conversationData = filteredData.slice(0, conversationDisplayCount);
      setDisplayData(conversationData);

      // Auto-select first conversation if none selected or current selection not in data
      if (conversationData.length > 0) {
        const currentSelectionExists =
          selectedConversationId &&
          conversationData.some(
            (record) => (record as any).id === selectedConversationId
          );

        if (!currentSelectionExists) {
          setSelectedConversationId((conversationData[0] as any).id);
        }
      } else {
        setSelectedConversationId(null);
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
    // Reset conversation display count when filters change
    setConversationDisplayCount(25);
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

  const handleViewChange = (view: ViewType) => {
    if (view === currentView) return;

    // Update view and clear related state
    setCurrentView(view);

    if (view === "conversation") {
      // Clear side sheet state when switching to conversation view
      setSideSheetOpen(false);
      setSideSheetRecordId(null);
      setConversationDisplayCount(25);
    } else if (view === "table") {
      // Clear conversation selection when switching to table view
      setSelectedConversationId(null);
      setSideSheetOpen(false);
      setSideSheetRecordId(null);
    }
  };

  const handleLoadMore = () => {
    setConversationDisplayCount((prev) => prev + 25);
  };

  const handleConversationSelect = (id: string) => {
    setSelectedConversationId(id);
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
    if (!sideSheetRecordId) return;
    // Close side sheet
    setSideSheetOpen(false);
    // Switch to conversation view
    handleViewChange("conversation");
    // Set the selected conversation
    setSelectedConversationId(sideSheetRecordId);
  };

  const handleSideSheetClose = (open: boolean) => {
    setSideSheetOpen(open);
    // Clear the record ID when closing
    if (!open) {
      setSideSheetRecordId(null);
    }
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
      {/* Filters */}
      <GenericEvaluationFilters
        strategy={strategy}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        currentView={currentView}
        onViewChange={handleViewChange}
        hasGuardrails={hasGuardrails}
        data={allData}
        isAnnotationModeEnabled={isAnnotationModeEnabled}
        onAnnotationModeChange={setIsAnnotationModeEnabled}
      />

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, scale: 0.995 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.995 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex flex-1 overflow-hidden min-h-0"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Table/Conversation View */}
          <div
            className={`${
              currentView === "conversation" ? "max-w-[400px]" : "flex-1"
            } ${
              currentView === "table"
                ? "overflow-auto"
                : "flex flex-col overflow-hidden"
            }`}
            onWheel={(e) => e.stopPropagation()}
          >
            <div className="h-full">
              {currentView === "table" ? (
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
                  strategy={strategy}
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
          {currentView === "conversation" && (
            <div
              className="flex-1 overflow-hidden"
              onWheel={(e) => e.stopPropagation()}
            >
              <div className="h-full" onWheel={(e) => e.stopPropagation()}>
                {selectedConversationId &&
                  displayData.length > 0 &&
                  (() => {
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
                          testType={testType as 'jailbreak' | 'compliance'}
                          isAnnotationModeEnabled={isAnnotationModeEnabled}
                          onRecordUpdate={handleRecordUpdate}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-64 animate-in fade-in-0 duration-300">
                        <div className="text-lg text-gray-500">
                          No conversation selected
                        </div>
                      </div>
                    );
                  })()}
                {(!selectedConversationId || displayData.length === 0) && (
                  <div className="flex items-center justify-center h-64 animate-in fade-in-0 duration-300">
                    <div className="text-lg text-gray-500">
                      Select a conversation to view details
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination - Only show for table view and when there are more than 20 items */}
      {currentView === "table" && pagination.total > 20 && (
        <EvaluationDataPagination
          pagination={pagination}
          onPaginationChange={handlePaginationChange}
        />
      )}

      {/* Side Sheet */}
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
    </motion.div>
  );
}
