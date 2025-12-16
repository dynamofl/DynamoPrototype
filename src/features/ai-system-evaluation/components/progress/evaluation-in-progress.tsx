import { Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import { StripeProgressBar } from "./stripe-progress-bar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { AISystemIcon } from "@/components/patterns/ui-patterns/ai-system-icon";

interface SubStage {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
}

interface AttackStatus {
  id: string;
  name: string;
  temperature: number;
  status: string;
  progress: number; // percentage completed
  currentStage?: string;
  substages?: SubStage[];
}

interface EvaluationProgressProps {
  stage: string;
  current: number;
  total: number;
  message: string;
  percentage?: number;
  aiSystemName?: string;
  aiSystemIcon?: "OpenAI" | "Azure" | "Mistral" | "Databricks" | "HuggingFace" | "Anthropic" | "Custom" | "AWS" | "DynamoAI" | "Gemini";
  evaluationName?: string;
  evaluationType?: string;
  startedAt?: string;
  attacks?: AttackStatus[];
}

// Attack Card Component
function AttackCard({ attack }: { attack: AttackStatus }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubstages = attack.substages && attack.substages.length > 0;

  const getStatusIcon = (status: string) => {
    if (status === 'completed') {
      return <div className="h-5 w-5 rounded-full border-2 border-blue-500 flex items-center justify-center">
        <div className="h-2 w-2 bg-blue-500 rounded-full" />
      </div>;
    } else if (status === 'in-progress') {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-gray-0 overflow-hidden">
      {/* Main Attack Header */}
      <div className="flex items-center gap-3 p-4">
        {getStatusIcon(attack.status)}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900">
              {attack.name} <span className="text-gray-500">•</span> <span className="text-gray-600">Temp: {attack.temperature}</span>
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {attack.progress}% Completed {attack.currentStage && `• ${attack.currentStage}`}
          </p>
        </div>
        {hasSubstages && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        )}
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <X className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Substages - Expandable */}
      {isExpanded && hasSubstages && (
        <div className="px-4 pb-4 pt-0 pl-12 space-y-2">
          {attack.substages!.map((substage) => (
            <div key={substage.id} className="flex items-center gap-3 py-2">
              {getStatusIcon(substage.status)}
              <p className="text-sm text-gray-700">{substage.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function EvaluationInProgress({
  stage,
  current,
  total,
  message,
  percentage,
  aiSystemName,
  aiSystemIcon,
  evaluationName = "Evaluation Test",
  evaluationType = "Jailbreak Evaluation",
  startedAt,
  attacks = []
}: EvaluationProgressProps) {
  // Use checkpoint-aware percentage if available, otherwise calculate from current/total
  const progress = percentage !== undefined
    ? percentage
    : (total > 0 ? (current / total) * 100 : 0);
  const isPreparing = progress === 0;

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

  // Format evaluated on timestamp
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

  return (
    <div className="flex items-center justify-center min-h-[600px] p-8">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header matching summary view exactly */}
        <div className="space-y-2 pb-2">
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
            {evaluationName || "--"}
          </h2>

          {/* Metadata Section */}
          <div className="flex flex-wrap text-[0.8125rem] font-400 gap-1">
            <span className="text-gray-400">{evaluationType}</span>
            {startedAt && (
              <span className="text-gray-400">• Started On: {formattedDate}, {formattedTime}</span>
            )}
          </div>
        </div>

        {/* Evaluation Progress Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Evaluation Progress</h3>
            {isPreparing && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-200">
                Preparing
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <StripeProgressBar progress={progress} isPreparing={isPreparing} />

          {/* Stage and Time */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{stage || message}</span>
            <span className="text-gray-600">Time Elapsed: {formatTime(timeElapsed)}</span>
          </div>
        </div>

        {/* Status Section */}
        {attacks.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Status</h3>
            <div className="space-y-3">
              {attacks.map((attack) => (
                <AttackCard key={attack.id} attack={attack} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
