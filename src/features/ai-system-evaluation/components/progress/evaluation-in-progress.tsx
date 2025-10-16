import { Loader2 } from "lucide-react";

interface EvaluationProgressProps {
  stage: string;
  current: number;
  total: number;
  message: string;
}

export function EvaluationInProgress({ stage, current, total, message }: EvaluationProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const isGeneratingPrompts = total === 0;

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="max-w-md w-full space-y-6">
        {/* Spinner */}
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {isGeneratingPrompts ? 'Setting up test environment and preparing the prompts' : 'Running Jailbreak Evaluation'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isGeneratingPrompts
              ? 'Configuring the system and preparing the dataset'
              : 'This may take a few minutes depending on the number of policies and attack types'
            }
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`bg-blue-600 h-2.5 rounded-full transition-all duration-300 ${
                isGeneratingPrompts ? 'animate-pulse' : ''
              }`}
              style={{ width: isGeneratingPrompts ? '100%' : `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            {isGeneratingPrompts ? (
              <span className="text-blue-600 font-medium">Generating test prompts...</span>
            ) : (
              <>
                <span>{Math.round(progress)}% Complete</span>
                <span>{current} / {total}</span>
              </>
            )}
          </div>
        </div>

        {/* Current Stage */}
        {!isGeneratingPrompts && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-1">
            <p className="text-sm font-medium text-blue-900">
              {stage}
            </p>
            <p className="text-sm text-blue-700">
              {message}
            </p>
          </div>
        )}

        {/* Status indicators - different for prompt generation vs execution */}
        <div className="space-y-2 text-xs text-gray-500">
          {isGeneratingPrompts ? (
            <>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                <span>Analyzing policy requirements</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                <span>Generating adversarial test prompts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-gray-400 rounded-full" />
                <span>Waiting to start evaluation...</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-600 rounded-full" />
                <span>Test prompts ready ({total} prompts)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                <span>Executing adversarial attacks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                <span>Evaluating guardrail responses</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
