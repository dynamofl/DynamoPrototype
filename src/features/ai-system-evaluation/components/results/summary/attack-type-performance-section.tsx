import { useMemo, useState, Fragment } from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, LabelList, Line, LineChart, YAxis } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import useMeasure from "react-use-measure";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import type { JailbreakEvaluationSummary, AttackType, JailbreakEvaluationResult } from "../../../types/jailbreak-evaluation";
import { ConversationsDialog } from "./conversations-dialog";
import { JailbreakStrategy } from "../../../strategies/jailbreak-strategy";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AttackTypePerformanceSectionProps {
  summary: JailbreakEvaluationSummary;
  hasGuardrails?: boolean;
  riskPredictions?: any; // Risk predictions analysis
  evaluationResults?: JailbreakEvaluationResult[]; // Evaluation results for filtering
}

// Attack level categorization
const ATTACK_LEVELS = {
  level1: {
    name: "Level 1 - Perturbations",
    description: "Simple text modifications",
    types: ["Typos", "Casing Changes", "Synonyms"] as AttackType[],
  },
  level2: {
    name: "Level 2 - Light Adversarial",
    description: "Prompt-based manipulation techniques",
    types: ["DAN", "PAP", "GCG", "Leetspeak", "ASCII Art"] as AttackType[],
  },
  level3: {
    name: "Level 3 - Expert Adversarial",
    description: "Advanced multi-turn attacks",
    types: ["TAP", "IRIS"] as AttackType[],
  },
};

