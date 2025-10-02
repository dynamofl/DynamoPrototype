import { useState } from "react";
import { X, Check } from "lucide-react";
import { EvaluationCreationStep1 } from "./evaluation-creation-step-1";
import { EvaluationCreationStep2 } from "./evaluation-creation-step-2";
import { EvaluationCreationStep3 } from "./evaluation-creation-step-3";
import { EvaluationCreationStep4 } from "./evaluation-creation-step-4";
import type { EvaluationCreationData } from "../types/evaluation-creation";

interface EvaluationCreationFlowProps {
  onComplete: (data: EvaluationCreationData) => void;
  onCancel: () => void;
  variant?: "overlay" | "onboarding";
}

interface StepConfig {
  number: number;
  title: string;
}

const STEPS: StepConfig[] = [
  { number: 1, title: "Evaluation Setup" },
  { number: 2, title: "Select Test Dataset"},
  { number: 3, title: "Add Guardrails" },
  { number: 4, title: "Review and Finish" },
];

export function EvaluationCreationFlow({
  onComplete,
  onCancel,
  variant = "overlay",
}: EvaluationCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationData, setEvaluationData] = useState<Partial<EvaluationCreationData>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleDataChange = (data: Partial<EvaluationCreationData>) => {
    setEvaluationData((prev) => ({ ...prev, ...data }));
  };

  const transitionToStep = (step: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(step);
      setIsTransitioning(false);
    }, 150);
  };

  const handleStep1Next = () => {
    transitionToStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      transitionToStep(currentStep - 1);
    }
  };

  // Wrapper styling based on variant
  const containerClasses = variant === "overlay"
    ? "fixed inset-0  z-50 flex flex-col"
    : "w-full h-full flex flex-col";

  return (
    <div className={containerClasses}>
      {/* Top Navigation Bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-8 py-3">
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
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  {/* Step Badge */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-[13px] font-450 transition-colors ${
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
                        step.number
                      )}
                    </div>
                    <span className={`text-[13px] font-450 pr-2 ${
                      isActive ? "text-gray-900" : "text-gray-600"
                    }`}>
                      {step.title}
                    </span>
                  </div>

                  {/* Arrow between steps */}
                  {index < STEPS.length - 1 && (
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className={`max-w-2xl mx-auto py-12 px-8 transition-all duration-200 ${
          isTransitioning ? "opacity-0 blur-sm" : "opacity-100 blur-0"
        }`}>
          {currentStep === 1 && (
            <EvaluationCreationStep1
              data={evaluationData}
              onDataChange={handleDataChange}
              onNext={handleStep1Next}
              onCancel={onCancel}
              variant={variant}
            />
          )}
          {currentStep === 2 && (
            <EvaluationCreationStep2
              data={evaluationData}
              onDataChange={handleDataChange}
              onNext={() => transitionToStep(3)}
              onBack={handleBack}
              variant={variant}
            />
          )}
          {currentStep === 3 && (
            <EvaluationCreationStep3
              data={evaluationData}
              onDataChange={handleDataChange}
              onNext={() => transitionToStep(4)}
              onBack={handleBack}
              variant={variant}
            />
          )}
          {currentStep === 4 && (
            <EvaluationCreationStep4
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
