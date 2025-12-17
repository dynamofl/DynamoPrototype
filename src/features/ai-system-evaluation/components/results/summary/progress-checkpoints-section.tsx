import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckpointDisplay } from "./checkpoint-display";
import { PolicyProgressCard } from "./policy-progress-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { CheckpointState, PolicyProgress } from "@/lib/supabase/evaluation-service";

interface ProgressCheckpoint {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'stopped';
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
  // Evaluation status to determine if stopped
  evaluationStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  // Restart functionality
  onRestartFromCheckpoint?: (checkpointId: 'topics' | 'prompts' | 'evaluation' | 'summary') => void;
}

// Helper function to get label based on checkpoint status
function getCheckpointLabel(
  checkpointId: 'topics' | 'prompts' | 'evaluation' | 'summary',
  status: 'pending' | 'in_progress' | 'completed' | 'stopped'
): string {
  const labels = {
    topics: {
      pending: 'Generate Topics',
      in_progress: 'Generating Topics',
      completed: 'Topics Generated',
      stopped: 'Topic Generation Stopped'
    },
    prompts: {
      pending: 'Generate Prompts',
      in_progress: 'Generating Prompts',
      completed: 'Prompts Generated',
      stopped: 'Prompt Generation Stopped'
    },
    evaluation: {
      pending: 'Run Evaluation',
      in_progress: 'Running Evaluation',
      completed: 'Evaluation Complete',
      stopped: 'Evaluation Stopped'
    },
    summary: {
      pending: 'Structure Summary',
      in_progress: 'Structuring Summary',
      completed: 'Summary Structured',
      stopped: 'Summary Generation Stopped'
    }
  };

  return labels[checkpointId][status];
}

