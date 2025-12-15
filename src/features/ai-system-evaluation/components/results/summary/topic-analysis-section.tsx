import { useMemo, useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import type { TopicAnalysis, Policy, JailbreakEvaluationResult } from "../../../types/jailbreak-evaluation";
import { PolicyViewSheet } from "./policy-view-sheet";
import { ConversationsDialog } from "./conversations-dialog";
import { Button } from "@/components/ui/button";
import { JailbreakStrategy } from "../../../strategies/jailbreak-strategy";
import {
  GenericTopicAnalysisSection,
  type TopicBreakdownColumn,
  type StatisticalSummaryColumn
} from "./generic-topic-analysis-section";

interface TopicAnalysisSectionProps {
  topicAnalysis: TopicAnalysis;
  policies?: Policy[]; // Full policy definitions from config
  riskPredictions?: any; // Risk predictions analysis
  evaluationResults?: JailbreakEvaluationResult[]; // Evaluation results for filtering
}

export function TopicAnalysisSection({ topicAnalysis, policies: configPolicies, riskPredictions, evaluationResults }: TopicAnalysisSectionProps) {
  const [viewPolicySheetOpen, setViewPolicySheetOpen] = useState(false);
  const [selectedPolicyName, setSelectedPolicyName] = useState<string | null>(null);

  // Dialog state for showing conversations
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState<JailbreakEvaluationResult[]>([]);

  // Strategy instance for dialog
  const strategy = useMemo(() => new JailbreakStrategy(), []);

  // Handler to preview policy
  const handlePreviewPolicy = (policyName: string) => {
    setSelectedPolicyName(policyName);
    setViewPolicySheetOpen(true);
  };

  // Handler to show conversations for a specific topic
  const handleTopicClick = (topicName: string, policyName: string) => {
    if (!evaluationResults || evaluationResults.length === 0) return;

    // Filter conversations by topic and policy
    const filtered = evaluationResults.filter(result =>
      result.topic === topicName &&
      result.policyName === policyName &&
      result.attackOutcome === 'Attack Success'
    );

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
    if (!selectedPolicyName || !configPolicies) {
      return null;
    }

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

    return null;
  }, [selectedPolicyName, configPolicies]);

  // Configure columns for jailbreak topic breakdown
  const breakdownColumns: TopicBreakdownColumn[] = [
    {
      key: 'topic',
      header: 'Attack Area',
      align: 'left',
      render: (topic) => topic.topic_name
    },
    {
      key: 'asr',
      header: 'Attack Success Rate',
      width: 'w-[160px]',
      align: 'right',
      render: (topic) => {
        const isHighRiskASR = topic.attack_success_rate.mean > 75;
        return (
          <>
            {isHighRiskASR && (
              <AlertTriangle className="inline-block mr-1 w-3 h-3 mb-0.5 text-red-600" strokeWidth={2} />
            )}
            <span className={isHighRiskASR ? 'text-gray-900' : 'text-gray-600'}>
              {Math.round(topic.attack_success_rate.mean)}%
            </span>
          </>
        );
      }
    },
    {
      key: 'confidence',
      header: 'Confidence',
      width: 'w-[100px]',
      align: 'right',
      render: (topic) => {
        const isLowConfidence = topic.confidence.mean < 0.5;
        return (
          <>
            {isLowConfidence && (
              <AlertTriangle className="inline-block mr-1 w-3 h-3 mb-0.5 text-red-600" strokeWidth={2} />
            )}
            {topic.confidence.mean.toFixed(2)}
          </>
        );
      }
    },
    {
      key: 'runtime',
      header: 'Response Time (in sec)',
      width: 'w-[170px]',
      align: 'right',
      render: (topic) => topic.runtime_seconds.mean.toFixed(1)
    },
    {
      key: 'occurrence',
      header: 'Occurence',
      width: 'w-[80px]',
      align: 'right',
      render: (topic, policy) => {
        const attackSuccessCount = Math.round((topic.attack_success_rate.mean / 100) * topic.occurrence);
        return (
          <div className="flex justify-end">
            <Button
              onClick={() => handleTopicClick(topic.topic_name, policy.policy_name)}
              variant="ghost"
              size="sm"
              className="gap-1 pr-1"
            >
              {attackSuccessCount} Prompts
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        );
      }
    }
  ];

  // Configure columns for statistical summary
  const statisticalColumns: StatisticalSummaryColumn[] = [
    {
      key: 'topic',
      header: 'Attack Area',
      align: 'left',
      render: (topic) => topic.topic_name
    },
    {
      key: 'std_dev',
      header: 'Std Dev (ASR)',
      width: 'w-[130px]',
      align: 'right',
      render: (topic) => (topic.attack_success_rate?.std_dev ?? 0).toFixed(2)
    },
    {
      key: 'variance',
      header: 'Variance (ASR)',
      width: 'w-[130px]',
      align: 'right',
      render: (topic) => (topic.attack_success_rate?.variance ?? 0).toFixed(2)
    },
    {
      key: 'iqr',
      header: 'IQR (ASR)',
      width: 'w-[130px]',
      align: 'right',
      render: (topic) => (topic.attack_success_rate?.iqr ?? 0).toFixed(2)
    },
    {
      key: 'range',
      header: 'Range (ASR)',
      width: 'w-[130px]',
      align: 'right',
      render: (topic) => {
        const rangeMin = topic.attack_success_rate?.range?.min ?? 0;
        const rangeMax = topic.attack_success_rate?.range?.max ?? 0;
        return `${rangeMin.toFixed(2)} - ${rangeMax.toFixed(2)}`;
      }
    }
  ];

  return (
    <>
      <GenericTopicAnalysisSection
        topicAnalysis={topicAnalysis}
        evaluationType="jailbreak"
        breakdownColumns={breakdownColumns}
        statisticalColumns={statisticalColumns}
        riskPredictions={riskPredictions}
        comparisonMetricName="Attack Success Rate"
        comparisonMetricKey="attack_success_rate"
        showRiskAnalysis={true}
      />

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
        title={''}
        strategy={strategy as any}
      />
    </>
  );
}
