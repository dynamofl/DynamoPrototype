import { useEffect, useState, useMemo } from "react";
import { Loader2, MessagesSquare } from "lucide-react";
import { AISystemIcon } from "@/components/patterns/ui-patterns/ai-system-icon";
import { StripeProgressBar } from "./stripe-progress-bar";
import { ProgressSkeletonCell } from "./progress-skeleton-cell";
import { usePromptSubscription } from "../../hooks/usePromptSubscription";
import { getEvaluationStrategy } from "../../strategies/strategy-factory";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ColumnConfig } from "../../strategies/base-strategy";
import type { BaseEvaluationResult } from "../../types/base-evaluation";

interface EvaluationTableProgressProps {
  evaluationId: string;
  evaluationType?: 'jailbreak' | 'compliance' | 'hallucination';
  aiSystemName?: string;
  aiSystemIcon?: "OpenAI" | "Azure" | "Mistral" | "Databricks" |
                 "HuggingFace" | "Anthropic" | "Custom" | "AWS" |
                 "DynamoAI" | "Gemini";
  evaluationName?: string;
  startedAt?: string;
  stage: string;
  current: number;
  total: number;
  message: string;
  onRowClick?: (promptId: string) => void;
}

export function EvaluationTableProgress({
  evaluationId,
  evaluationType = 'jailbreak',
  aiSystemName,
  aiSystemIcon,
  evaluationName = "Evaluation Test",
  startedAt,
  stage,
  current,
  total,
  message,
  onRowClick
}: EvaluationTableProgressProps) {
  // Subscribe to prompt updates
  const { prompts, loading } = usePromptSubscription({
    evaluationId,
    testType: evaluationType,
    enabled: true
  });

  // Get strategy for this test type
  const strategy = useMemo(() => getEvaluationStrategy(evaluationType), [evaluationType]);

  // Time elapsed tracker
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Format date
  const formattedDate = startedAt
    ? new Date(startedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : '';

  const formattedTime = startedAt
    ? new Date(startedAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : '';

  // Calculate progress
  const progress = total > 0 ? (current / total) * 100 : 0;
  const isPreparing = progress === 0;

  // Transform prompts using strategy
  const transformedPrompts = useMemo(() => {
    if (!prompts.length) return [];
    return strategy.transformPrompts(prompts);
  }, [prompts, strategy]);

  // Check if any prompts have guardrails
  const hasInputGuardrails = prompts.some(p => {
    const prompt = p as any;
    return (prompt.input_guardrail !== null && prompt.input_guardrail !== undefined) ||
           (prompt.input_guardrail_judgement !== null && prompt.input_guardrail_judgement !== undefined);
  });

  const hasOutputGuardrails = prompts.some(p => {
    const prompt = p as any;
    return (prompt.output_guardrail !== null && prompt.output_guardrail !== undefined) ||
           (prompt.output_guardrail_judgement !== null && prompt.output_guardrail_judgement !== undefined);
  });

  // Get column configuration from strategy
  const columns = useMemo(() =>
    strategy.getTableColumns({ hasInputGuardrails, hasOutputGuardrails }),
    [strategy, hasInputGuardrails, hasOutputGuardrails]
  );

  // Determine skeleton width based on column key
  const getSkeletonWidth = (columnKey: string): string => {
    const widthMap: Record<string, string> = {
      'inputGuardrail': 'w-20',
      'outputGuardrail': 'w-20',
      'judgeModel': 'w-16',
      'attackOutcome': 'w-24',
      'complianceJudgement': 'w-20',
      'finalOutcome': 'w-16'
    };
    return widthMap[columnKey] || 'w-16';
  };

  // List of judgment columns that should show skeletons when pending/running
  const judgmentColumns = [
    'inputGuardrail',
    'outputGuardrail',
    'judgeModel',
    'attackOutcome',
    'complianceJudgement',
    'finalOutcome'
  ];

  // Render cell with skeleton support
  const renderCellWithSkeleton = (column: ColumnConfig, prompt: BaseEvaluationResult) => {
    const promptWithStatus = prompts.find(p => p.id === (prompt as any).id);

    // Show skeleton for judgment columns on pending/running prompts
    if (judgmentColumns.includes(column.key) &&
        promptWithStatus &&
        (promptWithStatus.status === 'pending' || promptWithStatus.status === 'running')) {
      return <ProgressSkeletonCell width={getSkeletonWidth(column.key)} />;
    }

    // Use strategy's render function for completed prompts or non-judgment columns
    return column.render(prompt);
  };

  // Handle row click - only for completed rows
  const handleRowClick = (prompt: BaseEvaluationResult) => {
    const promptWithStatus = prompts.find(p => p.id === (prompt as any).id);

    // Only allow clicking on completed prompts
    if (promptWithStatus?.status === 'completed' && onRowClick) {
      onRowClick((prompt as any).id);
    }
  };

  // Show loading state when total is 0 or prompts are loading
  if (total === 0 || loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px] p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header matching EvaluationInProgress style */}
      <div className="px-8 py-6 space-y-4">
        <div className="space-y-2">
          {/* AI System Name */}
          <div className="flex items-center gap-1 -mx-1">
            {aiSystemIcon && (
              <AISystemIcon type={aiSystemIcon} className="w-6 h-6" />
            )}
            <h1 className="text-[0.8125rem] font-450 text-gray-600">
              {aiSystemName || "AI System"}
            </h1>
          </div>

          {/* Main Title */}
          <h2 className="text-2xl font-450 text-gray-900">
            {evaluationName}
          </h2>

          {/* Metadata Section */}
          <div className="flex flex-wrap text-[0.8125rem] font-400 gap-1">
            <span className="text-gray-400">
              {evaluationType === 'compliance' ? 'Compliance Evaluation' :
               evaluationType === 'hallucination' ? 'Hallucination Evaluation' :
               'Jailbreak Evaluation'}
            </span>
            {startedAt && (
              <span className="text-gray-400">• Started On: {formattedDate}, {formattedTime}</span>
            )}
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              {current} of {total} prompts evaluated
            </span>
            <span className="text-gray-600">Time Elapsed: {formatTime(timeElapsed)}</span>
          </div>

          {/* Compact Progress Bar */}
          <StripeProgressBar progress={progress} isPreparing={isPreparing} />

          {/* Current Stage */}
          {stage && (
            <div className="text-sm text-gray-500">
              {stage}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 border-0">
              <TableHead className="w-12">#</TableHead>
              <TableHead className="w-8 pr-[0px]">
                <MessagesSquare className="h-4 w-4 text-gray-500" strokeWidth="2" />
              </TableHead>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`font-450 ${column.className || ''}`}
                  style={{ width: column.width }}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transformedPrompts.map((prompt, index) => {
              const promptWithStatus = prompts.find(p => p.id === (prompt as any).id);
              const isCompleted = promptWithStatus?.status === 'completed';

              return (
                <TableRow
                  key={(prompt as any).id || index}
                  onClick={() => handleRowClick(prompt)}
                  className={`transition-colors ${
                    isCompleted
                      ? 'cursor-pointer hover:bg-gray-50'
                      : 'cursor-default opacity-75'
                  }`}
                >
                  <TableCell>
                    <span className="text-gray-500">{index + 1}</span>
                  </TableCell>
                  <TableCell className="pr-[0px]">
                    <MessagesSquare className="h-4 w-4 text-gray-500" strokeWidth="2" />
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className || ''}>
                      {renderCellWithSkeleton(column, prompt)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {transformedPrompts.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            No prompts found
          </div>
        )}
      </div>
    </div>
  );
}
