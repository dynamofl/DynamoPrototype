import { useMemo, Fragment, useState, ReactNode } from "react";
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
import { Button } from "@/components/ui/button";

/**
 * Column configuration for topic breakdown table
 */
export interface TopicBreakdownColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render: (topic: any, policy: any) => ReactNode;
  showWarning?: (topic: any) => boolean;
  warningCondition?: (value: number) => boolean;
}

/**
 * Column configuration for statistical summary table
 */
export interface StatisticalSummaryColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'right' | 'center';
  render: (topic: any) => ReactNode;
}

/**
 * Props for generic topic analysis section
 */
export interface GenericTopicAnalysisSectionProps {
  topicAnalysis: any;
  evaluationType: 'jailbreak' | 'compliance' | 'hallucination';

  // Column configurations
  breakdownColumns: TopicBreakdownColumn[];
  statisticalColumns: StatisticalSummaryColumn[];

  // Labels and text
  title?: string | ((policies: any[]) => string);
  insightsText?: string;

  // Optional features
  showRiskAnalysis?: boolean;
  riskPredictions?: any;

  // Click handlers
  onTopicClick?: (topicName: string, policyName: string) => void;

  // Comparison metric name for charts (e.g., "Attack Success Rate", "Accuracy")
  comparisonMetricName?: string;
  comparisonMetricKey?: string; // Key to access the metric in topic data (e.g., "attack_success_rate", "accuracy")
}

