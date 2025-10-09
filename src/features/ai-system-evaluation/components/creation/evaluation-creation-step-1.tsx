import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { EvaluationCreationStepProps, EvaluationType } from "../types/evaluation-creation";

export function EvaluationCreationStep1({
  data,
  onDataChange,
  onNext,
  onCancel,
  variant = "overlay",
}: EvaluationCreationStepProps) {
  const [name, setName] = useState(data.name || "");
  const [type, setType] = useState<EvaluationType | undefined>(data.type);
  const [nameError, setNameError] = useState("");

  const validateAndProceed = () => {
    // Validate name
    if (!name.trim()) {
      setNameError("Evaluation name is required");
      return;
    }
    if (name.trim().length < 3) {
      setNameError("Evaluation name must be at least 3 characters");
      return;
    }
    if (!type) {
      return;
    }

    setNameError("");
    // Update parent data before proceeding
    onDataChange({ name, type });
    onNext?.();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (nameError) {
      setNameError("");
    }
  };

  const handleTypeChange = (value: string) => {
    setType(value as EvaluationType);
  };

  const isValid = name.trim().length >= 3 && type !== undefined;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-450 text-gray-900">
          {variant === "onboarding"
            ? "Let's create your first evaluation"
            : "Let's start with some basics"
          }
        </h2>
        <p className="text-sm text-gray-600">
          {variant === "onboarding"
            ? "Set up your first evaluation to start testing your AI system's safety and performance."
            : "Choose your evaluation name and type to get started."
          }
        </p>
      </div>

      {/* Evaluation Name */}
      <div className="space-y-2">
        <Label htmlFor="evaluation-name">Evaluation name</Label>
        <Input
          id="evaluation-name"
          placeholder="e.g., Production Safety Test"
          value={name}
          onChange={handleNameChange}
          error={nameError}
          autoFocus
        />
      </div>

      {/* Evaluation Type */}
      <div className="space-y-2">
        <Label>Type of Evaluation</Label>
        <RadioGroup
          value={type}
          onValueChange={handleTypeChange}
        >
          <div className="space-y-3">
            {/* Compliance Evaluation */}
            <div
              className="flex items-start space-x-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => handleTypeChange('compliance')}
            >
              <RadioGroupItem value="compliance" id="compliance" className="mt-1" />
              <div className="flex-1">
                <label
                  htmlFor="compliance"
                  className="text-sm font-450 text-gray-900 cursor-pointer"
                >
                  Compliance
                </label>
                <p className="text-[0.8125rem]  text-gray-600 mt-1">
                  Test against regulatory and organizational compliance requirements
                </p>
              </div>
            </div>

            {/* Jailbreak Evaluation */}
            <div
              className="flex items-start space-x-3 rounded-lg border border-gray-200 px-4 py-3 hover:border-gray-300 transition-colors cursor-pointer"
              onClick={() => handleTypeChange('jailbreak')}
            >
              <RadioGroupItem value="jailbreak" id="jailbreak" className="mt-1" />
              <div className="flex-1">
                <label
                  htmlFor="jailbreak"
                  className="text-sm font-450 text-gray-900 cursor-pointer"
                >
                  Jailbreak
                </label>
                <p className="text-[0.8125rem]  text-gray-600 mt-1">
                  Evaluate resilience against adversarial attacks and prompt injection
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-2">
        <Button onClick={validateAndProceed} disabled={!isValid}>
          Continue
        </Button>
      </div>
    </div>
  );
}
