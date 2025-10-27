import { useMemo, Fragment, useState } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { Line, LineChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import useMeasure from "react-use-measure";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopicAnalysis, Policy, JailbreakEvaluationResult } from "../../../types/jailbreak-evaluation";
import { PolicyViewSheet } from "./policy-view-sheet";
import { ConversationsDialog } from "./conversations-dialog";
import { Button } from "@/components/ui/button";
import { filterConversations } from "../../../lib/conversation-filters";
import { JailbreakStrategy } from "../../../strategies/jailbreak-strategy";

interface TopicAnalysisSectionProps {
  topicAnalysis: TopicAnalysis;
  policies?: Policy[]; // Full policy definitions from config
  riskPredictions?: any; // Risk predictions analysis
  evaluationResults?: JailbreakEvaluationResult[]; // Evaluation results for filtering
}

export function TopicAnalysisSection({ topicAnalysis, policies: configPolicies, riskPredictions, evaluationResults }: TopicAnalysisSectionProps) {
  const [viewPolicySheetOpen, setViewPolicySheetOpen] = useState(false);
  const [selectedPolicyName, setSelectedPolicyName] = useState<string | null>(null);
  const [expandedRegressionRow, setExpandedRegressionRow] = useState<string | null>(null);

  // Dialog state for showing conversations
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<JailbreakEvaluationResult[]>([]);

  // Strategy instance for dialog
  const strategy = useMemo(() => new JailbreakStrategy(), []);

  // Keep policies grouped for display
  const policies = topicAnalysis.source.policies;
  if (!policies || policies.length === 0) return null;

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
    <div className="max-w-4xl mx-auto space-y-4 my-8">
      {/* Header and Insights */}
      <div className="space-y-3 pt-4 pb-2 rounded-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5  px-3">
            <p className="text-sm font-550 leading-4 text-gray-900">
              {policies.length > 1
                ? 'Attack Areas of Interest'
                : `Attack Area of Interest: ${policies[0].policy_name}`
              }
            </p>
          </div>
        </div>

        {/* Policy Cards - Show when multiple policies */}
        {policies.length > 1 && (
          <div className="grid gap-3 pt-1 px-3" style={{ gridTemplateColumns: `repeat(${Math.min(policies.length, 3)}, 1fr)` }}>
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

        <div className="space-y-2 px-3">
          <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
            {displayInsights}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="breakdown" className="px-3 px-0.5 space-y-4 ">
        <TabsList>
          <TabsTrigger value="breakdown">Topic Breakdown</TabsTrigger>
          <TabsTrigger value="statistical">Statistical Summary</TabsTrigger>
          <TabsTrigger value="regression">Risk Analysis</TabsTrigger>
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
                      <TableCell colSpan={5} className="h-8 pl-3 font-550 text-gray-900 overflow-hidden">
                        <div className="truncate max-w-full">
                          {policy.policy_name}
                        </div>
                      </TableCell>
                    </TableRow>
                    {/* Topics for this policy */}
                    {policy.topics.map((topic, topicIndex) => {
                      // ASR is already a percentage (0-100), not a decimal (0-1)
                      // Show warning icon only if ASR > 75%
                      const isHighRiskASR = topic.attack_success_rate.mean > 75;
                      const isLowConfidence = topic.confidence.mean < 0.5;

                      // Calculate attack success count
                      const attackSuccessCount = Math.round((topic.attack_success_rate.mean / 100) * topic.occurrence);

                      return (
                        <TableRow key={`${policy.id}-${topicIndex}`}>
                          <TableCell className="text-gray-900 pl-6 truncate max-w-40">
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
                          <TableCell className="text-right pr-1">
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
                      <TableCell colSpan={5} className="h-8 pl-3 font-550 text-gray-900 overflow-hidden">
                        <div className="truncate max-w-full">
                          {policy.policy_name}
                        </div>
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
                          <TableCell className="pl-6 text-gray-900 truncate max-w-40">
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
                      // Find matching risk prediction for this topic
                      const matchingPrediction = riskPredictions?.by_topic?.find(
                        (pred: any) =>
                          pred.entity_name === topic.topic_name &&
                          pred.entity_type === 'topic'
                      );

                      // Use values from risk prediction if available, otherwise fallback to topic's logistic regression
                      const oddsRatio = matchingPrediction?.odds_ratio ?? topic.logistic_regression?.odds_ratio ?? 0;
                      const pValue = matchingPrediction?.p_value ?? topic.logistic_regression?.p_value ?? 0;
                      const significance = matchingPrediction ? (matchingPrediction.significance === 'high' || matchingPrediction.significance === 'medium') : (topic.logistic_regression?.significance ?? false);
                      const beta = matchingPrediction?.beta ?? topic.logistic_regression?.beta ?? 0;
                      const ciLower = matchingPrediction?.ci_lower ?? topic.logistic_regression?.ci_lower ?? 0;
                      const ciUpper = matchingPrediction?.ci_upper ?? topic.logistic_regression?.ci_upper ?? 0;

                      const rowKey = `${policy.id}-${topicIndex}`;
                      const isExpanded = expandedRegressionRow === rowKey;

                      // Calculate comparison data
                      const topicSuccessRate = topic.attack_success_rate.mean;
                      const overallSuccessRate = allTopics.reduce((sum, t) => sum + t.attack_success_rate.mean, 0) / allTopics.length;

                      return (
                        <ExpandableRegressionRow
                          key={rowKey}
                          isExpanded={isExpanded}
                          onToggle={() => setExpandedRegressionRow(isExpanded ? null : rowKey)}
                          topic={topic}
                          oddsRatio={oddsRatio}
                          pValue={pValue}
                          significance={significance}
                          beta={beta}
                          ciLower={ciLower}
                          ciUpper={ciUpper}
                          topicSuccessRate={topicSuccessRate}
                          overallSuccessRate={overallSuccessRate}
                        />
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

      {/* Conversations Dialog */}
      <ConversationsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        conversations={filteredConversations}
        title={''}
        strategy={strategy as any}
      />
    </div>
  );
}

// Expandable Regression Row Component with Framer Motion
function ExpandableRegressionRow({
  isExpanded,
  onToggle,
  topic,
  oddsRatio,
  pValue,
  significance,
  beta,
  ciLower,
  ciUpper,
  topicSuccessRate,
  overallSuccessRate,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  topic: any;
  oddsRatio: number;
  pValue: number;
  significance: boolean;
  beta: number;
  ciLower: number;
  ciUpper: number;
  topicSuccessRate: number;
  overallSuccessRate: number;
}) {
  const [heightRef, { height }] = useMeasure();

  return (
    <Fragment>
      <TableRow
        className={`cursor-pointer ${isExpanded ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-gray-50'}`}
        onClick={onToggle}
      >
        <TableCell className="pl-2 text-gray-900">
          <div className="flex items-center gap-1">
            <ChevronRight
              className={`w-3 h-3 text-gray-600 flex-shrink-0 transition-transform duration-200 ${
                isExpanded ? 'rotate-90' : ''
              }`}
            />
            <span>{topic.topic_name}</span>
          </div>
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

      {/* Expanded Row with Animated Height */}
      <TableRow className="border-0 hover:bg-transparent">
        <TableCell colSpan={4} className="bg-gray-0 p-0 h-0">
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? height : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div ref={heightRef}>
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4"
                  >
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left: Logistic Regression S-Curve */}
                      <div className="space-y-3">
                        <div className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                          <TopicRegressionChart
                            beta={beta}
                            ciLower={ciLower}
                            ciUpper={ciUpper}
                          />
                        </div>
                      </div>

                      {/* Right: Comparison Chart */}
                      <div className="space-y-3">
                        <div className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                          <TopicComparisonChart
                            topicRate={topicSuccessRate}
                            overallAverage={overallSuccessRate}
                            topicName={topic.topic_name}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

// Logistic Regression S-Curve Component for Topics
function TopicRegressionChart({
  beta,
  ciLower,
  ciUpper
}: {
  beta: number;
  ciLower: number;
  ciUpper: number;
}) {
  // Generate S-curve data points based on logistic function
  const dataPoints = [];
  for (let i = 0; i <= 100; i += 5) {
    const x = (i - 50) / 25; // Normalize x to range around 0
    const y = 100 / (1 + Math.exp(-(beta * x)));
    dataPoints.push({
      x: i,
      probability: Math.max(0, Math.min(100, y))
    });
  }

  const chartConfig = {
    probability: {
      label: "Probability (%)",
      color: "var(--chart-1)", // red-500
    },
  } satisfies ChartConfig;




  return (
    <div>
      <h4 className="text-sm font-450 text-gray-900 pb-4">Logistic Regression Curve</h4>
      <ChartContainer config={chartConfig} className="h-[210px] w-full">
        <LineChart data={dataPoints} margin={{ left: 4, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis
            dataKey="x"
            label={{ value: 'Input Variable', position: 'insideBottom', offset: -4, className: 'text-xs fill-gray-600' }}
            className="text-xs "
            interval={4}
          />
          <YAxis
            className="text-xs "
            width={24}
            interval={0}
            
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="probability"
            stroke="var(--color-probability)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-600">Coefficient (β): </span>
          <span className="font-450 text-gray-900">{beta > 0 ? '+' : ''}{beta.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-gray-600">95% CI: </span>
          <span className="font-450 text-gray-900">[{ciLower.toFixed(2)}, {ciUpper.toFixed(2)}]</span>
        </div>
      </div>
    </div>
  );
}

// Comparison Bar Chart Component for Topics
function TopicComparisonChart({
  topicRate,
  overallAverage,
  topicName
}: {
  topicRate: number;
  overallAverage: number;
  topicName: string;
}) {
  const data = [
    {
      name: 'Overall Average',
      rate: overallAverage,
    },
    {
      name: topicName,
      rate: topicRate,
    },
  ];

  const chartConfig = {
    rate: {
      label: "Success Rate (%)",
      color: 'var(--chart-1)', // blue-500
    },
  } satisfies ChartConfig;

  return (
    <div>
      <h4 className="text-sm font-450 text-gray-900 pb-4">Comparison vs Overall Average</h4>
      <ChartContainer config={chartConfig} className="h-[210px] w-full">
        <BarChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
          <XAxis
            dataKey="name"
            className="text-xs fill-gray-600"
            tick={{ fontSize: 10 }}
            interval={0}
          />
          <YAxis
            className="text-xs fill-gray-600"
            domain={[0, 100]}
             width={24}
            interval={0}
          />
          <ChartTooltip
            content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(1)}%`} />}
          />
          <Bar
            dataKey="rate"
            fill="var(--color-rate)"
            radius={[4, 4, 0, 0]}
            barSize={32}
          />
        </BarChart>
      </ChartContainer>
      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
        <p className="flex items-center gap-1">
        
          <span className={`inline-flex items-center px-1 py-0 rounded-full text-xs font-450 ${
            (topicRate - overallAverage) > 0
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {(topicRate - overallAverage) > 0 ? '+' : ''}{(topicRate - overallAverage).toFixed(1)}%
          </span> difference from overall average
        </p>
      </div>
    </div>
  );
}

