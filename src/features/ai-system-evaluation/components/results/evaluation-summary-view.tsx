import type { JailbreakEvaluationOutput } from "../../types/jailbreak-evaluation";
import { OverviewSection } from "./summary/overview-section";
import { AttackScoreGauge } from "./summary/attack-score-gauge";
import { SummaryStatsCards } from "./summary/summary-stats-cards";
import { PolicyResultsSection } from "./summary/policy-results-section";
import { AttackTypeResultsSection } from "./summary/attack-type-results-section";
import { BehaviorTypeResultsSection } from "./summary/behavior-type-results-section";
import { AISystemIcon } from "@/components/patterns/ui-patterns/ai-system-icon";

interface EvaluationSummaryViewProps {
  summary: JailbreakEvaluationOutput["summary"];
  aiSystemName?: string;
  aiSystemIcon?:
    | "OpenAI"
    | "Azure"
    | "Mistral"
    | "Databricks"
    | "HuggingFace"
    | "Anthropic"
    | "Remote"
    | "Local"
    | "AWS"
    | "DynamoAI";
  timestamp: string;
  startedAt?: string;
  completedAt?: string;
  evaluationName?: string;
  tokenUtilization?: number;
}

export function EvaluationSummaryView({
  summary,
  aiSystemName,
  aiSystemIcon,
  timestamp,
  startedAt,
  completedAt,
  evaluationName,
  tokenUtilization,
}: EvaluationSummaryViewProps) {
  // Format timestamp
  const formattedDate = new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate duration
  let formattedDuration = "--";
  if (startedAt && completedAt) {
    const start = new Date(startedAt).getTime();
    const end = new Date(completedAt).getTime();
    const durationMs = end - start;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    formattedDuration = `${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}`;
  }

  return (
    <div className="flex justify-center w-full py-6">
      <div className="w-full max-w-4xl space-y-4">
        {/* AI System Header */}
        <div className="space-y-2 mx-3">
          <div className="flex items-center gap-1">
            {aiSystemIcon && (
              <AISystemIcon type={aiSystemIcon} className="w-6 h-6" />
            )}
            <h1 className="text-[0.8125rem] font-550 text-gray-600">
              {aiSystemName || "AI System"}
            </h1>
          </div>

          {/* Main Title */}
          <h2 className="text-3xl font-550 text-gray-900">
            Policy Jailbreak Evaluation Results
          </h2>
        </div>

        {/* Metadata Section */}
        <div className="grid grid-cols-4 gap-6 mx-3 py-3 border-b border-t border-dashed border-gray-200">
          <div className="flex flex-col gap-1">
            <p className="text-sm  text-gray-600">Evaluation Name</p>
            <p className="text-sm text-gray-900">{evaluationName || "--"}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm  text-gray-600">Evaluation Duration</p>
            <p className="text-sm  text-gray-900">{formattedDuration}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm  text-gray-600">Token Utilization</p>
            <p className="text-sm  text-gray-900">
              {tokenUtilization?.toLocaleString() || "0"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm  text-gray-600">Evaluated On</p>
            <p className="text-sm  text-gray-900">
              {formattedDate} • {formattedTime}
            </p>
          </div>
        </div>

        {/* Overview Section Title */}

        {/* Overview and Gauge - Two Column Layout */}
        <div className="grid grid-cols-3 px-3 align-center items-center rounded-lg bg-gray-100">
          {/* Left: Overview Description */}
          <div className="col-span-2">
            <OverviewSection summary={summary} />
          </div>

          {/* Right: Attack Score Gauge */}
          <div className="col-span-1">
            <AttackScoreGauge summary={summary} />
          </div>
        </div>

        {/* Overall Stats Cards */}
        <SummaryStatsCards summary={summary} />

        {/* By Policy */}
        <PolicyResultsSection byPolicy={summary.byPolicy} />

        {/* By Attack Type */}
        <AttackTypeResultsSection byAttackType={summary.byAttackType} />

        {/* By Behavior Type */}
        <BehaviorTypeResultsSection byBehaviorType={summary.byBehaviorType} />
      </div>
    </div>
  );
}
