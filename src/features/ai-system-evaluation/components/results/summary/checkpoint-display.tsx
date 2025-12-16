import { CircleCheck, Loader2, CircleDashed } from 'lucide-react';

export interface CheckpointDisplayProps {
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
  detail?: string;
}

/**
 * CheckpointDisplay component shows a single checkpoint with its status icon and label.
 * Used to display evaluation progress checkpoints (Topics, Prompts, Evaluation, Summary).
 */
export function CheckpointDisplay({ label, status, detail }: CheckpointDisplayProps) {
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
      </div>

      {/* Label and Detail */}
      <div className={`flex-1 pl-0.5 flex items-center gap-1 text-sm font-400 ${status == 'in_progress' ? "text-gray-900" : "text-gray-600" }`}>
        <div className="">
          {label}
        </div>
        {detail && status=='in_progress' && (
          <div className="">
            ({detail})
          </div>
        )}
      </div>
    </div>
  );
}
