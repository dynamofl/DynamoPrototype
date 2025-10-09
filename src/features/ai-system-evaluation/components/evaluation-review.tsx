import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Edit2 } from "lucide-react";
import { useGuardrailsSupabase } from "@/features/guardrails/lib/useGuardrailsSupabase";
import { AISystemsStorage } from "@/features/ai-systems/lib";
import { AISystemIcon } from "@/components/patterns/ui-patterns/ai-system-icon";
import { PolicyIcon } from "@/assets/icons/policy-icon";
import type { EvaluationCreationStepProps } from "../types/evaluation-creation";
import type { StepId } from "../constants/evaluation-steps";
import type { AISystem } from "@/features/ai-systems/types/types";

interface EvaluationReviewProps extends EvaluationCreationStepProps {
  onEditStep: (stepId: StepId) => void;
  onComplete: () => void;
}

export function EvaluationReview({
  data,
  onBack,
  onEditStep,
  onComplete,
}: EvaluationReviewProps) {
  const { guardrails: allGuardrails } = useGuardrailsSupabase();
  const [allAISystems, setAllAISystems] = useState<AISystem[]>([]);

  // Load AI systems on mount
  useEffect(() => {
    const loadAISystems = async () => {
      const storage = new AISystemsStorage();
      const systems = await storage.getAISystems();
      setAllAISystems(systems);
    };
    loadAISystems();
  }, []);

  // Get selected policies/guardrails/systems
  const selectedPolicies = allGuardrails.filter((g) =>
    data.policyIds?.includes(g.id)
  );

  // Guardrails attached in setup step
  const setupGuardrails = allGuardrails.filter((g) =>
    data.guardrailIds?.includes(g.id)
  );

  // Additional guardrails selected in guardrail-selection step (for compliance)
  const selectedGuardrails = allGuardrails.filter((g) =>
    data.guardrailIds?.includes(g.id)
  );

  const selectedAISystems = allAISystems.filter((s) =>
    data.aiSystemIds?.includes(s.id)
  );

  // Get the AI system being evaluated (first in the list)
  const evaluatingSystem = selectedAISystems[0];

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
          <div className="flex  justify-between mb-3 border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[0.8125rem]  font-450 text-gray-900">{data.name}</span>
              <Badge variant="secondary" className="text-xs">
                {data.type === "compliance" ? "Compliance Evaluation" : "Jailbreak Evaluation"}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep("setup")}
              className="h-8 px-2"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              Edit
            </Button>
          </div>

          <div className="space-y-1">
            {/* Evaluation Name and Type */}
            

            {/* Evaluating AI System */}
            {evaluatingSystem && (
              <div>
                <p className="text-[0.8125rem]  font-450 text-gray-600 my-2">Evaluating AI System</p>
                <div className="flex items-center gap-2 py-1.5">
                  <div className="flex items-center gap-2">
                  <AISystemIcon
                    type={evaluatingSystem.icon}
                    className="h-4 w-4"
                  />
                  <span className="text-[0.8125rem]  text-gray-900">{evaluatingSystem.name}</span>
                  </div>

                  <p className="text-[0.8125rem]  text-gray-600"> ({evaluatingSystem.providerName} • {evaluatingSystem.selectedModel})</p>
           
                </div>
              </div>
            )}

            {/* Attached Guardrails from Setup */}
            {setupGuardrails.length > 0 && (
              <div>
                <div className="space-y-1">
                  {setupGuardrails.map((guardrail) => (
                    <div
                      key={guardrail.id}
                      className="flex items-center gap-2 py-1.5"
                    >
                      <PolicyIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-[0.8125rem]  text-gray-900">{guardrail.name}</span>
                      {guardrail.category && (
                        <Badge variant="secondary" className="">
                          {guardrail.category}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Test Dataset */}
        <div className={`pb-3 ${
          data.type === "compliance" && data.perturbations && data.perturbations.length > 0
            ? "border-b border-gray-200"
            : ""
        }`}>
          <div className="flex items-center justify-between">
            <h3 className="text-[0.8125rem]  font-450 text-gray-600">Test Dataset</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditStep("dataset-selection")}
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

        {/* Section 2.5: Dataset Augmentation (for compliance only) */}
        {data.type === "compliance" && data.perturbations && data.perturbations.length > 0 && (
          <div className="pb-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[0.8125rem]  font-450 text-gray-600">Dataset Augmentation</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep("dataset-augmentation")}
                className="h-8 px-2"
              >
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>
            <div className="space-y-1 mt-2">
              {data.perturbations.filter((p) => p.enabled).map((perturbation) => {
                const labels: Record<string, string> = {
                  rewording: "Rewording",
                  misspelling: "Common Misspelling",
                  leet: "Leet Letters",
                  "random-upper": "Random Upper Case",
                };
                return (
                  <div
                    key={perturbation.type}
                    className="flex items-center justify-between text-[0.8125rem]  py-1.5"
                  >
                    <span className="text-gray-900">{labels[perturbation.type]}</span>
                    <span className="text-gray-600">
                      {perturbation.combinations} variation{perturbation.combinations > 1 ? "s" : ""} per prompt
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Guardrails (for compliance) or AI Systems (for jailbreak) */}
        {/* {data.type === "compliance" && (
          <div className="">
            <div className="flex items-center justify-between">
              <h3 className="text-[0.8125rem]  font-450 text-gray-600">Guardrails</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep("guardrail-selection")}
                className="gap-2 "
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            </div>
            {selectedGuardrails.length > 0 ? (
              <div className="space-y-1 mt-2 ">
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
        )}

        {data.type === "jailbreak" && (
          <div className="">
            <div className="flex items-center justify-between">
              <h3 className="text-[0.8125rem]  font-450 text-gray-600">AI Systems</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditStep("ai-system-selection")}
                className="gap-2 "
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </Button>
            </div>
            {selectedAISystems.length > 0 ? (
              <div className="space-y-1 mt-2">
                <div className="space-y-1">
                  {selectedAISystems.map((system) => (
                    <div
                      key={system.id}
                      className="flex items-center gap-2 text-[0.8125rem]  py-1.5"
                    >
                      <AISystemIcon
                        type={system.icon}
                        className="h-4 w-4"
                      />
                      <span className="text-gray-900">{system.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {system.providerName}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="pt-2 text-xs text-gray-400">No AI systems selected</p>
            )}
          </div>
        )} */}
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
