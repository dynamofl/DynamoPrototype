import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EvaluationCreationStepProps } from "../types/evaluation-creation";

export type PerturbationType = "rewording" | "misspelling" | "leet" | "random-upper";

export interface PerturbationConfig {
  type: PerturbationType;
  enabled: boolean;
  combinations: number;
}

interface PerturbationOption {
  type: PerturbationType;
  title: string;
  description: string;
  example: string;
}

const PERTURBATION_OPTIONS: PerturbationOption[] = [
  {
    type: "rewording",
    title: "Rewording",
    description: "Rephrase prompts while maintaining the same intent and meaning",
    example: '"Tell me a joke" → "Can you share a funny story?"',
  },
  {
    type: "misspelling",
    title: "Common Misspelling",
    description: "Introduce typical spelling errors to test robustness",
    example: '"The quick brown fox" → "The quik brown fox"',
  },
  {
    type: "leet",
    title: "Leet Letters",
    description: "Replace letters with numbers and special characters (1337 speak)",
    example: '"Hello world" → "H3ll0 w0rld"',
  },
  {
    type: "random-upper",
    title: "Random Upper Case",
    description: "Randomly capitalize letters throughout the text",
    example: '"testing system" → "TeStInG sYsTeM"',
  },
];

const COMBINATION_OPTIONS = [1, 2, 3, 4, 5];

export function DatasetAugmentation({
  data,
  onDataChange,
  onNext,
  onBack,
  variant = "overlay",
}: EvaluationCreationStepProps) {
  const [perturbations, setPerturbations] = useState<PerturbationConfig[]>(
    data.perturbations || []
  );
  const [globalCombinations, setGlobalCombinations] = useState<number>(1);

  const handleTogglePerturbation = (type: PerturbationType, enabled: boolean) => {
    setPerturbations((prev) => {
      const existing = prev.find((p) => p.type === type);

      if (enabled) {
        if (existing) {
          // Already exists, just enable it
          return prev.map((p) =>
            p.type === type ? { ...p, enabled: true } : p
          );
        } else {
          // Add new perturbation with current global combinations
          return [...prev, { type, enabled: true, combinations: globalCombinations }];
        }
      } else {
        // Disable perturbation
        return prev.map((p) =>
          p.type === type ? { ...p, enabled: false } : p
        );
      }
    });
  };

  const handleGlobalCombinationsChange = (combinations: number) => {
    setGlobalCombinations(combinations);
    // Update all enabled perturbations with the new combinations value
    setPerturbations((prev) =>
      prev.map((p) => (p.enabled ? { ...p, combinations } : p))
    );
  };

  const isPerturbationEnabled = (type: PerturbationType): boolean => {
    const perturbation = perturbations.find((p) => p.type === type);
    return perturbation?.enabled || false;
  };

  const handleContinue = () => {
    // Only save enabled perturbations
    const enabledPerturbations = perturbations.filter((p) => p.enabled);
    onDataChange({ perturbations: enabledPerturbations });
    onNext?.();
  };

  const handleSkip = () => {
    onDataChange({ perturbations: [] });
    onNext?.();
  };

  const hasEnabledPerturbations = perturbations.some((p) => p.enabled);

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-lg font-450 text-gray-900">
            Augment Test Dataset (Optional)
          </h2>
          <p className="text-[0.8125rem]  text-gray-600">
            Apply perturbations to your test dataset to enhance coverage and test
            system robustness against variations.
          </p>
        </div>

        {/* Perturbation Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-600">
              Perturbation Options
            </Label>
            {hasEnabledPerturbations && (
              <span className="text-xs text-gray-500">
                {perturbations.filter((p) => p.enabled).length} selected
              </span>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              {PERTURBATION_OPTIONS.map((option) => {
                const isEnabled = isPerturbationEnabled(option.type);

                return (
                  <div
                    key={option.type}
                    className="flex items-start gap-3 m-1 rounded-md p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={`perturbation-${option.type}`}
                      checked={isEnabled}
                      onCheckedChange={(checked) =>
                        handleTogglePerturbation(option.type, checked as boolean)
                      }
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`perturbation-${option.type}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[0.8125rem]  font-450 text-gray-900">
                          {option.title}
                        </span>
                        <Tooltip delayDuration={200}>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex items-center"
                              onClick={(e) => e.preventDefault()}
                            >
                              <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-xs">{option.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="">
                        <p className="text-xs text-gray-500">
                          <span className="font-450">Example: </span>
                          {option.example}
                        </p>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Global Variations Control */}
        {hasEnabledPerturbations && (
          <div className="">
            <div className="flex flex-col gap-3">
              <Label
                htmlFor="global-combinations"
                className="text-xs font-450 text-gray-600"
              >
                Variations Per Prompt
              </Label>
              <div className="flex flex-col gap-2">
              <Select
                value={globalCombinations.toString()}
                onValueChange={(value) =>
                  handleGlobalCombinationsChange(parseInt(value))
                }
              >
                <SelectTrigger
                  id="global-combinations"
                  className="w-20 h-8 text-sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMBINATION_OPTIONS.map((num) => (
                    <SelectItem
                      key={num}
                      value={num.toString()}
                      className="text-sm"
                    >
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-xs text-gray-600">
                Each prompt will generate {globalCombinations}{" "}
                {globalCombinations === 1 ? "variation" : "variations"} for each
                selected perturbation type.
              </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleSkip}>
              Skip for Now
            </Button>
            <Button onClick={handleContinue}>Continue</Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
