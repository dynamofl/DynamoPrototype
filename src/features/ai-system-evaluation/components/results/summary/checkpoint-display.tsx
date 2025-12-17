import { CircleCheck, Loader2, CircleDashed, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface CheckpointDisplayProps {
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'stopped';
  detail?: string;
  // Props for restart functionality
  checkpointId?: 'topics' | 'prompts' | 'evaluation' | 'summary';
  evaluationStatus?: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  onRestart?: (checkpointId: 'topics' | 'prompts' | 'evaluation' | 'summary') => void;
}

/**
 * CheckpointDisplay component shows a single checkpoint with its status icon and label.
 * Used to display evaluation progress checkpoints (Topics, Prompts, Evaluation, Summary).
 */
export function CheckpointDisplay({
  label,
  status,
  detail,
  checkpointId,
  evaluationStatus,
  onRestart
}: CheckpointDisplayProps) {
  // Show restart button only when:
  // 1. Evaluation is stopped (cancelled) or completed
  // 2. onRestart callback is provided
  // 3. checkpointId is provided
  // 4. Checkpoint is NOT pending (only show for completed/stopped checkpoints that actually ran)
  const canRestart =
    (evaluationStatus === 'cancelled' || evaluationStatus === 'completed') &&
    onRestart &&
    checkpointId &&
    status !== 'pending';
  return (
    <div className="flex items-start gap-3 px-0.5">
      {/* Status Icon */}
      <div className=" pt-0.5">
        {status === 'completed' && (
          <div className="w-4 h-4 rounded-full flex items-center justify-center">
            <CircleCheck className="w-4 h-4 text-gray-400" strokeWidth={2} />
          </div>
        )}
        {status === 'in_progress' && (
          <div className="w-4 h-4 flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" strokeWidth={2.5} />
          </div>
        )}
        {status === 'pending' && (
          <div className="w-4 h-4 flex items-center justify-center">
            <CircleDashed className="w-4 h-4 text-gray-400" strokeWidth={2} />
          </div>
        )}
        {status === 'stopped' && (
          <div className="w-4 h-4 flex items-center justify-center">
            <Square className="w-3 h-3 text-amber-500 fill-amber-500" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Label and Detail */}
      <div className={`flex-1 pl-0.5 flex items-center gap-1 text-sm font-400 ${status === 'in_progress' || status === 'stopped' ? "text-gray-900" : "text-gray-600" }`}>
        <div className="">
          {label}
        </div>
        {detail && (status === 'in_progress' || status === 'stopped') && (
          <div className="">
            ({detail})
          </div>
        )}
      </div>

      {/* Restart Button - Only show for stopped/completed evaluations */}
      {canRestart && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1 text-gray-600 hover:text-gray-900"
          onClick={() => onRestart(checkpointId)}
        >
          <RotateCcw className="w-3 h-3" />
          Restart
        </Button>
      )}
    </div>
  );
}
