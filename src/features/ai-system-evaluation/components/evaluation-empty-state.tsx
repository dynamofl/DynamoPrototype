import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EvaluationEmptyStateProps {
  onCreateEvaluation: () => void;
}

export function EvaluationEmptyState({ onCreateEvaluation }: EvaluationEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No Evaluations Yet
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Get started by creating your first evaluation to test your AI system's performance,
          compliance, and security.
        </p>

        {/* CTA Button */}
        <Button onClick={onCreateEvaluation} size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Create First Evaluation
        </Button>

        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Evaluations help you ensure your AI system meets safety, compliance, and performance standards
          </p>
        </div>
      </div>
    </div>
  );
}
