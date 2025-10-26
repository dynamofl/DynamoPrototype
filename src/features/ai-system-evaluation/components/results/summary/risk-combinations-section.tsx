import { useState, useMemo } from "react";
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
import type { RiskCombinationsAnalysis, RiskCombinationMetrics } from "../../../types/jailbreak-evaluation";

interface RiskCombinationsSectionProps {
  riskCombinations: RiskCombinationsAnalysis;
}

export function RiskCombinationsSection({ riskCombinations }: RiskCombinationsSectionProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'level' | 'granular' | 'policy-level' | 'policy-granular'>('level');

  if (!riskCombinations || !riskCombinations.combinations || riskCombinations.combinations.length === 0) {
    return null;
  }

  const { combinations, threshold, granular_count, level_count, policy_granular_count, policy_level_count } = riskCombinations;

  // Separate combinations by type
  const granularCombinations = useMemo(() =>
    combinations.filter(c => c.combination_type === 'granular'),
    [combinations]
  );

  const levelCombinations = useMemo(() =>
    combinations.filter(c => c.combination_type === 'level'),
    [combinations]
  );

  const policyGranularCombinations = useMemo(() =>
    combinations.filter(c => c.combination_type === 'policy-granular'),
    [combinations]
  );

  const policyLevelCombinations = useMemo(() =>
    combinations.filter(c => c.combination_type === 'policy-level'),
    [combinations]
  );

  // Toggle row expansion (only one row can be expanded at a time)
  const toggleRow = (key: string) => {
    setExpandedRow(expandedRow === key ? null : key);
  };

  // Calculate overall average for comparison
  const overallAverage = combinations.reduce((sum, c) => sum + c.attack_success_rate, 0) / combinations.length;

  return (
    <div className="max-w-4xl mx-auto space-y-4 my-4">
      {/* Header and Description */}
      <div className="space-y-3 pt-4 rounded-xl px-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <p className="text-lg font-450 leading-4 text-gray-900">
              Risk Combinations
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2 py-2">
          <p className="text-[0.9375rem] font-[425] leading-5 text-gray-600 leading-relaxed">
            This section highlights the most statistically significant combinations
            that contribute to high-risk outcomes (attack success rate &gt; {threshold}%).
            View combinations for both <strong>topics</strong> and <strong>policies</strong>
            across <strong>attack levels</strong> and <strong>individual attack types</strong>.
          </p>
        </div>
      </div>

      {/* Tabs for all combination types */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="px-3">
        <TabsList>
          <TabsTrigger value="level">
            Topic × Attack Level ({level_count})
          </TabsTrigger>
          <TabsTrigger value="granular">
            Topic × Attack Type ({granular_count})
          </TabsTrigger>
          <TabsTrigger value="policy-level">
            Policy × Attack Level ({policy_level_count})
          </TabsTrigger>
          <TabsTrigger value="policy-granular">
            Policy × Attack Type ({policy_granular_count})
          </TabsTrigger>
        </TabsList>

        {/* Level Combinations Tab */}
        <TabsContent value="level" className="mt-4">
          {levelCombinations.length > 0 ? (
            <RiskCombinationsTable
              combinations={levelCombinations}
              expandedRow={expandedRow}
              toggleRow={toggleRow}
              overallAverage={overallAverage}
              isLevelView={true}
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              No attack level combinations meet the threshold criteria.
            </div>
          )}
        </TabsContent>

        {/* Granular Combinations Tab */}
        <TabsContent value="granular" className="mt-4">
          {granularCombinations.length > 0 ? (
            <RiskCombinationsTable
              combinations={granularCombinations}
              expandedRow={expandedRow}
              toggleRow={toggleRow}
              overallAverage={overallAverage}
              isLevelView={false}
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              No individual attack type combinations meet the threshold criteria.
            </div>
          )}
        </TabsContent>

        {/* Policy-Level Combinations Tab */}
        <TabsContent value="policy-level" className="mt-4">
          {policyLevelCombinations.length > 0 ? (
            <RiskCombinationsTable
              combinations={policyLevelCombinations}
              expandedRow={expandedRow}
              toggleRow={toggleRow}
              overallAverage={overallAverage}
              isLevelView={true}
              isPolicyView={true}
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              No policy × attack level combinations meet the threshold criteria.
            </div>
          )}
        </TabsContent>

        {/* Policy-Granular Combinations Tab */}
        <TabsContent value="policy-granular" className="mt-4">
          {policyGranularCombinations.length > 0 ? (
            <RiskCombinationsTable
              combinations={policyGranularCombinations}
              expandedRow={expandedRow}
              toggleRow={toggleRow}
              overallAverage={overallAverage}
              isLevelView={false}
              isPolicyView={true}
            />
          ) : (
            <div className="text-center py-8 text-gray-600">
              No policy × attack type combinations meet the threshold criteria.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable table component for both level and granular views
function RiskCombinationsTable({
  combinations,
  expandedRow,
  toggleRow,
  overallAverage,
  isLevelView,
  isPolicyView = false,
}: {
  combinations: RiskCombinationMetrics[];
  expandedRow: string | null;
  toggleRow: (key: string) => void;
  overallAverage: number;
  isLevelView: boolean;
  isPolicyView?: boolean;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 border-0 hover:bg-gray-50">
            <TableHead className="font-450 pl-3 w-12">Rank</TableHead>
            <TableHead className="font-450">{isPolicyView ? 'Policy' : 'Attack Area'}</TableHead>
            <TableHead className="font-450">{isLevelView ? 'Attack Level' : 'Attack Type'}</TableHead>
            <TableHead className="font-450 text-center w-32">Significance</TableHead>
            <TableHead className="font-450 text-right w-32">Success Rate</TableHead>
            <TableHead className="font-450 text-center w-20">Expand</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinations.map((combo, index) => {
            const areaOrPolicy = isPolicyView ? combo.policy_name : combo.attack_area;
            const rowKey = `${combo.combination_type}-${areaOrPolicy}-${combo.attack_type || combo.attack_level}`;
            const isExpanded = expandedRow === rowKey;
            const isHighSignificance = combo.significance === 'high';
            const isMediumSignificance = combo.significance === 'medium';
            const displayValue = isLevelView ? combo.attack_level : combo.attack_type;

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
                    {areaOrPolicy}
                  </TableCell>
                  <TableCell className="text-gray-900">
                    {displayValue}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-450 ${
                      isHighSignificance
                        ? 'bg-red-100 text-red-700'
                        : isMediumSignificance
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {combo.significance.charAt(0).toUpperCase() + combo.significance.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-gray-900 font-450">
                    {combo.attack_success_rate.toFixed(1)}%
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
                    <TableCell colSpan={6} className="bg-gray-50 p-6">
                      <div className="grid grid-cols-2 gap-6">
                        {/* Left: Logistic Regression S-Curve */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-450 text-gray-900">
                            Logistic Regression Curve
                          </h4>
                          <div className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                            <RegressionChart
                              beta={combo.beta}
                              attackSuccessRate={combo.attack_success_rate}
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
                              comboRate={combo.attack_success_rate}
                              overallAverage={overallAverage}
                              attackArea={areaOrPolicy || ''}
                              attackTypeOrLevel={displayValue || ''}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Statistical metrics */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-6">
                            <div>
                              <span className="text-gray-600">Coefficient (β): </span>
                              <span className="font-450 text-gray-900">{combo.beta > 0 ? '+' : ''}{combo.beta.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Odds Ratio: </span>
                              <span className="font-450 text-gray-900">{combo.odds_ratio.toFixed(2)}×</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div>
                              <span className="text-gray-600">P-Value: </span>
                              <span className="font-450 text-gray-900">{combo.p_value.toFixed(4)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Significance: </span>
                              <span className={`inline-flex px-2 py-0.5 rounded text-xs font-450 ${
                                isHighSignificance
                                  ? 'bg-red-100 text-red-700'
                                  : isMediumSignificance
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}>
                                {combo.significance.charAt(0).toUpperCase() + combo.significance.slice(1)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div>
                              <span className="text-gray-600">Attack Success Rate: </span>
                              <span className="font-450 text-gray-900">{combo.attack_success_rate.toFixed(1)}%</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Occurrences: </span>
                              <span className="font-450 text-gray-900">{combo.occurrence}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div>
                              <span className="text-gray-600">Confidence Interval: </span>
                              <span className="font-450 text-gray-900">
                                [{combo.ci_lower.toFixed(2)}, {combo.ci_upper.toFixed(2)}]
                              </span>
                            </div>
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
  comboRate,
  overallAverage,
  attackArea,
  attackTypeOrLevel
}: {
  comboRate: number;
  overallAverage: number;
  attackArea: string;
  attackTypeOrLevel: string;
}) {
  const data = [
    {
      name: 'Overall Average',
      rate: overallAverage,
    },
    {
      name: `${attackArea} × ${attackTypeOrLevel}`,
      rate: comboRate,
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
