import { useState, useMemo } from "react";
import { AlertTriangle, ExternalLink } from "lucide-react";
import type { TopicAnalysis, JailbreakEvaluationResult } from "../../../types/jailbreak-evaluation";

interface TopicAnalysisSectionProps {
  topicAnalysis: TopicAnalysis;
  evaluationResults?: JailbreakEvaluationResult[];
}

type TabView = "breakdown" | "statistical" | "regression";

export function TopicAnalysisSection({ topicAnalysis, evaluationResults }: TopicAnalysisSectionProps) {
  const [activeTab, setActiveTab] = useState<TabView>("breakdown");

  // Get the first policy for the header (assuming single policy group)
  const firstPolicy = topicAnalysis.source.policies[0];
  if (!firstPolicy) return null;

  // Flatten all topics across policies for display
  const allTopics = topicAnalysis.source.policies.flatMap(policy =>
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
  const displayInsights = topicAnalysis.topic_insight || `The topic-level view covers ${totalPrompts} adversarial prompts across ${uniqueTopics} ${firstPolicy.policy_name.toLowerCase()}-related areas. Attack success varied widely, ranging from ${Math.round(attackSuccessRateRange.min)}% to ${Math.round(attackSuccessRateRange.max)}% per topic, with an average judge confidence of ${avgConfidence.toFixed(2)}. This breakdown highlights where failures are most concentrated and where defenses are holding.`;

  // Get highly violating topics (ASR > 75%) - assuming ASR is already in percentage (0-100)
  const highlyViolatingTopics = allTopics.filter(topic => topic.attack_success_rate.mean > 75);

  // Extract and group behaviors from evaluation results
  const violatingBehaviors = useMemo(() => {
    if (!evaluationResults || evaluationResults.length === 0) {
      console.log('[TopicAnalysis] No evaluation results available');
      return [];
    }

    console.log('[TopicAnalysis] Processing evaluation results:', evaluationResults.length);
    console.log('[TopicAnalysis] High violating topics:', highlyViolatingTopics);

    // Filter to only high-risk prompts and group behaviors
    const behaviorMap = new Map<string, { behavior: string; count: number; policyName: string }>();

    evaluationResults.forEach(result => {
      // Check if this result is for a high-violating topic
      const isHighViolating = highlyViolatingTopics.some(topic => topic.topic_name === result.topic);

      console.log('[TopicAnalysis] Result topic:', result.topic, 'isHighViolating:', isHighViolating, 'policyContext:', result.policyContext);

      if (isHighViolating && result.policyContext) {
        // Extract disallowed behaviors from policy_context
        // Try different possible structures
        const disallowedBehaviors =
          result.policyContext?.disallowed ||
          result.policyContext?.behaviors?.disallowed ||
          [];

        console.log('[TopicAnalysis] Found disallowed behaviors:', disallowedBehaviors);

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
    console.log('[TopicAnalysis] Final violating behaviors:', behaviors);

    // Convert to array and sort by count (descending)
    return behaviors;
  }, [evaluationResults, highlyViolatingTopics]);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header and Insights */}
      <div className="space-y-2 px-3 py-4 rounded-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <p className="text-xs font-semibold leading-4 text-gray-900">
              Attack Area of Interest: {firstPolicy.policy_name}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-[0.8125rem] font-[425] leading-5 text-gray-900">
            {displayInsights}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-0.5 pt-2">
        <div className="bg-gray-100 flex gap-0.5 items-center p-0.5 rounded-[46px]">
          <button
            onClick={() => setActiveTab("breakdown")}
            className={`flex gap-2.5 items-center justify-center px-2 py-1 rounded-[34px] text-xs font-[550] leading-4 transition-colors ${
              activeTab === "breakdown"
                ? "bg-gray-200 text-gray-900"
                : "bg-transparent text-gray-900 hover:bg-gray-50"
            }`}
          >
            Topic Breakdown
          </button>
          <button
            onClick={() => setActiveTab("statistical")}
            className={`flex gap-2.5 items-center justify-center px-2 py-1 rounded-[34px] text-xs font-[550] leading-4 transition-colors ${
              activeTab === "statistical"
                ? "bg-gray-200 text-gray-900"
                : "bg-transparent text-gray-900 hover:bg-gray-50"
            }`}
          >
            Statistical Summary
          </button>
          <button
            onClick={() => setActiveTab("regression")}
            className={`flex gap-2.5 items-center justify-center px-2 py-1 rounded-[34px] text-xs font-[550] leading-4 transition-colors ${
              activeTab === "regression"
                ? "bg-gray-200 text-gray-900"
                : "bg-transparent text-gray-900 hover:bg-gray-50"
            }`}
          >
            Regression Analysis
          </button>
        </div>
      </div>

      {/* Topic Breakdown Table */}
      {activeTab === "breakdown" && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-clip rounded-[inherit]">
            {/* Table Header */}
            <div className="flex items-start border-b border-gray-300">
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center px-3 py-2 min-w-0">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Topic</p>
              </div>
              <div className="flex-1 max-w-[160px] bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Attack Success Rate</p>
              </div>
              <div className="flex-1 max-w-[120px] bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Confidence</p>
              </div>
              <div className="flex-1 max-w-[120px] bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Response Time (in sec)</p>
              </div>
              <div className="w-[119px] bg-gray-100 flex gap-2.5 items-start justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Occurence</p>
              </div>
            </div>

            {/* Table Rows */}
            {allTopics.map((topic, index) => {
              // ASR is already a percentage (0-100), not a decimal (0-1)
              // Show warning icon only if ASR > 75%
              const isHighRiskASR = topic.attack_success_rate.mean > 75;
              const isLowConfidence = topic.confidence.mean < 0.5;

              return (
                <div key={`${topic.policyId}-${index}`} className="flex items-start">
                  <div className="flex-1 flex gap-2.5 items-center p-3 min-w-0">
                    <p className="text-[0.8125rem] font-[425] leading-5 text-gray-900">
                      {topic.topic_name}
                    </p>
                  </div>
                  <div className="flex-1 max-w-[160px] flex gap-2.5 items-center justify-center p-3 relative">
                    <p className={`text-[0.8125rem] font-[425] leading-5 ${isHighRiskASR ? 'text-gray-900' : 'text-gray-600'}`}>
                      {Math.round(topic.attack_success_rate.mean)}%
                    </p>
                    {isHighRiskASR && (
                      <AlertTriangle className="absolute left-24 w-5 h-5 text-red-600" strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 max-w-[120px] flex gap-2.5 items-center justify-center px-3 py-3.5 relative">
                    <p className="text-xs font-[425] leading-4 text-gray-700">
                      {topic.confidence.mean.toFixed(2)}
                    </p>
                    {isLowConfidence && (
                      <AlertTriangle className="absolute left-[76px] w-5 h-5 text-red-600" strokeWidth={2} />
                    )}
                  </div>
                  <div className="flex-1 max-w-[120px] flex gap-2.5 items-center justify-center px-3 py-3.5">
                    <p className="text-xs font-[425] leading-4 text-gray-700">
                      {topic.runtime_seconds.mean.toFixed(1)}
                    </p>
                  </div>
                  <div className="w-[119px] flex gap-2.5 items-start justify-center px-3 py-3.5">
                    <p className="text-xs font-[425] leading-4 text-gray-700">
                      {topic.occurrence}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Statistical Summary Table */}
      {activeTab === "statistical" && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-clip rounded-[inherit]">
            {/* Table Header */}
            <div className="flex items-start border-b border-gray-300">
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Topic</p>
              </div>
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Std Dev (ASR)</p>
              </div>
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Variance (ASR)</p>
              </div>
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">IQR (ASR)</p>
              </div>
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Range (ASR)</p>
              </div>
            </div>

            {/* Table Rows */}
            {allTopics.map((topic, index) => {
              const stdDev = topic.attack_success_rate?.std_dev ?? 0;
              const variance = topic.attack_success_rate?.variance ?? 0;
              const iqr = topic.attack_success_rate?.iqr ?? 0;
              const rangeMin = topic.attack_success_rate?.range?.min ?? 0;
              const rangeMax = topic.attack_success_rate?.range?.max ?? 0;

              return (
                <div key={`${topic.policyId}-${index}`} className="flex items-start">
                  <div className="flex-1 flex gap-2.5 items-center p-3">
                    <p className="text-[0.8125rem] font-[425] leading-5 text-gray-900">
                      {topic.topic_name}
                    </p>
                  </div>
                  <div className="flex-1 flex gap-2.5 items-center justify-center p-3">
                    <p className="text-xs font-[425] leading-4 text-gray-700">
                      {stdDev.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1 flex gap-2.5 items-center justify-center p-3">
                    <p className="text-xs font-[425] leading-4 text-gray-700">
                      {variance.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1 flex gap-2.5 items-center justify-center p-3">
                    <p className="text-xs font-[425] leading-4 text-gray-700">
                      {iqr.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1 flex gap-2.5 items-center justify-center p-3">
                    <p className="text-xs font-[425] leading-4 text-gray-700">
                      {rangeMin.toFixed(2)} - {rangeMax.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Regression Analysis Table */}
      {activeTab === "regression" && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-clip rounded-[inherit]">
            {/* Table Header */}
            <div className="flex items-start border-b border-gray-300">
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Topic</p>
              </div>
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Odds Ratio</p>
              </div>
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">P-Value</p>
              </div>
              <div className="flex-1 bg-gray-100 flex gap-2.5 items-center justify-center px-3 py-2">
                <p className="text-[0.8125rem] font-[425] leading-5 text-gray-600">Significance</p>
              </div>
            </div>

            {/* Table Rows */}
            {allTopics.map((topic, index) => {
              const oddsRatio = topic.logistic_regression?.odds_ratio ?? 0;
              const pValue = topic.logistic_regression?.p_value ?? 0;
              const significance = topic.logistic_regression?.significance ?? false;

              return (
                <div key={`${topic.policyId}-${index}`} className="flex items-start">
                  <div className="flex-1 flex gap-2.5 items-center p-3">
                    <p className="text-[0.8125rem] font-[425] leading-5 text-gray-900">
                      {topic.topic_name}
                    </p>
                  </div>
                  <div className="flex-1 flex gap-2.5 items-center justify-center p-3">
                    <p className="text-xs font-[425] leading-4 text-gray-700">
                      {oddsRatio.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex-1 flex gap-2.5 items-center justify-center p-3">
                    <p className="text-xs font-[425] leading-4 text-gray-700">
                      {pValue.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex-1 flex gap-2.5 items-center justify-center p-3">
                    <p className={`text-xs font-[425] leading-4 ${significance ? 'text-green-600' : 'text-gray-700'}`}>
                      {significance ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