function getCheckpoints(
  progress: { current?: number; total?: number; stage?: string },
  checkpointState?: CheckpointState,
  evaluationStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
): ProgressCheckpoint[] {
  const isStopped = evaluationStatus === 'cancelled';

  // Helper to convert in_progress to stopped if evaluation is cancelled
  const resolveStatus = (status: 'pending' | 'in_progress' | 'completed'): 'pending' | 'in_progress' | 'completed' | 'stopped' => {
    if (isStopped && status === 'in_progress') {
      return 'stopped';
    }
    return status;
  };

  // Use checkpoint state if available, otherwise fall back to legacy parsing
  if (checkpointState?.checkpoints) {
    const { checkpoints } = checkpointState;
    const topicData = checkpoints.topics?.data;
    const promptData = checkpoints.prompts?.data;
    const evaluationData = checkpoints.evaluation?.data;

    const topicsStatus = resolveStatus(checkpoints.topics?.status || 'pending');
    const promptsStatus = resolveStatus(checkpoints.prompts?.status || 'pending');
    const evalStatus = resolveStatus(checkpoints.evaluation?.status || 'pending');
    const summaryStatus = resolveStatus(checkpoints.summary?.status || 'pending');

    return [
      {
        id: 'topics',
        label: getCheckpointLabel('topics', topicsStatus),
        status: topicsStatus,
        detail: (topicsStatus === 'completed' || topicsStatus === 'stopped') && topicData?.topic_count
          ? `${topicData.topic_count} topics`
          : undefined
      },
      {
        id: 'prompts',
        label: getCheckpointLabel('prompts', promptsStatus),
        status: promptsStatus,
        detail: (promptsStatus === 'completed' || promptsStatus === 'stopped') && promptData?.prompt_count
          ? `${promptData.prompt_count} prompts`
          : undefined
      },
      {
        id: 'evaluation',
        label: getCheckpointLabel('evaluation', evalStatus),
        status: evalStatus,
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

  const topicsStatusLegacy = resolveStatus(
    isGeneratingTopics ? 'in_progress' :
    (isGeneratingPrompts || isEvaluating || isStructuring) ? 'completed' :
    'pending'
  );

  const promptsStatusLegacy = resolveStatus(
    isGeneratingPrompts ? 'in_progress' :
    (isEvaluating || isStructuring) ? 'completed' :
    topicsStatusLegacy === 'completed' ? 'pending' :
    'pending'
  );

  const evalStatusLegacy = resolveStatus(
    isEvaluating ? 'in_progress' :
    isStructuring ? 'completed' :
    (promptsStatusLegacy === 'completed' && total > 0) ? 'pending' :
    'pending'
  );

  const summaryStatusLegacy = resolveStatus(
    isStructuring ? 'in_progress' :
    'pending'
  );

  return [
    {
      id: 'topics',
      label: getCheckpointLabel('topics', topicsStatusLegacy),
      status: topicsStatusLegacy,
      detail: topicsStatusLegacy === 'completed' ? `${total} topics` : undefined
    },
    {
      id: 'prompts',
      label: getCheckpointLabel('prompts', promptsStatusLegacy),
      status: promptsStatusLegacy,
      detail: promptsStatusLegacy === 'completed' ? `${total} prompts` : undefined
    },
    {
      id: 'evaluation',
      label: getCheckpointLabel('evaluation', evalStatusLegacy),
      status: evalStatusLegacy,
      detail: total > 0 ? `${current}/${total} completed` : undefined
    },
    {
      id: 'summary',
      label: getCheckpointLabel('summary', summaryStatusLegacy),
      status: summaryStatusLegacy
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
  checkpointState,
  evaluationStatus,
  onRestartFromCheckpoint
}: ProgressCheckpointsSectionProps) {
  const [timeElapsed, setTimeElapsed] = useState(formatTimeElapsed(startedAt));
  const [showRestartDialog, setShowRestartDialog] = useState(false);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<'topics' | 'prompts' | 'evaluation' | 'summary' | null>(null);

  // Handler for restart button click
  const handleRestartClick = (checkpointId: 'topics' | 'prompts' | 'evaluation' | 'summary') => {
    setSelectedCheckpoint(checkpointId);
    setShowRestartDialog(true);
  };

  // Handler for confirming restart
  const handleConfirmRestart = () => {
    if (selectedCheckpoint && onRestartFromCheckpoint) {
      onRestartFromCheckpoint(selectedCheckpoint);
    }
    setShowRestartDialog(false);
    setSelectedCheckpoint(null);
  };

  // Get checkpoint name for display
  const getCheckpointName = (checkpointId: 'topics' | 'prompts' | 'evaluation' | 'summary' | null): string => {
    if (!checkpointId) return '';
    const names = {
      topics: 'Topics',
      prompts: 'Prompts',
      evaluation: 'Evaluation',
      summary: 'Summary'
    };
    return names[checkpointId];
  };

  // Use checkpoint state for progress data when available
  const effectiveTotal = checkpointState?.checkpoints?.evaluation?.data?.total_prompts ?? total ?? 0;
  const effectiveCurrent = checkpointState?.checkpoints?.evaluation?.data?.completed_prompts ?? current ?? 0;
  const effectivePolicies = checkpointState?.policies ?? policies ?? [];

  const isStopped = evaluationStatus === 'cancelled';
  const checkpoints = getCheckpoints({ current, total, stage }, checkpointState, evaluationStatus);

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
          {isStopped ? (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-450 rounded-full">Stopped</span>
          ) : (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-450 rounded-full">Running</span>
          )}
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
                  evaluationStatus={evaluationStatus}
                  onRestartFromCheckpoint={onRestartFromCheckpoint ? handleRestartClick : undefined}
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
                      checkpointId={checkpoint.id as 'topics' | 'prompts' | 'evaluation' | 'summary'}
                      evaluationStatus={evaluationStatus}
                      onRestart={onRestartFromCheckpoint ? handleRestartClick : undefined}
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

      {/* Restart Confirmation Dialog */}
      <AlertDialog open={showRestartDialog} onOpenChange={setShowRestartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart from {getCheckpointName(selectedCheckpoint)}?</AlertDialogTitle>
            <AlertDialogDescription>
              Restart after this stage
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestart}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Restart
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
