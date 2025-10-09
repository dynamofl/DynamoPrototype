import { useState, useMemo } from "react";
import { X, Check } from "lucide-react";
import { EvaluationSetup } from "./evaluation-setup";
import { DatasetSelection } from "./dataset-selection";
import { DatasetAugmentation } from "./dataset-augmentation";
import { GuardrailSelection } from "./guardrail-selection";
import { AISystemSelection } from "./ai-system-selection";
import { EvaluationReview } from "./evaluation-review";
import type { EvaluationCreationData } from "../../types/evaluation-creation";
import type { AISystem } from "@/features/ai-systems/types/types";
import { getStepFlow, type StepId } from "../../constants/evaluation-steps";

interface EvaluationCreationFlowProps {
  onComplete: (data: EvaluationCreationData) => void;
  onCancel: () => void;
  variant?: "overlay" | "onboarding";
  aiSystemId?: string; // AI system being evaluated (deprecated - use aiSystem instead)
  aiSystem?: AISystem; // Full AI system object being evaluated
}

export function EvaluationCreationFlow({
  onComplete,
  onCancel,
  variant = "overlay",
  aiSystemId,
  aiSystem,
}: EvaluationCreationFlowProps) {
  const [currentStepId, setCurrentStepId] = useState<StepId>("setup");
  const [evaluationData, setEvaluationData] = useState<Partial<EvaluationCreationData>>({
    aiSystemIds: aiSystem?.id ? [aiSystem.id] : aiSystemId ? [aiSystemId] : undefined,
  });
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Get the current step flow based on evaluation type
  const stepFlow = useMemo(() => {
    return getStepFlow(evaluationData.type);
  }, [evaluationData.type]);

  // Get current step index
  const currentStepIndex = stepFlow.steps.findIndex((step) => step.id === currentStepId);

  const handleDataChange = (data: Partial<EvaluationCreationData>) => {
    setEvaluationData((prev) => ({ ...prev, ...data }));
  };

  const transitionToStep = (stepId: StepId) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStepId(stepId);
      setIsTransitioning(false);
    }, 150);
  };

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < stepFlow.steps.length) {
      transitionToStep(stepFlow.steps[nextIndex].id);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      transitionToStep(stepFlow.steps[prevIndex].id);
    }
  };

  // Wrapper styling based on variant
  const containerClasses = variant === "overlay"
    ? "fixed inset-0 z-50 flex flex-col m-4"
    : "w-full h-full flex flex-col";

  return (
    <div className={containerClasses}>
      {/* Top Navigation Bar - Show only after first step */}
      {currentStepId !== "setup" && (
        <div className="border-b border-gray-200">
          <div className=" mx-auto px-8 py-3">
            <div className="flex items-center justify-between">
              {/* Title */}

              {/* Cancel button - only in overlay mode */}
              {variant === "overlay" && (
                <button
                  onClick={onCancel}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              )}
            </div>

            {/* Horizontal Steps */}
            <div className="flex items-center justify-center gap-3">
              {stepFlow.steps.map((step, index) => {
                const isActive = currentStepId === step.id;
                const isCompleted = currentStepIndex > index;

                return (
                  <div key={step.id} className="flex items-center">
                    {/* Step Badge */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full text-[0.8125rem]  font-450 transition-colors ${
                          isActive
                            ? "bg-blue-100 text-blue-800"
                            : isCompleted
                            ? "bg-gray-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span className={`text-[0.8125rem]  font-450 pr-2 ${
                        isActive ? "text-gray-900" : "text-gray-600"
                      }`}>
                        {step.title}
                      </span>
                    </div>

                    {/* Arrow between steps */}
                    {index < stepFlow.steps.length - 1 && (
                      <svg
                        className="w-4 h-4 mx-2 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className={`max-w-2xl mx-auto py-12 px-8 transition-all duration-200 ${
          isTransitioning ? "opacity-0 blur-sm" : "opacity-100 blur-0"
        }`}>
          {currentStepId === "setup" && (
            <EvaluationSetup
              data={evaluationData}
              onDataChange={handleDataChange}
              onNext={handleNext}
              onCancel={onCancel}
              variant={variant}
              aiSystem={aiSystem}
            />
          )}
          {currentStepId === "dataset-selection" && (
            <DatasetSelection
              data={evaluationData}
              onDataChange={handleDataChange}
              onNext={handleNext}
              onBack={handleBack}
              variant={variant}
            />
          )}
          {currentStepId === "dataset-augmentation" && (
            <DatasetAugmentation
              data={evaluationData}
              onDataChange={handleDataChange}
              onNext={handleNext}
              onBack={handleBack}
              variant={variant}
            />
          )}
          {currentStepId === "guardrail-selection" && (
            <GuardrailSelection
              data={evaluationData}
              onDataChange={handleDataChange}
              onNext={handleNext}
              onBack={handleBack}
              variant={variant}
            />
          )}
          {currentStepId === "ai-system-selection" && (
            <AISystemSelection
              data={evaluationData}
              onDataChange={handleDataChange}
              onNext={handleNext}
              onBack={handleBack}
              variant={variant}
            />
          )}
          {currentStepId === "review" && (
            <EvaluationReview
              data={evaluationData}
              onDataChange={handleDataChange}
              onBack={handleBack}
              onEditStep={transitionToStep}
              onComplete={() => {
                if (evaluationData.name && evaluationData.type) {
                  onComplete(evaluationData as EvaluationCreationData);
                }
              }}
              variant={variant}
            />
          )}
        </div>
      </div>
    </div>
  );
}
