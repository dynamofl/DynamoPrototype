import { useMemo } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopicAnalysis, JailbreakEvaluationResult } from "../../../types/jailbreak-evaluation";

interface TopicAnalysisSectionProps {
  topicAnalysis: TopicAnalysis;
  evaluationResults?: JailbreakEvaluationResult[];
}

export function TopicAnalysisSection({ topicAnalysis, evaluationResults }: TopicAnalysisSectionProps) {

  // Keep policies grouped for display
  const policies = topicAnalysis.source.policies;
  if (!policies || policies.length === 0) return null;

  const firstPolicy = policies[0];

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
  const violatingBehaviors = useMemo(() => {
    if (!evaluationResults || evaluationResults.length === 0) {
      return [];
    }

    // Filter to only high-risk prompts and group behaviors
    const behaviorMap = new Map<string, { behavior: string; count: number; policyName: string }>();

    evaluationResults.forEach(result => {
      // Check if this result is for a high-violating topic
      const isHighViolating = highlyViolatingTopics.some(topic => topic.topic_name === result.topic);

      if (isHighViolating && result.policyContext) {
        // Extract disallowed behaviors from policy_context
        // Try different possible structures
        const disallowedBehaviors =
          result.policyContext?.disallowed ||
          result.policyContext?.behaviors?.disallowed ||
          [];

        disallowedBehaviors.forEach((behavior: string) => {
          if (behaviorMap.has(behavior)) {
            const existing = behaviorMap.get(behavior)!;
            behaviorMap.set(behavior, { ...existing, count: existing.count + 1 });
          } else {
            behaviorMap.set(behavior, {
              behavior,
              count: 1,
              policyName: result.policyName
            });
          }
        });
      }
    });

    const behaviors = Array.from(behaviorMap.values()).sort((a, b) => b.count - a.count);

    // Convert to array and sort by count (descending)
    return behaviors;
  }, [evaluationResults, highlyViolatingTopics]);

  return (
    <div className="max-w-4xl mx-auto space-y-2">
      {/* Header and Insights */}
      <div className="space-y-3 px-3 pt-4 rounded-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-semibold leading-4 text-gray-900">
              {policies.length > 1
                ? `Attack Areas of Interest: ${policies.map(p => p.policy_name).join(', ')}`
                : `Attack Area of Interest: ${firstPolicy.policy_name}`
              }
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-[425] leading-5 text-gray-900 leading-relaxed">
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
                  <TableHead className="font-450 pl-3">Topic</TableHead>
                  <TableHead className="font-450 text-center w-[160px]">Attack Success Rate</TableHead>
                  <TableHead className="font-450 text-center w-[100px]">Confidence</TableHead>
                  <TableHead className="font-450 text-center w-[170px]">Response Time (in sec)</TableHead>
                  <TableHead className="font-450 text-center w-[100px]">Occurence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <>
                    {/* Policy Header Row */}
                    <TableRow key={`policy-${policy.id}`} className="bg-gray-100 hover:bg-gray-100">
                      <TableCell colSpan={5} className="font-semibold text-gray-900">
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
                          <TableCell className="text-gray-900 pl-8">
                            {topic.topic_name}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={isHighRiskASR ? 'text-gray-900' : 'text-gray-600'}>
                              {Math.round(topic.attack_success_rate.mean)}%
                            </span>
                            {isHighRiskASR && (
                              <AlertTriangle className="inline-block ml-2 w-5 h-5 text-red-600" strokeWidth={2} />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {topic.confidence.mean.toFixed(2)}
                            {isLowConfidence && (
                              <AlertTriangle className="inline-block ml-2 w-5 h-5 text-red-600" strokeWidth={2} />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {topic.runtime_seconds.mean.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-center">
                            {topic.occurrence}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
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
                  <TableHead className="pl-3 font-450">Topic</TableHead>
                  <TableHead className="font-450 text-center w-[130px]">Std Dev (ASR)</TableHead>
                  <TableHead className="font-450 text-center w-[130px]">Variance (ASR)</TableHead>
                  <TableHead className="font-450 text-center w-[130px]">IQR (ASR)</TableHead>
                  <TableHead className="font-450 text-center w-[130px]">Range (ASR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <>
                    {/* Policy Header Row */}
                    <TableRow key={`policy-stat-${policy.id}`} className="bg-gray-100 hover:bg-gray-100">
                      <TableCell colSpan={5} className="font-semibold text-gray-900">
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
                          <TableCell className="pl-8 text-gray-900">
                            {topic.topic_name}
                          </TableCell>
                          <TableCell className="text-center">
                            {stdDev.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {variance.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {iqr.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {rangeMin.toFixed(2)} - {rangeMax.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
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
                  <TableHead className="pl-3 font-450">Topic</TableHead>
                  <TableHead className="font-450 text-center w-[120px]">Odds Ratio</TableHead>
                  <TableHead className="font-450 text-center w-[120px]">P-Value</TableHead>
                  <TableHead className="font-450 text-center w-[120px]">Significance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <>
                    {/* Policy Header Row */}
                    <TableRow key={`policy-reg-${policy.id}`} className="bg-gray-100 hover:bg-gray-100">
                      <TableCell colSpan={4} className="font-semibold text-gray-900">
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
                          <TableCell className="pl-8 text-gray-900">
                            {topic.topic_name}
                          </TableCell>
                          <TableCell className="text-center">
                            {oddsRatio.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {pValue.toFixed(4)}
                          </TableCell>
                          <TableCell className={`text-center ${significance ? 'text-green-600' : ''}`}>
                            {significance ? 'Yes' : 'No'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
   
      </Tabs>

      {/* Highly Violating Behaviors Section */}
      {violatingBehaviors.length > 0 && (
        <div className="border border-gray-200 flex flex-col items-start rounded-lg w-full">
          <div className="flex-1 flex flex-col items-start justify-center p-2.5 w-full">
            <div className="flex flex-col gap-2.5 items-start">
              <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">
                Highly Violating Behaviors:
              </p>
            </div>
            <div className="flex flex-col items-start w-full">
              {violatingBehaviors.map((item, index) => (
                <div
                  key={`violating-${index}`}
                  className={`flex flex-col gap-2.5 items-start px-0 py-3 w-full ${
                    index < violatingBehaviors.length - 1 ? 'border-b border-gray-200' : ''
                  }`}
                >
                  <div className="flex flex-col gap-2.5 items-start">
                    <div className="flex gap-1.5 items-start">
                      <ul className="list-disc ml-5 text-[0.8125rem] font-[425] leading-5 text-gray-900">
                        <li>
                          {item.behavior}
                        </li>
                      </ul>
                      <div className="bg-gray-100 border border-gray-300 flex gap-2.5 items-center justify-center px-1 py-0.5 rounded-[20px]">
                        <p className="text-xs font-[425] leading-4 text-gray-700">
                          {item.count} Prompts
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5 items-start px-5">
                    <div className="flex gap-1.5 items-start">
                      <p className="text-xs font-[425] leading-4 text-gray-700">
                        Source:
                      </p>
                      <div className="flex gap-0.5 items-center cursor-pointer hover:underline">
                        <p className="text-xs font-[550] leading-4 text-gray-700">
                          {item.policyName}
                        </p>
                        <div className="w-4 h-4">
                          <ExternalLink className="w-full h-full text-gray-700" strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
