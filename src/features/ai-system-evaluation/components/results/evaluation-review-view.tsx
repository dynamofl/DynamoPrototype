import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { BaseEvaluationResult, BaseEvaluationSummary } from "../../types/base-evaluation";
import type { EvaluationStrategy } from "../../strategies/base-strategy";
import { EvaluationDataConversationView } from "./data-view-components/evaluation-data-conversation-view";
import { GenericConversationView } from "./conversation-view-components/generic-conversation-view";
import { GenericEvaluationFilters } from "./data-view-components/generic-evaluation-filters";

interface EvaluationReviewViewProps {
  results: BaseEvaluationResult[];
  summary: BaseEvaluationSummary;
  strategy: EvaluationStrategy;
  testType: string;
  evaluationName?: string;
  aiSystemName?: string;
  evaluationId?: string;
  systemName?: string;
  hasGuardrails?: boolean;
  evaluationStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  onResultUpdate?: (updatedRecord: BaseEvaluationResult) => void;
}

export function EvaluationReviewView({
  results,
  summary,
  strategy,
  testType,
  evaluationName,
  aiSystemName,
  evaluationId,
  systemName,
  hasGuardrails = false,
  evaluationStatus,
  onResultUpdate,
}: EvaluationReviewViewProps) {
  const [displayData, setDisplayData] = useState<BaseEvaluationResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<BaseEvaluationResult[]>([]);
  const [conversationDisplayCount, setConversationDisplayCount] = useState(25);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({ searchTerm: '' });

  // Apply filters and show conversations
  useEffect(() => {
    // Get filter configurations from strategy
    const strategyFilters = strategy.getFilters({
      hasInputGuardrails: hasGuardrails,
      hasOutputGuardrails: hasGuardrails,
    });

    // Apply filters manually
    const filtered = results.filter((record) => {
      // Search term filter
      if (filters.searchTerm && filters.searchTerm.length > 0) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          (record as any).basePrompt?.toLowerCase().includes(searchLower) ||
          (record as any).base_prompt?.toLowerCase().includes(searchLower) ||
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

    setFilteredResults(filtered);
    setDisplayData(filtered.slice(0, conversationDisplayCount));

    // Auto-select first conversation if none selected or if current selection is not in filtered results
    if (!selectedConversationId || !filtered.find((r: any) => r.id === selectedConversationId)) {
      if (filtered.length > 0) {
        setSelectedConversationId((filtered[0] as any).id);
      } else {
        setSelectedConversationId(null);
      }
    }
  }, [results, conversationDisplayCount, filters, strategy, hasGuardrails, selectedConversationId]);

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
        };
      }
      return record;
    };

    // Update display data
    setDisplayData((prev) => prev.map(updateRecord));

    // Notify parent component of the update
    onResultUpdate?.(updatedRecord);
  };

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setConversationDisplayCount(25);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full"
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Filter Bar */}
      <div className="flex-shrink-0 py-2">
        <GenericEvaluationFilters
          strategy={strategy}
          filters={filters}
          onFiltersChange={handleFiltersChange}
          hasGuardrails={hasGuardrails}
          data={results}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Conversation List - Left Side */}
        <div
          className="max-w-[400px] flex flex-col overflow-hidden"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="h-full">
            <EvaluationDataConversationView
              data={displayData}
              strategy={strategy}
              totalCount={filteredResults.length}
              hasMore={displayData.length < filteredResults.length}
              onLoadMore={handleLoadMore}
              selectedConversationId={selectedConversationId}
              onConversationSelect={handleConversationSelect}
            />
          </div>
        </div>

        {/* Conversation Detail - Right Side */}
        <div
          className="flex-1 overflow-hidden"
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
                    isAnnotationModeEnabled={true}
                    onRecordUpdate={handleRecordUpdate}
                    useReviewMode={true}
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
                    {results.length === 0
                      ? "No Conversations Available"
                      : filteredResults.length === 0
                      ? "No conversations match your filters"
                      : "Select a Conversation to View Details"}
                  </div>
                  {results.length === 0 && (
                    <div className="text-sm text-gray-400">
                      Run an evaluation to see conversations here
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
