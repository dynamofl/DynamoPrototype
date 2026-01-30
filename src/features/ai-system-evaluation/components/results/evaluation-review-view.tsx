import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { BaseEvaluationResult, BaseEvaluationSummary } from "../../types/base-evaluation";
import type { EvaluationStrategy } from "../../strategies/base-strategy";
import { EvaluationDataConversationView } from "./data-view-components/evaluation-data-conversation-view";
import { GenericConversationView } from "./conversation-view-components/generic-conversation-view";

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
  const [conversationDisplayCount, setConversationDisplayCount] = useState(25);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Show all conversations
  useEffect(() => {
    const filtered = results;
    setDisplayData(filtered.slice(0, conversationDisplayCount));

    // Auto-select first conversation if none selected
    if (!selectedConversationId && filtered.length > 0) {
      setSelectedConversationId((filtered[0] as any).id);
    }
  }, [results, conversationDisplayCount, selectedConversationId]);

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

  const filteredResults = results;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-full"
      onWheel={(e) => e.stopPropagation()}
    >
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
    </motion.div>
  );
}
