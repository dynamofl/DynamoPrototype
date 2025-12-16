import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckpointDisplay } from "./checkpoint-display";
import { PolicyProgressCard } from "./policy-progress-card";
import type { CheckpointState, PolicyProgress } from "@/lib/supabase/evaluation-service";

interface ProgressCheckpoint {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
  detail?: string;
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

// Helper function to get label based on checkpoint status
function getCheckpointLabel(
  checkpointId: 'topics' | 'prompts' | 'evaluation' | 'summary',
  status: 'pending' | 'in_progress' | 'completed'
): string {
  const labels = {
    topics: {
      pending: 'Generate Topics',
      in_progress: 'Generating Topics',
      completed: 'Topics Generated'
    },
    prompts: {
      pending: 'Generate Prompts',
      in_progress: 'Generating Prompts',
      completed: 'Prompts Generated'
    },
    evaluation: {
      pending: 'Run Evaluation',
      in_progress: 'Running Evaluation',
      completed: 'Evaluation Complete'
    },
    summary: {
      pending: 'Structure Summary',
      in_progress: 'Structuring Summary',
      completed: 'Summary Structured'
    }
  };

  return labels[checkpointId][status];
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

    const topicsStatus = checkpoints.topics?.status || 'pending';
    const promptsStatus = checkpoints.prompts?.status || 'pending';
    const evaluationStatus = checkpoints.evaluation?.status || 'pending';
    const summaryStatus = checkpoints.summary?.status || 'pending';

    return [
      {
        id: 'topics',
        label: getCheckpointLabel('topics', topicsStatus),
        status: topicsStatus,
        detail: topicsStatus === 'completed' && topicData?.topic_count
          ? `${topicData.topic_count} topics`
          : undefined
      },
      {
        id: 'prompts',
        label: getCheckpointLabel('prompts', promptsStatus),
        status: promptsStatus,
        detail: promptsStatus === 'completed' && promptData?.prompt_count
          ? `${promptData.prompt_count} prompts`
          : undefined
      },
      {
        id: 'evaluation',
        label: getCheckpointLabel('evaluation', evaluationStatus),
        status: evaluationStatus,
        detail: evaluationData?.total_prompts
          ? `${evaluationData.completed_prompts || 0}/${evaluationData.total_prompts} completed`
          : undefined
      },
      {
        id: 'summary',
        label: getCheckpointLabel('summary', summaryStatus),
        status: summaryStatus
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

  const topicsStatus: 'pending' | 'in_progress' | 'completed' =
    isGeneratingTopics ? 'in_progress' :
    (isGeneratingPrompts || isEvaluating || isStructuring) ? 'completed' :
    'pending';

  const promptsStatus: 'pending' | 'in_progress' | 'completed' =
    isGeneratingPrompts ? 'in_progress' :
    (isEvaluating || isStructuring) ? 'completed' :
    topicsStatus === 'completed' ? 'pending' :
    'pending';

  const evaluationStatus: 'pending' | 'in_progress' | 'completed' =
    isEvaluating ? 'in_progress' :
    isStructuring ? 'completed' :
    (promptsStatus === 'completed' && total > 0) ? 'pending' :
    'pending';

  const summaryStatus: 'pending' | 'in_progress' | 'completed' =
    isStructuring ? 'in_progress' :
    'pending';

  return [
    {
      id: 'topics',
      label: getCheckpointLabel('topics', topicsStatus),
      status: topicsStatus,
      detail: topicsStatus === 'completed' ? `${total} topics` : undefined
    },
    {
      id: 'prompts',
      label: getCheckpointLabel('prompts', promptsStatus),
      status: promptsStatus,
      detail: promptsStatus === 'completed' ? `${total} prompts` : undefined
    },
    {
      id: 'evaluation',
      label: getCheckpointLabel('evaluation', evaluationStatus),
      status: evaluationStatus,
      detail: total > 0 ? `${current}/${total} completed` : undefined
    },
    {
      id: 'summary',
      label: getCheckpointLabel('summary', summaryStatus),
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

/**
 * Calculate overall progress percentage across all checkpoints
 * Weights: Topics (5%), Prompts (5%), Evaluation (85%), Summary (5%)
 */
function calculateCheckpointPercentage(checkpointState: CheckpointState | null | undefined): number {
  if (!checkpointState?.checkpoints) {
    return 0;
  }

  const { checkpoints } = checkpointState;
  let totalProgress = 0;

  // Topics checkpoint: 5% weight
  if (checkpoints.topics?.status === 'completed') {
    totalProgress += 5;
  } else if (checkpoints.topics?.status === 'in_progress') {
    totalProgress += 2.5; // Half of 5%
  }

  // Prompts checkpoint: 5% weight
  if (checkpoints.prompts?.status === 'completed') {
    totalProgress += 5;
  } else if (checkpoints.prompts?.status === 'in_progress') {
    totalProgress += 2.5; // Half of 5%
  }

  // Evaluation checkpoint: 85% weight (main phase)
  if (checkpoints.evaluation?.status === 'completed') {
    totalProgress += 85;
  } else if (checkpoints.evaluation?.status === 'in_progress') {
    const evalData = checkpoints.evaluation.data;
    const evalPercentage = evalData?.total_prompts && evalData.total_prompts > 0
      ? (evalData.completed_prompts || 0) / evalData.total_prompts
      : 0;
    totalProgress += 85 * evalPercentage;
  }

  // Summary checkpoint: 5% weight
  if (checkpoints.summary?.status === 'completed') {
    totalProgress += 5;
  } else if (checkpoints.summary?.status === 'in_progress') {
    totalProgress += 2.5; // Half of 5%
  }

  return Math.round(totalProgress);
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

  // Calculate percentage using checkpoint-aware function if checkpoint state exists
  // This includes all phases: Topics (5%), Prompts (5%), Evaluation (85%), Summary (5%)
  const progressPercentage = checkpointState
    ? calculateCheckpointPercentage(checkpointState)
    : (effectiveTotal > 0 ? Math.round((effectiveCurrent / effectiveTotal) * 100) : 0);

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
    <div className="p-3">
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-450 text-gray-900">Evaluation Status</h2>
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-450 rounded-full ">Running</span>
        </div>

        <div className="space-y-6">
          {/* Overall Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-1.5" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 font-400">{progressPercentage}% Completed</span>
              <span className="text-gray-600">Time Elapsed: {timeElapsed}</span>
            </div>
          </div>

          {/* Status Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-450 text-gray-900">Progress</h3>
            <div className="border border-gray-200 rounded-lg ">
            {effectivePolicies.length > 0 ? (
              effectivePolicies.map((policy, index) => (
                <PolicyProgressCard
                  key={policy.id}
                  policy={policy}
                  index={index}
                  checkpointState={checkpointState}
                  isSinglePolicy={effectivePolicies.length === 1}
                  isLastItem={index === effectivePolicies.length - 1}
                />
              ))
              
            ) : (
              // Fallback: Show checkpoints list if no policies available
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 space-y-3">
                  {checkpoints.map((checkpoint) => (
                    <CheckpointDisplay
                      key={checkpoint.id}
                      label={checkpoint.label}
                      status={checkpoint.status}
                      detail={checkpoint.detail}
                    />
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Current Stage */}
          {/* {stage && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">Current Stage</div>
              <div className="text-sm font-450 text-gray-900">{stage}</div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
