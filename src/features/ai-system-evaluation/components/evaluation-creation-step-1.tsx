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
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Let's start with some basics</h2>
        <p className="text-sm text-gray-600 mt-2">
          Choose your evaluation name and type to get started.
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
      <div className="space-y-3">
        <Label>Type of evaluation</Label>
        <RadioGroup
          value={type}
          onValueChange={handleTypeChange}
        >
          <div className="space-y-3">
            {/* Compliance Evaluation */}
            <div className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors cursor-pointer">
              <RadioGroupItem value="compliance" id="compliance" className="mt-0.5" />
              <div className="flex-1">
                <label
                  htmlFor="compliance"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Compliance
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Test against regulatory and organizational compliance requirements
                </p>
              </div>
            </div>

            {/* Jailbreak Evaluation */}
            <div className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors cursor-pointer">
              <RadioGroupItem value="jailbreak" id="jailbreak" className="mt-0.5" />
              <div className="flex-1">
                <label
                  htmlFor="jailbreak"
                  className="text-sm font-medium text-gray-900 cursor-pointer"
                >
                  Jailbreak
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  Evaluate resilience against adversarial attacks and prompt injection
                </p>
              </div>
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <Button onClick={validateAndProceed} disabled={!isValid}>
          Continue
        </Button>
      </div>
    </div>
  );
}
