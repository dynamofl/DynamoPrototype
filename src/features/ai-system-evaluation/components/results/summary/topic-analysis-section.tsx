import { useMemo, Fragment, useState } from "react";
import { AlertTriangle, ArrowUpRight, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopicAnalysis, JailbreakEvaluationResult, Policy } from "../../../types/jailbreak-evaluation";
import { PolicyViewSheet } from "./policy-view-sheet";

interface TopicAnalysisSectionProps {
  topicAnalysis: TopicAnalysis;
  evaluationResults?: JailbreakEvaluationResult[];
  policies?: Policy[]; // Full policy definitions from config
}

export function TopicAnalysisSection({ topicAnalysis, evaluationResults, policies: configPolicies }: TopicAnalysisSectionProps) {
  const [viewPolicySheetOpen, setViewPolicySheetOpen] = useState(false);
  const [selectedPolicyName, setSelectedPolicyName] = useState<string | null>(null);

  // Keep policies grouped for display
  const policies = topicAnalysis.source.policies;
  if (!policies || policies.length === 0) return null;

  // Handler to preview policy
  const handlePreviewPolicy = (policyName: string) => {
    setSelectedPolicyName(policyName);
    setViewPolicySheetOpen(true);
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

  // Flatten all topics for statistics calculations
  const allTopics = policies.flatMap(policy =>
    policy.topics.map(topic => ({
      ...topic,
      policyId: policy.id,
      policyName: policy.policy_name
    }))
  );

  // Calculate summary statistics for the insights text
  const totalPrompts = allTopics.reduce((sum, topic) => sum + topic.occurrence, 0);
  const uniqueTopics = allTopics.length;
  const avgConfidence = allTopics.reduce((sum, topic) => sum + topic.confidence.mean, 0) / allTopics.length;
  const attackSuccessRateRange = {
    min: Math.min(...allTopics.map(t => t.attack_success_rate.mean)),
    max: Math.max(...allTopics.map(t => t.attack_success_rate.mean))
  };

  // Generate dynamic insights if not provided by AI
  const displayInsights = topicAnalysis.topic_insight || `The topic-level view covers ${totalPrompts} adversarial prompts across ${uniqueTopics} topic${uniqueTopics > 1 ? 's' : ''} spanning ${policies.length} ${policies.length > 1 ? 'policies' : 'policy'}. Attack success varied widely, ranging from ${Math.round(attackSuccessRateRange.min)}% to ${Math.round(attackSuccessRateRange.max)}% per topic, with an average judge confidence of ${avgConfidence.toFixed(2)}. This breakdown highlights where failures are most concentrated and where defenses are holding.`;

  // Get highly violating topics (ASR > 75%) - assuming ASR is already in percentage (0-100)
  const highlyViolatingTopics = allTopics.filter(topic => topic.attack_success_rate.mean > 75);

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

  return (
    <div className="max-w-4xl mx-auto space-y-2 my-2">
      {/* Header and Insights */}
      <div className="space-y-3 pt-4 rounded-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5  px-3">
            <p className="text-[0.9375rem] font-550 leading-4 text-gray-900">
              {policies.length > 1
                ? 'Attack Areas of Interest'
                : `Attack Area of Interest: ${policies[0].policy_name}`
              }
            </p>
          </div>
        </div>

        {/* Policy Cards - Show when multiple policies */}
        {policies.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {policies.map((policy) => {
              // Calculate average attack success rate for this policy
              const avgAttackSuccessRate = policy.topics.reduce(
                (sum, topic) => sum + topic.attack_success_rate.mean,
                0
              ) / policy.topics.length;

              return (
                <div
                  key={policy.id}
                  className="bg-gray-0 border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[0.9375rem] font-450 text-gray-900">
                      {policy.policy_name}
                    </h4>
                    <div className="flex flex-col items-baseline gap-1">
                      <p className="text-xs text-gray-600">Attack Success Rate</p>
                      <p className={`text-lg font-450 ${avgAttackSuccessRate > 75 ? 'text-red-600' : 'text-gray-600'}`}>
                        {Math.round(avgAttackSuccessRate)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2 py-2 px-3">
          <p className="text-[0.9375rem] font-[425] leading-5 text-gray-900 leading-relaxed">
            {displayInsights}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="breakdown" className="px-0.5 pt-2 space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Topic Breakdown</TabsTrigger>
          <TabsTrigger value="statistical">Statistical Summary</TabsTrigger>
          <TabsTrigger value="regression">Regression Analysis</TabsTrigger>
        </TabsList>

        
        {/* Topic Breakdown Table */}
        <TabsContent value="breakdown" className="mt-0">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-0 hover:bg-gray-50">
                  <TableHead className="font-450 pl-3">Attack Area</TableHead>
                  <TableHead className="font-450 text-right w-[160px]">Attack Success Rate</TableHead>
                  <TableHead className="font-450 text-right w-[100px]">Confidence</TableHead>
                  <TableHead className="font-450 text-right w-[170px]">Response Time (in sec)</TableHead>
                  <TableHead className="font-450 text-right w-[100px]">Occurence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <Fragment key={`policy-${policy.id}`}>
                    {/* Policy Header Row */}
                    <TableRow className="bg-gray-100 hover:bg-gray-100 border-t border-gray-200">
                      <TableCell colSpan={5} className="h-8 pl-3 font-550 text-gray-900">
                        {policy.policy_name}
                      </TableCell>
                    </TableRow>
                    {/* Topics for this policy */}
                    {policy.topics.map((topic, topicIndex) => {
                      // ASR is already a percentage (0-100), not a decimal (0-1)
                      // Show warning icon only if ASR > 75%
                      const isHighRiskASR = topic.attack_success_rate.mean > 75;
                      const isLowConfidence = topic.confidence.mean < 0.5;

                      return (
                        <TableRow key={`${policy.id}-${topicIndex}`}>
                          <TableCell className="text-gray-900 pl-6">
                            {topic.topic_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {isHighRiskASR && (
                              <AlertTriangle className="inline-block mr-1 w-3 h-3 mb-0.5 text-red-600" strokeWidth={2} />
                            )}
                            <span className={isHighRiskASR ? 'text-gray-900' : 'text-gray-600'}>
                              {Math.round(topic.attack_success_rate.mean)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {isLowConfidence && (
                              <AlertTriangle className="inline-block mr-1 w-3 h-3 mb-0.5 text-red-600" strokeWidth={2} />
                            )}
                            {topic.confidence.mean.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {topic.runtime_seconds.mean.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right">
                            {topic.occurrence}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Statistical Summary Table */}
        <TabsContent value="statistical" className="mt-0">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-0 hover:bg-gray-50">
                  <TableHead className="pl-3 font-450">Attack Area</TableHead>
                  <TableHead className="font-450 text-right w-[130px]">Std Dev (ASR)</TableHead>
                  <TableHead className="font-450 text-right w-[130px]">Variance (ASR)</TableHead>
                  <TableHead className="font-450 text-right w-[130px]">IQR (ASR)</TableHead>
                  <TableHead className="font-450 text-right w-[130px]">Range (ASR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <Fragment key={`policy-stat-${policy.id}`}>
                    {/* Policy Header Row */}
                    <TableRow className="bg-gray-100 hover:bg-gray-100 border-t border-gray-200">
                      <TableCell colSpan={5} className="h-8 pl-3 font-550 text-gray-900">
                        {policy.policy_name}
                      </TableCell>
                    </TableRow>
                    {/* Topics for this policy */}
                    {policy.topics.map((topic, topicIndex) => {
                      const stdDev = topic.attack_success_rate?.std_dev ?? 0;
                      const variance = topic.attack_success_rate?.variance ?? 0;
                      const iqr = topic.attack_success_rate?.iqr ?? 0;
                      const rangeMin = topic.attack_success_rate?.range?.min ?? 0;
                      const rangeMax = topic.attack_success_rate?.range?.max ?? 0;

                      return (
                        <TableRow key={`${policy.id}-stat-${topicIndex}`}>
                          <TableCell className="pl-6 text-gray-900">
                            {topic.topic_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {stdDev.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {variance.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {iqr.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {rangeMin.toFixed(2)} - {rangeMax.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Regression Analysis Table */}
        <TabsContent value="regression" className="mt-0">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-0 hover:bg-gray-50">
                  <TableHead className="pl-3 font-450">Attack Area</TableHead>
                  <TableHead className="font-450 text-right w-[120px]">Odds Ratio</TableHead>
                  <TableHead className="font-450 text-right w-[120px]">P-Value</TableHead>
                  <TableHead className="font-450 text-right w-[120px]">Significance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <Fragment key={`policy-reg-${policy.id}`}>
                    {/* Policy Header Row */}
                    <TableRow className="bg-gray-100 hover:bg-gray-100 border-t border-gray-200">
                      <TableCell colSpan={4} className="h-8 pl-3 font-550  text-gray-900">
                        {policy.policy_name}
                      </TableCell>
                    </TableRow>
                    {/* Topics for this policy */}
                    {policy.topics.map((topic, topicIndex) => {
                      const oddsRatio = topic.logistic_regression?.odds_ratio ?? 0;
                      const pValue = topic.logistic_regression?.p_value ?? 0;
                      const significance = topic.logistic_regression?.significance ?? false;

                      return (
                        <TableRow key={`${policy.id}-reg-${topicIndex}`}>
                          <TableCell className="pl-6 text-gray-900">
                            {topic.topic_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {oddsRatio.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            {pValue.toFixed(4)}
                          </TableCell>
                          <TableCell className={`text-right ${significance ? 'text-green-600' : ''}`}>
                            {significance ? 'Yes' : 'No'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
   
      </Tabs>

      {/* Highly Violating Behaviors Section */}
      {Object.keys(violatingBehaviorsByPolicy).length > 0 && (
        <div className="space-y-4 p-3 border border-gray-200 rounded-lg">
          <h3 className="text-[0.9375rem] font-450 text-gray-600">
            Highly Violating Behaviors:
          </h3>
          <div className="flex flex-col">
            {Object.entries(violatingBehaviorsByPolicy).map(([policyName, behaviors], policyIndex) => (
              <div key={policyName}>
                {/* Behaviors List */}
                <div className="flex flex-col gap-3 pb-4">
                  {behaviors.map((item) => (
                    <div key={item.behavior} className="flex gap-2 items-start">
                      <span className="text-gray-400 text-[0.9375rem] leading-6">•</span>
                      <span className="text-[0.9375rem] text-gray-900 flex-1 leading-6">{item.behavior}</span>
                      <div className="bg-gray-0 flex items-center justify-center px-3 py-1 rounded-full">
                        <span className="text-xs font-450 text-gray-600">
                          {item.count} Prompts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Source / Preview Policy */}
                <div className="flex items-center gap-1 pl-4 pb-4">
                  <span className="text-[0.9375rem] text-gray-600">Source:</span>
                  <button
                    onClick={() => handlePreviewPolicy(policyName)}
                    className="flex items-center gap-1 text-[0.9375rem] font-450 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {policyName}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Horizontal separator (not for last item) */}
                {policyIndex < Object.keys(violatingBehaviorsByPolicy).length - 1 && (
                  <div className="border-t border-gray-200 mb-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy View Sheet */}
      <PolicyViewSheet
        open={viewPolicySheetOpen}
        onOpenChange={setViewPolicySheetOpen}
        policy={selectedPolicy}
      />
    </div>
  );
}
