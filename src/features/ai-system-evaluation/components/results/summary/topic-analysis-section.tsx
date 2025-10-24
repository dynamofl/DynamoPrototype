import { useMemo, Fragment, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopicAnalysis, Policy } from "../../../types/jailbreak-evaluation";
import { PolicyViewSheet } from "./policy-view-sheet";

interface TopicAnalysisSectionProps {
  topicAnalysis: TopicAnalysis;
  policies?: Policy[]; // Full policy definitions from config
}

export function TopicAnalysisSection({ topicAnalysis, policies: configPolicies }: TopicAnalysisSectionProps) {
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

  return (
    <div className="max-w-4xl mx-auto space-y-4 my-4">
      {/* Header and Insights */}
      <div className="space-y-3 pt-4 rounded-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5  px-3">
            <p className="text-lg font-450 leading-4 text-gray-900">
              {policies.length > 1
                ? 'Attack Areas of Interest'
                : `Attack Area of Interest: ${policies[0].policy_name}`
              }
            </p>
          </div>
        </div>

        {/* Policy Cards - Show when multiple policies */}
        {policies.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 px-3">
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
                    <h4 className="text-sm font-450 text-gray-900">
                      {policy.policy_name}
                    </h4>
                    <div className="flex flex-col items-baseline gap-1">
                      <p className={`text-lg font-450 ${avgAttackSuccessRate > 75 ? 'text-gray-900' : 'text-gray-900'}`}>
                        {Math.round(avgAttackSuccessRate)}%
                      </p>
                      <p className="text-xs text-gray-600">Attack Success Rate</p>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2 py-2 px-3">
          <p className="text-[0.9375rem] font-[425] leading-5 text-gray-600 leading-relaxed">
            {displayInsights}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="breakdown" className="px-3 px-0.5 space-y-4 ">
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
                  <TableHead className="font-450 text-right w-[80px]">Occurence</TableHead>
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

      {/* Policy View Sheet */}
      <PolicyViewSheet
        open={viewPolicySheetOpen}
        onOpenChange={setViewPolicySheetOpen}
        policy={selectedPolicy}
      />
    </div>
  );
}
