import { useState, useEffect } from "react";
import { Check, Loader2, Circle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressCheckpoint {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed';
  detail?: string;
}

interface ProgressCheckpointsSectionProps {
  current: number;
  total: number;
  stage: string;
  startedAt?: string;
}

function getCheckpoints(progress: { current: number; total: number; stage: string }): ProgressCheckpoint[] {
  const { current, total, stage } = progress;
  const stageLower = stage.toLowerCase();

  // Determine current stage from stage string
  const isGeneratingTopics = stageLower.includes('generating topics') || stageLower.includes('topic generation');
  const isGeneratingPrompts = stageLower.includes('generating test prompts') || stageLower.includes('generating prompts') || stageLower.includes('prompt generation');
  const isEvaluating = stageLower.includes('evaluating') || (current > 0 && current < total);
  const isStructuring = stageLower.includes('structuring') || stageLower.includes('structure') || (current === total && total > 0);

  // Topics checkpoint
  const topicsStatus: 'pending' | 'in-progress' | 'completed' =
    isGeneratingTopics ? 'in-progress' :
    (isGeneratingPrompts || isEvaluating || isStructuring) ? 'completed' :
    'pending';

  // Prompts checkpoint
  const promptsStatus: 'pending' | 'in-progress' | 'completed' =
    isGeneratingPrompts ? 'in-progress' :
    (isEvaluating || isStructuring) ? 'completed' :
    topicsStatus === 'completed' ? 'pending' :
    'pending';

  // Evaluation checkpoint
  const evaluationStatus: 'pending' | 'in-progress' | 'completed' =
    isEvaluating ? 'in-progress' :
    isStructuring ? 'completed' :
    (promptsStatus === 'completed' && total > 0) ? 'pending' :
    'pending';

  // Summary checkpoint
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

export function ProgressCheckpointsSection({
  current,
  total,
  stage,
  startedAt
}: ProgressCheckpointsSectionProps) {
  const [timeElapsed, setTimeElapsed] = useState(formatTimeElapsed(startedAt));
  const checkpoints = getCheckpoints({ current, total, stage });
  const progressPercentage = total > 0 ? Math.round((current / total) * 100) : 0;

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

        {/* Checkpoints */}
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
      </div>
    </div>
  );
}
