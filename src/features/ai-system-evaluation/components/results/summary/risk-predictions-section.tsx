import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Line, LineChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { RiskPredictionsAnalysis, RiskPredictionMetric } from "../../../types/jailbreak-evaluation";

interface RiskPredictionsSectionProps {
  riskPredictions: RiskPredictionsAnalysis;
}

export function RiskPredictionsSection({ riskPredictions }: RiskPredictionsSectionProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'topic' | 'attack_type' | 'attack_level' | 'policy'>('topic');

  if (!riskPredictions) {
    return null;
  }

  const { by_topic, by_attack_type, by_attack_level, by_policy, total_topics, total_attack_types, total_attack_levels, total_policies } = riskPredictions;

  // Toggle row expansion (only one row can be expanded at a time)
  const toggleRow = (key: string) => {
    setExpandedRow(expandedRow === key ? null : key);
  };

  // Calculate overall average for comparison (from all entities)
  const allPredictions = [...by_topic, ...by_attack_type, ...by_attack_level, ...by_policy];
  const overallAverage = allPredictions.length > 0
    ? allPredictions.reduce((sum, p) => sum + p.attack_success_rate, 0) / allPredictions.length
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-4 my-4">
      {/* Header and Description */}
      <div className="space-y-3 pt-4 rounded-xl px-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <p className="text-lg font-450 leading-4 text-gray-900">
              Risk Predictions
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 py-2">
          <p className="text-[0.9375rem] font-[425] leading-5 text-gray-600 leading-relaxed">
            Individual risk predictions using logistic regression for each entity:
            <strong> topics</strong>, <strong>attack types</strong>, <strong>attack levels</strong>, and <strong>policies</strong>.
            These predictions identify which individual entities have the highest attack success rates and statistical significance.
          </p>
        </div>
      </div>

      {/* Tabs for different entity types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="px-3">
        <TabsList>
          <TabsTrigger value="topic">
            Topics ({total_topics})
          </TabsTrigger>
          <TabsTrigger value="attack_type">
            Attack Types ({total_attack_types})
          </TabsTrigger>
          <TabsTrigger value="attack_level">
            Attack Levels ({total_attack_levels})
          </TabsTrigger>
          <TabsTrigger value="policy">
            Policies ({total_policies})
          </TabsTrigger>
        </TabsList>

        {/* Topic Tab */}
        <TabsContent value="topic" className="mt-4">
          {by_topic.length > 0 ? (
            <RiskPredictionsTable
              predictions={by_topic}
              expandedRow={expandedRow}
              toggleRow={toggleRow}
              overallAverage={overallAverage}
              entityLabel="Topic"
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              No topic risk predictions available.
            </div>
          )}
        </TabsContent>

        {/* Attack Type Tab */}
        <TabsContent value="attack_type" className="mt-4">
          {by_attack_type.length > 0 ? (
            <RiskPredictionsTable
              predictions={by_attack_type}
              expandedRow={expandedRow}
              toggleRow={toggleRow}
              overallAverage={overallAverage}
              entityLabel="Attack Type"
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              No attack type risk predictions available.
            </div>
          )}
        </TabsContent>

        {/* Attack Level Tab */}
        <TabsContent value="attack_level" className="mt-4">
          {by_attack_level.length > 0 ? (
            <RiskPredictionsTable
              predictions={by_attack_level}
              expandedRow={expandedRow}
              toggleRow={toggleRow}
              overallAverage={overallAverage}
              entityLabel="Attack Level"
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              No attack level risk predictions available.
            </div>
          )}
        </TabsContent>

        {/* Policy Tab */}
        <TabsContent value="policy" className="mt-4">
          {by_policy.length > 0 ? (
            <RiskPredictionsTable
              predictions={by_policy}
              expandedRow={expandedRow}
              toggleRow={toggleRow}
              overallAverage={overallAverage}
              entityLabel="Policy"
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              No policy risk predictions available.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable table component for all entity types
function RiskPredictionsTable({
  predictions,
  expandedRow,
  toggleRow,
  overallAverage,
  entityLabel,
}: {
  predictions: RiskPredictionMetric[];
  expandedRow: string | null;
  toggleRow: (key: string) => void;
  overallAverage: number;
  entityLabel: string;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-0 hover:bg-gray-50">
            <TableHead className="font-450 pl-3 w-12">Rank</TableHead>
            <TableHead className="font-450">{entityLabel}</TableHead>
            <TableHead className="font-450 text-right w-32">Coefficient (β)</TableHead>
            <TableHead className="font-450 text-right w-28">Odds Ratio</TableHead>
            <TableHead className="font-450 text-right w-24">P-Value</TableHead>
            <TableHead className="font-450 text-center w-32">Significance</TableHead>
            <TableHead className="font-450 text-right w-32">Success Rate</TableHead>
            <TableHead className="font-450 text-center w-20">Expand</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {predictions.map((prediction, index) => {
            const rowKey = `${prediction.entity_type}-${prediction.entity_name}`;
            const isExpanded = expandedRow === rowKey;
            const isHighSignificance = prediction.significance === 'high';
            const isMediumSignificance = prediction.significance === 'medium';

            return (
              <>
                {/* Main row */}
                <TableRow
                  key={rowKey}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => toggleRow(rowKey)}
                >
                  <TableCell className="pl-3 text-gray-900 font-450">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {prediction.entity_name}
                  </TableCell>
                  <TableCell className="text-right text-gray-900">
                    {prediction.beta > 0 ? '+' : ''}{prediction.beta.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-gray-900">
                    {prediction.odds_ratio.toFixed(2)}×
                  </TableCell>
                  <TableCell className="text-right text-gray-900">
                    {prediction.p_value.toFixed(4)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-450 ${
                      isHighSignificance
                        ? 'bg-red-100 text-red-700'
                        : isMediumSignificance
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {prediction.significance.charAt(0).toUpperCase() + prediction.significance.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-gray-900 font-450">
                    {prediction.attack_success_rate.toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(rowKey);
                      }}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </TableCell>
                </TableRow>

                {/* Expanded row with charts */}
                {isExpanded && (
                  <TableRow key={`expanded-${rowKey}`}>
                    <TableCell colSpan={8} className="bg-gray-50 p-6">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left: Logistic Regression S-Curve */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-450 text-gray-900">
                            Logistic Regression Curve
                          </h4>
                          <div className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                            <RegressionChart
                              beta={prediction.beta}
                              attackSuccessRate={prediction.attack_success_rate}
                            />
                          </div>
                        </div>

                        {/* Right: Comparison Chart */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-450 text-gray-900">
                            Comparison vs Overall Average
                          </h4>
                          <div className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                            <ComparisonChart
                              entityRate={prediction.attack_success_rate}
                              overallAverage={overallAverage}
                              entityName={prediction.entity_name}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Additional stats */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-gray-600">Attack Success Rate: </span>
                            <span className="font-450 text-gray-900">{prediction.attack_success_rate.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Occurrences: </span>
                            <span className="font-450 text-gray-900">{prediction.occurrence}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">CI: </span>
                            <span className="font-450 text-gray-900">
                              [{prediction.ci_lower.toFixed(2)}, {prediction.ci_upper.toFixed(2)}]
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Logistic Regression S-Curve Component
function RegressionChart({ beta, attackSuccessRate }: { beta: number; attackSuccessRate: number }) {
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
      color: "rgb(239, 68, 68)", // red-500
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <LineChart data={dataPoints}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis
          dataKey="x"
          label={{ value: 'Input Variable', position: 'insideBottom', offset: -5, className: 'text-xs fill-gray-600' }}
          className="text-xs fill-gray-600"
        />
        <YAxis
          label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', className: 'text-xs fill-gray-600' }}
          className="text-xs fill-gray-600"
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
  );
}

// Comparison Bar Chart Component
function ComparisonChart({
  entityRate,
  overallAverage,
  entityName
}: {
  entityRate: number;
  overallAverage: number;
  entityName: string;
}) {
  const data = [
    {
      name: 'Overall Average',
      rate: overallAverage,
    },
    {
      name: entityName,
      rate: entityRate,
    },
  ];

  const chartConfig = {
    rate: {
      label: "Attack Success Rate",
      color: "rgb(59, 130, 246)", // blue-500
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
        <XAxis
          dataKey="name"
          className="text-xs fill-gray-600"
          tick={{ fontSize: 10 }}
          interval={0}
        />
        <YAxis
          label={{ value: 'Success Rate (%)', angle: -90, position: 'insideLeft', className: 'text-xs fill-gray-600' }}
          className="text-xs fill-gray-600"
          domain={[0, 100]}
        />
        <ChartTooltip
          content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(1)}%`} />}
        />
        <Bar
          dataKey="rate"
          fill="var(--color-rate)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
