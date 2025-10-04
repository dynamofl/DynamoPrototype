import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { EvaluationTest } from '../types/evaluation-test';

interface EvaluationProgressSidebarProps {
  test: EvaluationTest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvaluationProgressSidebar({
  test,
  open,
  onOpenChange
}: EvaluationProgressSidebarProps) {
  if (!test) return null;

  const progress = test.progress || { current: 0, total: test.input.prompts.length };
  const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Test In Progress
          </SheetTitle>
          <SheetDescription>
            {test.name}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Progress Overview */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-semibold text-gray-900">
                {progress.current} / {progress.total} prompts
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <p className="text-xs text-gray-500">
              {progressPercentage.toFixed(0)}% complete
            </p>
          </div>

          {/* Current Prompt */}
          {progress.currentPrompt && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Current Prompt</span>
                <Badge variant="outline" className="text-xs">
                  Processing
                </Badge>
              </div>
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {progress.currentPrompt}
                </p>
              </div>
            </div>
          )}

          {/* Test Configuration */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Configuration</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Candidate Model</span>
                <span className="text-sm font-medium text-gray-900">
                  {test.config.candidateModel}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Judge Model</span>
                <span className="text-sm font-medium text-gray-900">
                  {test.config.judgeModel}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Temperature</span>
                <span className="text-sm font-medium text-gray-900">
                  {test.config.temperature}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Max Length</span>
                <span className="text-sm font-medium text-gray-900">
                  {test.config.maxLength}
                </span>
              </div>
              {test.config.guardrails && test.config.guardrails.length > 0 && (
                <div className="flex justify-between items-start py-2">
                  <span className="text-sm text-gray-600">Guardrails</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                    {test.config.guardrails.map((guardrail) => (
                      <Badge key={guardrail.id} variant="secondary" className="text-xs">
                        {guardrail.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Test Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">Timeline</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-xs text-gray-500">
                    {new Date(test.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {test.startedAt && (
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Started</p>
                    <p className="text-xs text-gray-500">
                      {new Date(test.startedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display (if any) */}
          {test.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Error Occurred</p>
                  <p className="text-xs text-red-700 mt-1">{test.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
