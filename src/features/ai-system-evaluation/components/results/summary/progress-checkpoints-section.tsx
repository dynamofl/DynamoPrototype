import { useState, useEffect } from "react";
import { Check, Loader2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { CheckpointState } from "@/lib/supabase/evaluation-service";

interface ProgressCheckpoint {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
  detail?: string;
}

interface PolicyProgress {
  id: string;
  name: string;
  current: number;
  total: number;
  stage: string;
}

interface ProgressCheckpointsSectionProps {
  // Legacy props (for backward compatibility)
  current?: number;
  total?: number;
  stage?: string;
  startedAt?: string;
  policies?: PolicyProgress[];
  // New checkpoint-based prop
  checkpointState?: CheckpointState;
}

function getCheckpoints(
  progress: { current?: number; total?: number; stage?: string },
  checkpointState?: CheckpointState
): ProgressCheckpoint[] {
  // Use checkpoint state if available, otherwise fall back to legacy parsing
  if (checkpointState?.checkpoints) {
    const { checkpoints } = checkpointState;
    const topicData = checkpoints.topics?.data;
    const promptData = checkpoints.prompts?.data;
    const evaluationData = checkpoints.evaluation?.data;

    return [
      {
        id: 'topics',
        label: 'Topics Generated',
        status: checkpoints.topics?.status || 'pending',
        detail: checkpoints.topics?.status === 'completed' && topicData?.topic_count
          ? `${topicData.topic_count} topics`
          : undefined
      },
      {
        id: 'prompts',
        label: 'Prompts Generated',
        status: checkpoints.prompts?.status || 'pending',
        detail: checkpoints.prompts?.status === 'completed' && promptData?.prompt_count
          ? `${promptData.prompt_count} prompts`
          : undefined
      },
      {
        id: 'evaluation',
        label: 'Evaluation In Progress',
        status: checkpoints.evaluation?.status || 'pending',
        detail: evaluationData?.total_prompts
          ? `${evaluationData.completed_prompts || 0}/${evaluationData.total_prompts} completed`
          : undefined
      },
      {
        id: 'summary',
        label: 'Structuring Summary',
        status: checkpoints.summary?.status || 'pending'
      }
    ];
  }

  // Legacy fallback: parse from stage string
  const { current = 0, total = 0, stage = '' } = progress;
  const stageLower = stage.toLowerCase();

  const isGeneratingTopics = stageLower.includes('generating topics') || stageLower.includes('topic generation');
  const isGeneratingPrompts = stageLower.includes('generating test prompts') || stageLower.includes('generating prompts') || stageLower.includes('prompt generation');
  const isEvaluating = stageLower.includes('evaluating') || (current > 0 && current < total);
  const isStructuring = stageLower.includes('structuring') || stageLower.includes('structure') || (current === total && total > 0);

  const topicsStatus: 'pending' | 'in-progress' | 'completed' =
    isGeneratingTopics ? 'in-progress' :
    (isGeneratingPrompts || isEvaluating || isStructuring) ? 'completed' :
    'pending';

  const promptsStatus: 'pending' | 'in-progress' | 'completed' =
    isGeneratingPrompts ? 'in-progress' :
    (isEvaluating || isStructuring) ? 'completed' :
    topicsStatus === 'completed' ? 'pending' :
    'pending';

  const evaluationStatus: 'pending' | 'in-progress' | 'completed' =
    isEvaluating ? 'in-progress' :
    isStructuring ? 'completed' :
    (promptsStatus === 'completed' && total > 0) ? 'pending' :
    'pending';

  const summaryStatus: 'pending' | 'in-progress' | 'completed' =
    isStructuring ? 'in-progress' :
    'pending';

  return [
    {
      id: 'topics',
      label: 'Topics Generated',
      status: topicsStatus,
      detail: topicsStatus === 'completed' ? `${total} topics` : undefined
    },
    {
      id: 'prompts',
      label: 'Prompts Generated',
      status: promptsStatus,
      detail: promptsStatus === 'completed' ? `${total} prompts` : undefined
    },
    {
      id: 'evaluation',
      label: 'Evaluation In Progress',
      status: evaluationStatus,
      detail: total > 0 ? `${current}/${total} completed` : undefined
    },
    {
      id: 'summary',
      label: 'Structuring Summary',
      status: summaryStatus
    }
  ];
}

function formatTimeElapsed(startedAt?: string): string {
  if (!startedAt) return '00:00';

  const start = new Date(startedAt).getTime();
  const now = Date.now();
  const elapsed = Math.floor((now - start) / 1000); // seconds

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Policy Card Component for multi-policy view
function PolicyProgressCard({ policy, index, checkpointState }: { policy: PolicyProgress; index: number; checkpointState?: CheckpointState }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const checkpoints = getCheckpoints({ current: policy.current, total: policy.total }, checkpointState);
  const progressPercentage = policy.total > 0 ? Math.round((policy.current / policy.total) * 100) : 0;
  const circumference = 2 * Math.PI * 8; // r=8

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Card Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
      >
        {/* Circular Progress Indicator */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 20 20">
            {/* Background circle */}
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progressPercentage / 100)}
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[0.625rem] font-450 text-gray-700">
              {progressPercentage}%
            </span>
          </div>
        </div>

        {/* Policy Info */}
        <div className="flex-1 text-left">
          <div className="text-sm font-450 text-gray-900">
            Eval {index + 1} • {policy.name}
          </div>
          <div className="text-xs text-gray-600 mt-0.5">
            {progressPercentage}% Completed
          </div>
        </div>

        {/* Expand/Collapse Icon */}
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expanded Content - Detailed Checkpoints */}
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 space-y-3">
          {checkpoints.map((checkpoint) => (
            <div key={checkpoint.id} className="flex items-start gap-2">
              {/* Status Icon */}
              <div className="mt-0.5">
                {checkpoint.status === 'completed' && (
                  <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                  </div>
                )}
                {checkpoint.status === 'in-progress' && (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 text-amber-500 animate-spin" strokeWidth={2.5} />
                  </div>
                )}
                {checkpoint.status === 'pending' && (
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Circle className="w-4 h-4 text-gray-300" strokeWidth={2} />
                  </div>
                )}
              </div>

              {/* Label and Detail */}
              <div className="flex-1">
                <div className="text-xs font-450 text-gray-900">
                  {checkpoint.label}
                </div>
                {checkpoint.detail && (
                  <div className="text-[0.6875rem] text-gray-600 mt-0.5">
                    {checkpoint.detail}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Progress Checkpoints Section
export function ProgressCheckpointsSection({
  current,
  total,
  stage,
  startedAt,
  policies,
  checkpointState
}: ProgressCheckpointsSectionProps) {
  const [timeElapsed, setTimeElapsed] = useState(formatTimeElapsed(startedAt));

  // Use checkpoint state for progress data when available
  const effectiveTotal = checkpointState?.checkpoints?.evaluation?.data?.total_prompts ?? total ?? 0;
  const effectiveCurrent = checkpointState?.checkpoints?.evaluation?.data?.completed_prompts ?? current ?? 0;
  const effectivePolicies = checkpointState?.policies ?? policies ?? [];

  const checkpoints = getCheckpoints({ current, total, stage }, checkpointState);
  const progressPercentage = effectiveTotal > 0 ? Math.round((effectiveCurrent / effectiveTotal) * 100) : 0;

  // Determine if we should show multi-policy view
  const isMultiPolicy = effectivePolicies && effectivePolicies.length > 1;

  // Update time elapsed every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(formatTimeElapsed(startedAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <div className="px-6 py-6">
      <div className="max-w-3xl">
        <h2 className="text-lg font-450 text-gray-900 mb-6">Evaluation Progress</h2>

        {/* Multi-Policy View */}
        {isMultiPolicy ? (
          <div className="space-y-3">
            {effectivePolicies.map((policy, index) => (
              <PolicyProgressCard key={policy.id} policy={policy} index={index} checkpointState={checkpointState} />
            ))}
          </div>
        ) : (
          <>
            {/* Single Policy View - Original Checkpoints */}
            <div className="space-y-4 mb-6">
              {checkpoints.map((checkpoint) => (
                <div key={checkpoint.id} className="flex items-start gap-3">
                  {/* Status Icon */}
                  <div className="mt-0.5">
                    {checkpoint.status === 'completed' && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    {checkpoint.status === 'in-progress' && (
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-amber-500 animate-spin" strokeWidth={2.5} />
                      </div>
                    )}
                    {checkpoint.status === 'pending' && (
                      <div className="w-5 h-5 flex items-center justify-center">
                        <Circle className="w-5 h-5 text-gray-300" strokeWidth={2} />
                      </div>
                    )}
                  </div>

                  {/* Label and Detail */}
                  <div className="flex-1">
                    <div className="text-sm font-450 text-gray-900">
                      {checkpoint.label}
                    </div>
                    {checkpoint.detail && (
                      <div className="text-xs text-gray-600 mt-0.5">
                        {checkpoint.detail}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Progress Bar */}
            {total > 0 && (
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Overall Progress</span>
                  <span className="font-450 text-gray-900">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            {/* Time Elapsed */}
            <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-200">
              <span className="text-gray-600">Time Elapsed</span>
              <span className="font-mono font-450 text-gray-900">{timeElapsed}</span>
            </div>

            {/* Current Stage */}
            {stage && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Current Stage</div>
                <div className="text-sm font-450 text-gray-900">{stage}</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