export function AttackTypePerformanceSection({ summary, hasGuardrails = false, riskPredictions, evaluationResults }: AttackTypePerformanceSectionProps) {
  // State for view selection
  const [view, setView] = useState<"aiSystemOnly" | "withGuardrails">(
    hasGuardrails ? "withGuardrails" : "aiSystemOnly"
  );
  const [expandedRegressionRow, setExpandedRegressionRow] = useState<string | null>(null);

  // Dialog state for showing conversations
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState<JailbreakEvaluationResult[]>([]);
  const [selectedAttackType, setSelectedAttackType] = useState<string>('');

  // Strategy instance for dialog
  const strategy = useMemo(() => new JailbreakStrategy(), []);

  // Handler to show conversations for a specific attack type
  const handleAttackTypeClick = (attackType: string) => {
    if (!evaluationResults || evaluationResults.length === 0) return;

    // Filter conversations by attack type and only show Attack Success cases
    const filtered = evaluationResults.filter(result =>
      result.attackType === attackType &&
      result.attackOutcome === 'Attack Success'
    );

    // Add IDs to filtered results if they don't have them
    const filteredWithIds = filtered.map((result, index) => ({
      ...result,
      id: (result as any).id || `${attackType}-${index}`
    }));

    // Set dialog state
    setFilteredConversations(filteredWithIds as JailbreakEvaluationResult[]);
    setSelectedAttackType(attackType);
    setDialogOpen(true);
  };

  // Extract byAttackType data from summary based on selected view
  const byAttackType = useMemo(() => {
    if (hasGuardrails && view === "aiSystemOnly") {
      // Show AI system only data
      return summary.aiSystem?.byAttackType || {};
    }
    // Show combined data (AI system + guardrails) or regular data
    return summary.byAttackType || summary.aiSystem?.byAttackType || {};
  }, [summary, hasGuardrails, view]);

  // Check if we have data
  if (!byAttackType || Object.keys(byAttackType).length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    const data = Object.entries(byAttackType).map(([attackType, metrics]) => ({
      attackType,
      successRate: metrics.successRate,
      total: metrics.total,
      successes: metrics.successes,
      failures: metrics.failures,
      isHighRisk: metrics.successRate > 75,
    }));

    // Helper function to get attack level (3, 2, or 1)
    const getAttackLevel = (attackType: string): number => {
      if (ATTACK_LEVELS.level3.types.includes(attackType as AttackType)) return 3;
      if (ATTACK_LEVELS.level2.types.includes(attackType as AttackType)) return 2;
      if (ATTACK_LEVELS.level1.types.includes(attackType as AttackType)) return 1;
      return 0; // fallback
    };

    // Sort by level (3 -> 2 -> 1), then alphabetically within each level
    return data.sort((a, b) => {
      const levelA = getAttackLevel(a.attackType);
      const levelB = getAttackLevel(b.attackType);

      if (levelB !== levelA) {
        return levelB - levelA; // Descending order: Level 3, 2, 1
      }
      return a.attackType.localeCompare(b.attackType); // Alphabetical within level
    });
  }, [byAttackType]);

  // Calculate overall stats and level groupings
  const overallStats = useMemo(() => {
    const totalTests = chartData.reduce((sum, item) => sum + item.total, 0);
    const totalSuccesses = chartData.reduce((sum, item) => sum + item.successes, 0);
    const avgSuccessRate = totalTests > 0 ? (totalSuccesses / totalTests) * 100 : 0;
    const attackTypeCount = chartData.length;

    // Calculate level-based statistics
    const level1Tests = chartData
      .filter(item => ATTACK_LEVELS.level1.types.includes(item.attackType as AttackType))
      .reduce((sum, item) => sum + item.total, 0);
    const level2Tests = chartData
      .filter(item => ATTACK_LEVELS.level2.types.includes(item.attackType as AttackType))
      .reduce((sum, item) => sum + item.total, 0);
    const level3Tests = chartData
      .filter(item => ATTACK_LEVELS.level3.types.includes(item.attackType as AttackType))
      .reduce((sum, item) => sum + item.total, 0);

    const level1Percentage = totalTests > 0 ? Math.round((level1Tests / totalTests) * 100) : 0;
    const level2Percentage = totalTests > 0 ? Math.round((level2Tests / totalTests) * 100) : 0;
    const level3Percentage = totalTests > 0 ? Math.round((level3Tests / totalTests) * 100) : 0;

    // Count items per level
    const level3Count = chartData.filter(item =>
      ATTACK_LEVELS.level3.types.includes(item.attackType as AttackType)
    ).length;
    const level2Count = chartData.filter(item =>
      ATTACK_LEVELS.level2.types.includes(item.attackType as AttackType)
    ).length;
    const level1Count = chartData.filter(item =>
      ATTACK_LEVELS.level1.types.includes(item.attackType as AttackType)
    ).length;

    return {
      totalTests,
      totalSuccesses,
      avgSuccessRate,
      attackTypeCount,
      level1Percentage,
      level2Percentage,
      level3Percentage,
      level3Count,
      level2Count,
      level1Count
    };
  }, [chartData]);

  // Chart configuration
  const chartConfig = {
    successRate: {
      label: "Attack Success Rate",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  // Custom label component to show value and AlertTriangle for high-risk items
  const CustomLabel = (props: any) => {
    const { x, y, width, value, index } = props;
    const isHighRisk = chartData[index]?.isHighRisk;

    if (isHighRisk) {
      return (
        <g>
          <foreignObject
            x={x + width / 2 - 20}
            y={y - 22}
            width={40}
            height={20}
          >
            <div className="flex items-center gap-1 justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" strokeWidth={2} />
              <span className="text-[10px] font-450 text-gray-900">{Math.round(value)}%</span>
            </div>
          </foreignObject>
        </g>
      );
    }

    // Show only percentage for non-high-risk items
    return (
      <g>
        <text
          x={x + width / 2}
          y={y - 8}
          textAnchor="middle"
          fill="rgb(156 163 175)"
          fontSize={10}
          fontWeight={450}
        >
          {Math.round(value)}%
        </text>
      </g>
    );
  };

  // Custom X-axis tick component for multi-line labels
  const CustomXAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const lines = payload.value.split(' ');

    if (lines.length === 1) {
      return (
        <text x={x} y={y + 10} textAnchor="middle" fill="rgb(75 85 99)" fontSize={11}>
          {lines[0]}
        </text>
      );
    }

    return (
      <text x={x} y={y} textAnchor="middle" fill="rgb(75 85 99)" fontSize={11}>
        <tspan x={x} dy="1em">{lines[0]}</tspan>
        <tspan x={x} dy="1.2em">{lines[1]}</tspan>
      </text>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 my-4">
      {/* Header and Description */}
      <div className="space-y-3 pt-4 rounded-xl px-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <p className="text-sm font-550 text-gray-900">
              Attack Type Performance
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <p className="text-sm font-400  text-gray-600 leading-relaxed">
             The attacks are categorized into three levels:
            Level 1 - Perturbations ({overallStats.level1Percentage}%) includes {ATTACK_LEVELS.level1.types.join(", ")}, which are simple text modifications;
            Level 2 - Light Adversarial ({overallStats.level2Percentage}%) includes {ATTACK_LEVELS.level2.types.join(", ")}, which are prompt-based manipulation techniques;
            and Level 3 - Expert Adversarial ({overallStats.level3Percentage}%) includes {ATTACK_LEVELS.level3.types.join(", ")}, which are advanced multi-turn attacks.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="chart" className="px-3 space-y-4">
        <TabsList>
          <TabsTrigger value="chart">Attack Breakdown</TabsTrigger>
          <TabsTrigger value="regression">Risk Analysis</TabsTrigger>
        </TabsList>

        {/* Chart View */}
        <TabsContent value="chart" className="mt-0">
          <div className="border border-gray-200 rounded-lg p-3 ">
            <div className="flex items-center justify-between mb-4">
            
              {hasGuardrails && (
                <Select value={view} onValueChange={(value) => setView(value as "aiSystemOnly" | "withGuardrails")}>
                  <SelectTrigger className="w-[200px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="withGuardrails" className="text-xs">
                      AI System + Guardrails
                    </SelectItem>
                    <SelectItem value="aiSystemOnly" className="text-xs">
                      AI System Only
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <BarChart
                data={chartData}
                margin={{
                  top: 30,
                  right: 0,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid vertical={false} className="stroke-gray-200" />
                <XAxis
                  dataKey="attackType"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={<CustomXAxisTick />}
                  height={60}
                  interval={0}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="line"
                      labelFormatter={(value) => `Attack Type: ${value}`}
                      formatter={(value, name, item) => [
                        `${Number(value).toFixed(1)}% (${item.payload.successes}/${item.payload.total}) Prompts`,
                      ]}
                    />
                  }
                />
                <Bar
                  dataKey="successRate"
                  fill="var(--color-successRate)"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                  onClick={(data) => {
                    if (data && data.attackType) {
                      handleAttackTypeClick(data.attackType);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <LabelList
                    dataKey="successRate"
                    position="top"
                    content={<CustomLabel />}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>

            {/* Level Grouping Indicator */}
            <div className="px-1 pb-4">
              <div className="flex items-start gap-3 relative">
                {/* Level 3 - Expert */}
                {overallStats.level3Count > 0 && (
                  <div className="flex-1" style={{ flexBasis: `${(overallStats.level3Count / overallStats.attackTypeCount) * 100}%` }}>
                    <div className="flex flex-col items-center">
                      <div className="w-full relative flex items-center justify-center">
                        <div className="w-0.5 h-2 bg-gray-300 absolute left-0 -translate-x-1/2"></div>
                        <div className="w-full border-t border-dashed border-gray-300"></div>
                        <div className="w-0.5 h-2 bg-gray-300 absolute right-0 translate-x-1/2"></div>
                        <span className="absolute text-xs text-gray-600 bg-gray-50 px-2">Expert</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 2 - Light */}
                {overallStats.level2Count > 0 && (
                  <div className="flex-1" style={{ flexBasis: `${(overallStats.level2Count / overallStats.attackTypeCount) * 100}%` }}>
                    <div className="flex flex-col items-center">
                      <div className="w-full relative flex items-center justify-center">
                        <div className="w-0.5 h-2 bg-gray-300 absolute left-0 -translate-x-1/2"></div>
                        <div className="w-full border-t border-dashed border-gray-300"></div>
                        <div className="w-0.5 h-2 bg-gray-300 absolute right-0 translate-x-1/2"></div>
                        <span className="absolute text-xs text-gray-600 bg-gray-50 px-2">Light</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Level 1 - Perturbation */}
                {overallStats.level1Count > 0 && (
                  <div className="flex-1" style={{ flexBasis: `${(overallStats.level1Count / overallStats.attackTypeCount) * 100}%` }}>
                    <div className="flex flex-col items-center">
                      <div className="w-full relative flex items-center justify-center">
                        <div className="w-0.5 h-2 bg-gray-300 absolute left-0 -translate-x-1/2"></div>
                        <div className="w-full border-t border-dashed border-gray-300"></div>
                        <div className="w-0.5 h-2  bg-gray-300 absolute right-0 translate-x-1/2"></div>
                        <span className="absolute text-xs text-gray-600 bg-gray-50 px-2">Perturbation</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Regression Analysis Table View */}
        <TabsContent value="regression" className="mt-0">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-0 hover:bg-gray-50">
                  <TableHead className="pl-3 font-450">Attack Level</TableHead>
                  <TableHead className="font-450 text-right w-[120px]">Odds Ratio</TableHead>
                  <TableHead className="font-450 text-right w-[120px]">P-Value</TableHead>
                  <TableHead className="font-450 text-right w-[120px]">Significance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {riskPredictions?.by_attack_level && riskPredictions.by_attack_level
                  .sort((a: any, b: any) => {
                    // Sort by level: Expert (3) > Light (2) > Perturbation (1)
                    const getLevelOrder = (name: string) => {
                      if (name.includes('Expert')) return 3;
                      if (name.includes('Light')) return 2;
                      if (name.includes('Perturbation')) return 1;
                      return 0;
                    };
                    return getLevelOrder(b.entity_name) - getLevelOrder(a.entity_name);
                  })
                  .map((level: any, index: number) => {
                    const rowKey = `level-${index}`;
                    const isExpanded = expandedRegressionRow === rowKey;

                    // Calculate overall success rate for comparison
                    const overallSuccessRate = riskPredictions.by_attack_level.reduce(
                      (sum: number, l: any) => sum + l.attack_success_rate,
                      0
                    ) / riskPredictions.by_attack_level.length;

                    return (
                      <ExpandableAttackLevelRow
                        key={rowKey}
                        isExpanded={isExpanded}
                        onToggle={() => setExpandedRegressionRow(isExpanded ? null : rowKey)}
                        level={level}
                        overallSuccessRate={overallSuccessRate}
                      />
                    );
                  })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Conversations Dialog */}
      <ConversationsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        conversations={filteredConversations}
        title={selectedAttackType ? `${selectedAttackType} Attack Conversations` : ''}
        strategy={strategy as any}
      />
    </div>
  );
}

// Expandable Attack Level Row Component with Framer Motion
function ExpandableAttackLevelRow({
  isExpanded,
  onToggle,
  level,
  overallSuccessRate,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  level: any;
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
            <span>{level.entity_name}</span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          {level.odds_ratio.toFixed(2)}
        </TableCell>
        <TableCell className="text-right">
          {level.p_value.toFixed(4)}
        </TableCell>
        <TableCell className={`text-right ${(level.significance === 'high' || level.significance === 'medium') ? 'text-green-600' : ''}`}>
          {(level.significance === 'high' || level.significance === 'medium') ? 'Yes' : 'No'}
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
                          <AttackLevelRegressionChart
                            beta={level.beta}
                            ciLower={level.ci_lower}
                            ciUpper={level.ci_upper}
                          />
                        </div>
                      </div>

                      {/* Right: Comparison Chart */}
                      <div className="space-y-3">
                        <div className="bg-gray-0 border border-gray-200 rounded-lg p-4">
                          <AttackLevelComparisonChart
                            levelRate={level.attack_success_rate}
                            overallAverage={overallSuccessRate}
                            levelName={level.entity_name}
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

// Logistic Regression S-Curve Component for Attack Levels
function AttackLevelRegressionChart({
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
      color: "var(--chart-1)",
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

// Comparison Bar Chart Component for Attack Levels
function AttackLevelComparisonChart({
  levelRate,
  overallAverage,
  levelName
}: {
  levelRate: number;
  overallAverage: number;
  levelName: string;
}) {
  const data = [
    {
      name: 'Overall Average',
      rate: overallAverage,
    },
    {
      name: levelName,
      rate: levelRate,
    },
  ];

  const chartConfig = {
    rate: {
      label: "Success Rate (%)",
      color: 'var(--chart-1)',
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
            (levelRate - overallAverage) > 0
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}>
            {(levelRate - overallAverage) > 0 ? '+' : ''}{(levelRate - overallAverage).toFixed(1)}%
          </span> difference from overall average
        </p>
      </div>
    </div>
  );
}
