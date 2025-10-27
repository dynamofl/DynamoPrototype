import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import type { JailbreakEvaluationResult, TopicAnalysis, Policy } from "../../../types/jailbreak-evaluation";
import { PolicyViewSheet } from "./policy-view-sheet";
import { ConversationsDialog } from "./conversations-dialog";
import { buildBehaviorViolationFilter } from "../../../lib/conversation-filter-builders";
import { filterConversations } from "../../../lib/conversation-filters";
import { JailbreakStrategy } from "../../../strategies/jailbreak-strategy";
import { Button } from "@/components/ui/button";

interface ViolatingBehaviorsSectionProps {
  evaluationResults?: JailbreakEvaluationResult[];
  topicAnalysis?: TopicAnalysis;
  policies?: Policy[]; // Full policy definitions from config
}

export function ViolatingBehaviorsSection({
  evaluationResults,
  topicAnalysis,
  policies: configPolicies
}: ViolatingBehaviorsSectionProps) {
  const [viewPolicySheetOpen, setViewPolicySheetOpen] = useState(false);
  const [selectedPolicyName, setSelectedPolicyName] = useState<string | null>(null);

  // Dialog state for showing conversations
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<JailbreakEvaluationResult[]>([]);

  // Strategy instance for dialog
  const strategy = useMemo(() => new JailbreakStrategy(), []);

  // Calculate highly violating topics from topic analysis
  const highlyViolatingTopics = useMemo(() => {
    if (!topicAnalysis?.source?.policies) return [];

    const allTopics = topicAnalysis.source.policies.flatMap(policy =>
      policy.topics.map(topic => ({
        ...topic,
        policyId: policy.id,
        policyName: policy.policy_name
      }))
    );

    return allTopics.filter(topic => topic.attack_success_rate.mean > 75);
  }, [topicAnalysis]);

  // Handler to preview policy
  const handlePreviewPolicy = (policyName: string) => {
    setSelectedPolicyName(policyName);
    setViewPolicySheetOpen(true);
  };

  // Handler to show conversations for a specific behavior
  const handleBehaviorClick = (policyName: string, behavior: string) => {
    if (!evaluationResults || evaluationResults.length === 0) return;

    // Build filter for this behavior
    const filter = buildBehaviorViolationFilter(policyName, behavior);

    // Filter conversations
    let filtered = filterConversations(evaluationResults, filter);

    // Further filter to only include high-violating topics (matching the count logic)
    const highViolatingTopicNames = highlyViolatingTopics
      .filter(t => t.policyName === policyName)
      .map(t => t.topic_name);

    if (highViolatingTopicNames.length > 0) {
      filtered = filtered.filter(result =>
        result.topic && highViolatingTopicNames.includes(result.topic)
      );
    }

    // Only show Attack Success cases for violating behaviors
    filtered = filtered.filter(result => result.attackOutcome === 'Attack Success');

    // Add IDs to filtered results if they don't have them
    const filteredWithIds = filtered.map((result, index) => ({
      ...result,
      id: (result as any).id || `${result.policyId}-${index}`
    }));

    // Set dialog state
    setFilteredConversations(filteredWithIds as JailbreakEvaluationResult[]);
    setDialogOpen(true);
  };

  // Get policy data from config (full policy definition)
  const selectedPolicy = useMemo(() => {
    if (!selectedPolicyName) {
      return null;
    }

    // First try to get full policy from config
    if (configPolicies && configPolicies.length > 0) {
      const configPolicy = configPolicies.find((p: any) => p.name === selectedPolicyName);
      if (configPolicy) {
        return {
          id: configPolicy.id,
          name: configPolicy.name,
          description: configPolicy.description || '',
          allowed: configPolicy.allowed || [],
          disallowed: configPolicy.disallowed || [],
          type: configPolicy.type || '',
          category: configPolicy.category || '',
          createdAt: configPolicy.createdAt || '',
          updatedAt: configPolicy.updatedAt || ''
        };
      }
    }

    // Fallback: try to get from evaluation results (but this has limited data)
    if (evaluationResults && evaluationResults.length > 0) {
      const result = evaluationResults.find(r => r.policyName === selectedPolicyName);
      if (result?.policyContext) {
        return {
          id: result.policyId,
          name: result.policyName,
          description: result.policyContext.description || '',
          allowed: result.policyContext.allowedBehaviors || [],
          disallowed: result.policyContext.disallowedBehaviors || []
        };
      }
    }

    return null;
  }, [selectedPolicyName, configPolicies, evaluationResults]);
  // Extract and group behaviors from evaluation results
  const violatingBehaviorsByPolicy = useMemo(() => {
    if (!evaluationResults || evaluationResults.length === 0) {
      return {};
    }

    // Group behaviors by policy
    const behaviorsByPolicy = new Map<string, Map<string, { behavior: string; count: number }>>();

    evaluationResults.forEach((result) => {
      // Check if this result is for a high-violating topic
      const isHighViolating = highlyViolatingTopics.some(topic => topic.topic_name === result.topic);

      if (isHighViolating && result.policyContext) {
        // Extract disallowed behaviors from policy_context
        // The correct property is 'disallowedBehaviors' (camelCase)
        const disallowedBehaviors =
          result.policyContext?.disallowedBehaviors ||
          result.policyContext?.disallowed ||
          result.policyContext?.behaviors?.disallowed ||
          [];

        disallowedBehaviors.forEach((behavior: string) => {
          if (!behaviorsByPolicy.has(result.policyName)) {
            behaviorsByPolicy.set(result.policyName, new Map());
          }

          const policyBehaviors = behaviorsByPolicy.get(result.policyName)!;

          if (policyBehaviors.has(behavior)) {
            const existing = policyBehaviors.get(behavior)!;
            policyBehaviors.set(behavior, { ...existing, count: existing.count + 1 });
          } else {
            policyBehaviors.set(behavior, { behavior, count: 1 });
          }
        });
      }
    });

    // Convert to object, filter behaviors with count > 3, and sort
    const result: Record<string, Array<{ behavior: string; count: number }>> = {};

    behaviorsByPolicy.forEach((behaviors, policyName) => {
      const filteredBehaviors = Array.from(behaviors.values())
        .filter(b => b.count > 3)  // Only show behaviors with more than 3 prompts
        .sort((a, b) => b.count - a.count);  // Sort by count descending

      if (filteredBehaviors.length > 0) {
        result[policyName] = filteredBehaviors;
      }
    });

    return result;
  }, [evaluationResults, highlyViolatingTopics]);

  // Don't render if no violating behaviors
  if (Object.keys(violatingBehaviorsByPolicy).length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-4 p-3 my-4">
        <h3 className="text-lg font-450 text-gray-900">
          Highly Violating Behaviors
        </h3>
        <div className="flex flex-col rounded-lg gap-6">
          {Object.entries(violatingBehaviorsByPolicy).map(([policyName, behaviors], policyIndex) => (
            <div key={policyName} className="">

              {/* Source / Preview Policy */}
              {Object.keys(violatingBehaviorsByPolicy).length > 1 && (
              <div className="flex items-center gap-1 pb-2">
                <button
                  onClick={() => handlePreviewPolicy(policyName)}
                  className="group flex items-center gap-1 text-[0.9375rem] font-450 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {policyName}
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>)}

              {/* Behaviors List */}
              <div className="flex flex-col gap-2 pl-1">
                {behaviors.map((item) => (
                  <div key={item.behavior} className="flex gap-2 items-start pl-1">
                    <span className="text-gray-900 text-sm leading-6">•</span>
                    <span className="text-sm text-gray-900 flex-1 leading-6">{item.behavior}</span>
                    <Button
                      onClick={() => handleBehaviorClick(policyName, item.behavior)}
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-gray-600 pr-1"
                    >
                      {item.count} Prompts
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>

              

              {/* Horizontal separator (not for last item) */}
              {/* {policyIndex < Object.keys(violatingBehaviorsByPolicy).length - 1 && (
                <div className="border-t border-gray-200 mb-4" />
              )} */}
            </div>
          ))}
        </div>
      </div>

      {/* Policy View Sheet */}
      <PolicyViewSheet
        open={viewPolicySheetOpen}
        onOpenChange={setViewPolicySheetOpen}
        policy={selectedPolicy}
      />

      {/* Conversations Dialog */}
      <ConversationsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        conversations={filteredConversations}
        title={dialogTitle}
        strategy={strategy as any}
      />
    </>
  );
}
