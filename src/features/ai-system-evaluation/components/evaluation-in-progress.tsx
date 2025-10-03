import { Loader2 } from "lucide-react";

interface EvaluationProgressProps {
  stage: string;
  current: number;
  total: number;
  message: string;
}

export function EvaluationInProgress({ stage, current, total, message }: EvaluationProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="max-w-md w-full space-y-6">
        {/* Spinner */}
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Running Jailbreak Evaluation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This may take a few minutes depending on the number of policies and attack types
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{Math.round(progress)}% Complete</span>
            <span>{current} / {total}</span>
          </div>
        </div>

        {/* Current Stage */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-1">
          <p className="text-sm font-medium text-blue-900">
            {stage}
          </p>
          <p className="text-sm text-blue-700">
            {message}
          </p>
        </div>

        {/* Status indicators */}
        <div className="space-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
            <span>Generating prompts with GPT-4o</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
            <span>Executing adversarial attacks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
            <span>Evaluating guardrail responses</span>
          </div>
        </div>
      </div>
    </div>
  );
}
