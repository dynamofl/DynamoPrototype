import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Edit2 } from "lucide-react";
import { useGuardrails } from "@/features/guardrails/lib/useGuardrails";
import type { EvaluationCreationStepProps } from "../types/evaluation-creation";

interface Step4Props extends EvaluationCreationStepProps {
  onEditStep: (step: number) => void;
  onComplete: () => void;
}

export function EvaluationCreationStep4({
  data,
  onBack,
  onEditStep,
  onComplete,
}: Step4Props) {
  const { guardrails: allGuardrails } = useGuardrails();

  // Get selected policies/guardrails
  const selectedPolicies = allGuardrails.filter((g) =>
    data.policyIds?.includes(g.id)
  );
  const selectedGuardrails = allGuardrails.filter((g) =>
    data.guardrailIds?.includes(g.id)
  );

  // Calculate total prompts
  const totalEstimatedPrompts = data.policyDatasets?.reduce(
    (sum, dataset) => sum + dataset.estimatedPrompts,
    0
  ) || 0;

  const totalUploadedPrompts = data.policyDatasets?.reduce(
    (sum, dataset) => sum + (dataset.additionalPrompts?.length || 0),
    0
  ) || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-450 text-gray-900">Review and Evaluate</h2>
        <p className="text-[0.8125rem]  text-gray-600">
          Review your evaluation configuration before running it.
        </p>
      </div>

      {/* Review Sections */}
      <div className="border border-gray-200 rounded-lg p-3 space-y-4">
        {/* Section 1: Evaluation Setup */}
        <div className="border-b border-gray-200 pb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[0.8125rem]  font-450 text-gray-600">Evaluation Info</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(1)}
              className="h-8 px-2"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-start gap-2">
              <span className="text-[0.8125rem]  font-450 text-gray-900">{data.name}</span>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="secondary" className="text-xs">
                {data.type === "compliance" ? "Compliance Evaluation" : "Jailbreak Evaluation"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Section 2: Test Dataset */}
        <div className="border-b border-gray-200 pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.8125rem]  font-450 text-gray-600">Test Dataset</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(2)}
              className="h-8 px-2"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>
          {selectedPolicies.length > 0 ? (
            <div className="space-y-2 mt-1 ">
             
              <div className="space-y-2">
                {selectedPolicies.map((policy) => {
                  const dataset = data.policyDatasets?.find(
                    (d) => d.policyId === policy.id
                  );
                  return (
                    <div
                      key={policy.id}
                      className="flex items-center gap-2 text-[0.8125rem]   py-1.5"
                    >
                      <span className="text-gray-900">{policy.name}</span>
                      {policy.category && (
                        <Badge variant="secondary" className="text-xs">
                          {policy.category}
                        </Badge>
                      )}
                      {dataset && (
                        <span className="text-gray-600 ml-auto">
                          {dataset.estimatedPrompts} prompts
                          {dataset.additionalPrompts &&
                            ` + ${dataset.additionalPrompts.length} uploaded`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">No policies selected</p>
          )}
        </div>

        {/* Section 3: Guardrails */}
        <div className="">
          <div className="flex items-center justify-between">
            <h3 className="text-[0.8125rem]  font-450 text-gray-600">Guardrails</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep(3)}
              className="gap-2 "
            >
              <Edit2 className="h-3 w-3" />
              Edit
            </Button>
          </div>
          {selectedGuardrails.length > 0 ? (
            <div className="space-y-1 mt-2 ">
              {/* <div className="flex items-start gap-2">
                <span className="text-xs text-gray-600 min-w-[120px]">
                  Selected Guardrails:
                </span>
                <span className="text-xs font-450 text-gray-900">
                  {selectedGuardrails.length}{" "}
                  {selectedGuardrails.length === 1 ? "guardrail" : "guardrails"}
                </span>
              </div> */}
              <div className="space-y-1">
                {selectedGuardrails.map((guardrail) => (
                  <div
                    key={guardrail.id}
                    className="flex items-center gap-2 text-[0.8125rem]  py-1.5"
                  >
                    <span className="text-gray-900">{guardrail.name}</span>
                    {guardrail.category && (
                      <Badge variant="secondary" className="text-xs">
                        {guardrail.category}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="pt-2 text-xs text-gray-400">No guardrails selected (Optional)</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onComplete} className="gap-2"><Play className="w-3 h-3" />Run Evaluation</Button>
      </div>
    </div>
  );
}