export function GenericTopicAnalysisSection({
  topicAnalysis,
  evaluationType,
  breakdownColumns,
  statisticalColumns,
  title,
  insightsText,
  showRiskAnalysis = true,
  riskPredictions,
  onTopicClick,
  comparisonMetricName = "Success Rate",
  comparisonMetricKey = "attack_success_rate"
}: GenericTopicAnalysisSectionProps) {
  const [expandedRegressionRow, setExpandedRegressionRow] = useState<string | null>(null);

  // Keep policies grouped for display
  const policies = topicAnalysis.source.policies;
  if (!policies || policies.length === 0) return null;

  // Flatten all topics for statistics calculations
  const allTopics = policies.flatMap((policy: any) =>
    policy.topics.map((topic: any) => ({
      ...topic,
      policyId: policy.id,
      policyName: policy.policy_name
    }))
  );

  // Calculate summary statistics for the insights text
  const totalPrompts = allTopics.reduce((sum: number, topic: any) => sum + topic.occurrence, 0);
  const uniqueTopics = allTopics.length;
  const avgConfidence = allTopics.reduce((sum: number, topic: any) => sum + topic.confidence.mean, 0) / allTopics.length;

  // Get primary metric range (attack_success_rate for jailbreak, accuracy for compliance)
  const primaryMetricValues = allTopics.map((t: any) => t[comparisonMetricKey]?.mean || 0);
  const metricRange = {
    min: Math.min(...primaryMetricValues),
    max: Math.max(...primaryMetricValues)
  };

  // Generate dynamic insights if not provided
  const displayInsights = insightsText || topicAnalysis.topic_insight ||
    `The topic-level view covers ${totalPrompts} prompts across ${uniqueTopics} topic${uniqueTopics > 1 ? 's' : ''} spanning ${policies.length} ${policies.length > 1 ? 'policies' : 'policy'}. ${comparisonMetricName} varied widely, ranging from ${Math.round(metricRange.min)}% to ${Math.round(metricRange.max)}% per topic, with an average confidence of ${avgConfidence.toFixed(2)}. This breakdown highlights where failures are most concentrated and where defenses are holding.`;

  // Generate title
  const displayTitle = typeof title === 'function' ? title(policies) :
    title || (policies.length > 1
      ? 'Attack Areas of Interest'
      : `Attack Area of Interest: ${policies[0].policy_name}`);

  return (
    <div className="max-w-4xl mx-auto space-y-4 my-8">
      {/* Header and Insights */}
      <div className="space-y-3 pt-4 pb-2 rounded-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 px-3">
            <p className="text-sm font-550 leading-4 text-gray-900">
              {displayTitle}
            </p>
          </div>
        </div>

        <div className="space-y-2 px-3">
          <p className="text-sm font-[425] leading-5 text-gray-600 leading-relaxed">
            {displayInsights}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="breakdown" className="px-3 px-0.5 space-y-4">
        <TabsList>
          <TabsTrigger value="breakdown">Topic Breakdown</TabsTrigger>
          <TabsTrigger value="statistical">Statistical Summary</TabsTrigger>
          {showRiskAnalysis && <TabsTrigger value="regression">Risk Analysis</TabsTrigger>}
        </TabsList>

        {/* Topic Breakdown Table */}
        <TabsContent value="breakdown" className="mt-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 border-0 hover:bg-gray-100">
                  {breakdownColumns.map(col => (
                    <TableHead
                      key={col.key}
                      className={`font-450 ${col.width ? col.width : ''} ${
                        col.align === 'right' ? 'text-right' :
                        col.align === 'center' ? 'text-center' : ''
                      } ${col.key === breakdownColumns[0].key ? 'pl-3' : ''}`}
                    >
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy: any) => (
                  <Fragment key={`policy-${policy.id}`}>
                    {/* Policy Header Row */}
                    {policies.length > 1 && (
                      <TableRow className="border-t border-gray-200">
                        <TableCell colSpan={breakdownColumns.length} className="h-8 pl-3 font-550 text-gray-900 overflow-hidden">
                          <div className="truncate max-w-full">
                            {policy.policy_name}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Topics for this policy */}
                    {policy.topics.map((topic: any, topicIndex: number) => (
                      <TableRow key={`${policy.id}-${topicIndex}`}>
                        {breakdownColumns.map((col, colIndex) => (
                          <TableCell
                            key={`${policy.id}-${topicIndex}-${col.key}`}
                            className={`${
                              colIndex === 0
                                ? `text-gray-900 ${policies.length > 1 ? "pl-6" : "pl-3"} truncate max-w-40`
                                : col.align === 'right' ? 'text-right' : ''
                            } ${colIndex === breakdownColumns.length - 1 ? 'pr-1' : ''}`}
                          >
                            {col.render(topic, policy)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Statistical Summary Table */}
        <TabsContent value="statistical" className="mt-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 border-0 hover:bg-gray-100">
                  {statisticalColumns.map(col => (
                    <TableHead
                      key={col.key}
                      className={`font-450 ${col.width ? col.width : ''} ${
                        col.align === 'right' ? 'text-right' :
                        col.align === 'center' ? 'text-center' : ''
                      } ${col.key === statisticalColumns[0].key ? 'pl-3' : ''}`}
                    >
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy: any) => (
                  <Fragment key={`policy-stat-${policy.id}`}>
                    {/* Policy Header Row */}
                    {policies.length > 1 && (
                      <TableRow className="border-t border-gray-200">
                        <TableCell colSpan={statisticalColumns.length} className="h-8 pl-3 font-550 text-gray-900 overflow-hidden">
                          <div className="truncate max-w-full">
                            {policy.policy_name}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {/* Topics for this policy */}
                    {policy.topics.map((topic: any, topicIndex: number) => (
                      <TableRow key={`${policy.id}-stat-${topicIndex}`}>
                        {statisticalColumns.map((col, colIndex) => (
                          <TableCell
                            key={`${policy.id}-stat-${topicIndex}-${col.key}`}
                            className={`${
                              colIndex === 0
                                ? `text-gray-900 ${policies.length > 1 ? "pl-6" : "pl-3"} truncate max-w-40`
                                : col.align === 'right' ? 'text-right' : ''
                            }`}
                          >
                            {col.render(topic)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Regression Analysis Table */}
        {showRiskAnalysis && (
          <TabsContent value="regression" className="mt-0">
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100 border-0 hover:bg-gray-100">
                    <TableHead className="pl-3 font-450">Attack Area</TableHead>
                    <TableHead className="font-450 text-right w-[120px]">Odds Ratio</TableHead>
                    <TableHead className="font-450 text-right w-[120px]">P-Value</TableHead>
                    <TableHead className="font-450 text-right w-[120px]">Significance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {policies.map((policy: any) => (
                    <Fragment key={`policy-reg-${policy.id}`}>
                      {/* Policy Header Row */}
                      {policies.length > 1 && (
                        <TableRow className="border-t border-gray-200">
                          <TableCell colSpan={4} className="h-8 pl-3 font-550 text-gray-900 overflow-hidden">
                            <div className="truncate max-w-full">
                              {policy.policy_name}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      {/* Topics for this policy */}
                      {policy.topics.map((topic: any, topicIndex: number) => {
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
                        const topicSuccessRate = topic[comparisonMetricKey]?.mean || 0;
                        const overallSuccessRate = allTopics.reduce((sum: number, t: any) => sum + (t[comparisonMetricKey]?.mean || 0), 0) / allTopics.length;

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
                            comparisonMetricName={comparisonMetricName}
                          />
                        );
                      })}
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        )}
      </Tabs>
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
  comparisonMetricName
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
  comparisonMetricName: string;
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
                            metricName={comparisonMetricName}
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
            className="text-xs"
            interval={4}
          />
          <YAxis
            className="text-xs"
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
  topicName,
  metricName
}: {
  topicRate: number;
  overallAverage: number;
  topicName: string;
  metricName: string;
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
      label: `${metricName} (%)`,
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
