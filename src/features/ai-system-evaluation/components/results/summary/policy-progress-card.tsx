import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronsUpDown, ChevronsDownUp } from "lucide-react";
import { CheckpointDisplay } from "./checkpoint-display";
import type { CheckpointState, PolicyProgress } from "@/lib/supabase/evaluation-service";

export interface PolicyProgressCardProps {
  policy: PolicyProgress;
  index: number;
  checkpointState?: CheckpointState;
  isSinglePolicy?: boolean;
  isLastItem?: boolean;
}

interface ProgressCheckpoint {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
  detail?: string;
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
  progress: { current?: number; total?: number },
  checkpointState?: CheckpointState
): ProgressCheckpoint[] {
  // Use checkpoint state if available
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

  // Legacy fallback: simple evaluation progress
  const { current = 0, total = 0 } = progress;
  return [
    {
      id: 'topics',
      label: 'Topics Generated',
      status: 'completed'
    },
    {
      id: 'prompts',
      label: 'Prompts Generated',
      status: 'completed'
    },
    {
      id: 'evaluation',
      label: 'Running Evaluation',
      status: 'in_progress',
      detail: total > 0 ? `${current}/${total} completed` : undefined
    },
    {
      id: 'summary',
      label: 'Structure Summary',
      status: 'pending'
    }
  ];
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
    totalProgress += 2.5;
  }

  // Prompts checkpoint: 5% weight
  if (checkpoints.prompts?.status === 'completed') {
    totalProgress += 5;
  } else if (checkpoints.prompts?.status === 'in_progress') {
    totalProgress += 2.5;
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
    totalProgress += 2.5;
  }

  return Math.round(totalProgress);
}

/**
 * PolicyProgressCard component displays progress for a single policy evaluation.
 * Shows circular progress indicator, policy name, and expandable checkpoint details.
 */
export function PolicyProgressCard({ policy, index, checkpointState, isSinglePolicy, isLastItem }: PolicyProgressCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const checkpoints = getCheckpoints({ current: policy.current, total: policy.total }, checkpointState);

  // For single policy evaluations, use checkpoint-aware percentage
  // For multi-policy evaluations, show just the evaluation phase progress per policy
  const progressPercentage = isSinglePolicy && checkpointState
    ? calculateCheckpointPercentage(checkpointState)
    : (policy.total > 0 ? Math.round((policy.current / policy.total) * 100) : 0);

  // Find the current active checkpoint
  const activeCheckpoint = checkpoints.find(cp => cp.status === 'in_progress');

  const circumference = 2 * Math.PI * 8; // r=8

  // For single policy evaluations, show checkpoints directly without collapsible header
  if (isSinglePolicy) {
    return (
      <div className="px-3 py-3 space-y-3">
        {checkpoints.map((checkpoint) => (
          <CheckpointDisplay
            key={checkpoint.id}
            label={checkpoint.label}
            status={checkpoint.status}
            detail={checkpoint.detail}
          />
        ))}
      </div>
    );
  }

  // For multi-policy evaluations, show collapsible card with policy info
  return (
    <div className={`overflow-hidden ${!isLastItem ? 'border-b border-gray-200' : ''}`}>
      {/* Card Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-3 py-3 flex items-start gap-3 overflow-hidden hover:bg-gray-50 transition-colors"
      >
        {/* Circular Progress Indicator */}
        <div className="relative w-5 h-5 ">
          <svg className="w-5 h-5 -rotate-90" viewBox="0 0 20 20">
            {/* Background circle */}
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              strokeWidth="2"
              className="stroke-gray-200"
            />
            {/* Progress circle */}
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              strokeWidth="2"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progressPercentage / 100)}
              className="stroke-blue-600 transition-all duration-300"
            />
          </svg>
          {/* <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[0.625rem] font-450 text-gray-700">
              {progressPercentage}%
            </span>
          </div> */}
        </div>

        {/* Policy Info */}
        <div className="flex-1 text-left">
          <div className="text-sm font-450 text-gray-900">
            Eval {index + 1} • {policy.name}
          </div>
          {!isExpanded && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
            <span>{progressPercentage}% Completed</span>
            {activeCheckpoint && (
              <>
                <span>•</span>
                <span>{activeCheckpoint.label}</span>
              </>
            )}
          </div>
          )}
        </div>

        {/* Expand/Collapse Icon */}
        {isExpanded ? (
          <ChevronsDownUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronsUpDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expanded Content - Detailed Checkpoints */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pt-1 pb-3 space-y-3">
              {checkpoints.map((checkpoint) => (
                <CheckpointDisplay
                  key={checkpoint.id}
                  label={checkpoint.label}
                  status={checkpoint.status}
                  detail={checkpoint.detail}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
