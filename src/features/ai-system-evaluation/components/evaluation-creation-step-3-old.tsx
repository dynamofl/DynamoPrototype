import { useState, useEffect } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useGuardrails } from "@/features/guardrails/lib/useGuardrails";
import type { EvaluationCreationStepProps, DatasetConfig } from "../types/evaluation-creation";

export function EvaluationCreationStep3({
  data,
  onDataChange,
  onNext,
  onBack,
}: EvaluationCreationStepProps) {
  const { guardrails: allGuardrails } = useGuardrails();
  const selectedGuardrails = allGuardrails.filter((g) =>
    data.guardrailIds?.includes(g.id)
  );

  // Initialize dataset configs for each selected guardrail
  const [datasetConfigs, setDatasetConfigs] = useState<DatasetConfig[]>(() => {
    if (data.datasets) return data.datasets;

    return selectedGuardrails.map((g) => ({
      guardrailId: g.id,
      generateFromPolicy: true,
      promptCount: 10,
    }));
  });

  // Update when guardrails change
  useEffect(() => {
    const currentGuardrailIds = datasetConfigs.map((d) => d.guardrailId);
    const newGuardrailIds = selectedGuardrails.map((g) => g.id);

    // Add configs for new guardrails
    const missingConfigs = selectedGuardrails
      .filter((g) => !currentGuardrailIds.includes(g.id))
      .map((g) => ({
        guardrailId: g.id,
        generateFromPolicy: true,
        promptCount: 10,
      }));

    if (missingConfigs.length > 0) {
      setDatasetConfigs((prev) => [...prev, ...missingConfigs]);
    }

    // Remove configs for deselected guardrails
    const removedConfigs = datasetConfigs.filter((d) =>
      !newGuardrailIds.includes(d.guardrailId)
    );

    if (removedConfigs.length > 0) {
      setDatasetConfigs((prev) =>
        prev.filter((d) => newGuardrailIds.includes(d.guardrailId))
      );
    }
  }, [selectedGuardrails]);

  const handleToggleGenerate = (guardrailId: string) => {
    setDatasetConfigs((prev) =>
      prev.map((config) =>
        config.guardrailId === guardrailId
          ? { ...config, generateFromPolicy: !config.generateFromPolicy }
          : config
      )
    );
  };

  const handlePromptCountChange = (guardrailId: string, count: string) => {
    const numCount = parseInt(count) || 10;
    setDatasetConfigs((prev) =>
      prev.map((config) =>
        config.guardrailId === guardrailId
          ? { ...config, promptCount: Math.max(1, Math.min(100, numCount)) }
          : config
      )
    );
  };

  const handleFileUpload = async (guardrailId: string, file: File | null) => {
    if (!file) {
      setDatasetConfigs((prev) =>
        prev.map((config) =>
          config.guardrailId === guardrailId
            ? { ...config, uploadedFile: undefined, uploadedData: undefined }
            : config
        )
      );
      return;
    }

    // Read and parse the file
    try {
      const text = await file.text();
      const lines = text.split('\n').filter((line) => line.trim());

      // Simple CSV/text parsing - each line is a prompt
      const uploadedData = lines.map((line) => ({
        prompt: line.trim()
      }));

      setDatasetConfigs((prev) =>
        prev.map((config) =>
          config.guardrailId === guardrailId
            ? { ...config, uploadedFile: file, uploadedData }
            : config
        )
      );
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const handleContinue = () => {
    onDataChange({ datasets: datasetConfigs });
    onNext?.();
  };

  const handleSkip = () => {
    onDataChange({ datasets: [] });
    onNext?.();
  };

  const hasAnyDataset = datasetConfigs.some(
    (config) => config.generateFromPolicy || config.uploadedData
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-450 text-gray-900">
          Prepare Dataset for Evaluation
        </h2>
        <p className="text-[13px] text-gray-600">
          Configure how test prompts will be generated from each policy condition and optionally upload additional datasets.
        </p>
      </div>

      {/* No Policies Selected Warning */}
      {selectedGuardrails.length === 0 && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              No Policies Selected
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Please go back to Step 2 and select at least one policy to generate datasets for evaluation.
            </p>
          </div>
        </div>
      )}

      {/* Dataset Configuration for Each Guardrail */}
      {selectedGuardrails.length > 0 && (
        <div className="space-y-6">
          {selectedGuardrails.map((guardrail) => {
            const config = datasetConfigs.find((d) => d.guardrailId === guardrail.id);
            if (!config) return null;

            return (
              <div
                key={guardrail.id}
                className="border border-gray-200 rounded-lg p-5 space-y-4"
              >
                {/* Policy Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-450 text-gray-900">
                        {guardrail.name}
                      </h3>
                      {guardrail.category && (
                        <Badge variant="secondary" className="text-xs">
                          {guardrail.category}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Policy condition: {guardrail.description}
                    </p>
                  </div>
                </div>

                {/* Generate from Policy */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={`generate-${guardrail.id}`}
                      checked={config.generateFromPolicy}
                      onCheckedChange={() => handleToggleGenerate(guardrail.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={`generate-${guardrail.id}`}
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        Generate Test Prompts from Policy Condition
                      </label>
                      <p className="text-xs text-gray-600 mt-0.5">
                        Automatically generate benchmark prompts based on this policy's condition
                      </p>
                    </div>
                  </div>

                  {/* Prompt Count Input */}
                  {config.generateFromPolicy && (
                    <div className="ml-7 space-y-1.5">
                      <Label htmlFor={`prompt-count-${guardrail.id}`} className="text-xs text-gray-600">
                        Number of Prompts to Generate
                      </Label>
                      <Input
                        id={`prompt-count-${guardrail.id}`}
                        type="number"
                        min="1"
                        max="100"
                        value={config.promptCount || 10}
                        onChange={(e) =>
                          handlePromptCountChange(guardrail.id, e.target.value)
                        }
                        className="w-32"
                      />
                      <p className="text-xs text-gray-500">
                        Min: 1, Max: 100
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Additional Dataset */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Upload Additional Dataset
                    </label>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Upload a CSV or text file with additional test prompts (one per line)
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label
                      htmlFor={`file-upload-${guardrail.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Choose File
                    </label>
                    <input
                      id={`file-upload-${guardrail.id}`}
                      type="file"
                      accept=".csv,.txt"
                      onChange={(e) =>
                        handleFileUpload(guardrail.id, e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                    {config.uploadedFile && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText className="h-4 w-4" />
                        <span>{config.uploadedFile.name}</span>
                        <span className="text-xs text-gray-500">
                          ({config.uploadedData?.length || 0} prompts)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button
            onClick={handleContinue}
            disabled={selectedGuardrails.length === 0 || !hasAnyDataset}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
