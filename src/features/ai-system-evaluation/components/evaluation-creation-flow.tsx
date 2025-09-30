import { useState } from "react";
import { X } from "lucide-react";
import { EvaluationCreationStep1 } from "./evaluation-creation-step-1";
import { EvaluationCreationStep2 } from "./evaluation-creation-step-2";
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
  { number: 2, title: "Add Guardrails"},
  { number: 3, title: "Configure Tests" },
  { number: 4, title: "Review and Finish" },
];

export function EvaluationCreationFlow({
  onComplete,
  onCancel,
  variant = "overlay",
}: EvaluationCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [evaluationData, setEvaluationData] = useState<Partial<EvaluationCreationData>>({});

  const handleDataChange = (data: Partial<EvaluationCreationData>) => {
    setEvaluationData((prev) => ({ ...prev, ...data }));
  };

  const handleStep1Next = () => {
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
                      className={`flex items-center justify-center px-2.5 py-0.5 rounded-md text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-blue-100 text-blue-800"
                          : isCompleted
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {step.number}
                    </div>
                    <span className={`text-sm font-medium pr-2 ${
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
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-2xl mx-auto py-12 px-8">
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
              onNext={() => setCurrentStep(3)}
              onBack={handleBack}
              variant={variant}
            />
          )}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Review and finish</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Step 3 will be implemented next.
                </p>
              </div>
              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 bg-white"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (evaluationData.name && evaluationData.type) {
                      onComplete(evaluationData as EvaluationCreationData);
                    }
                  }}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Evaluation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
