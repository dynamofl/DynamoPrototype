import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { AISystemIcon } from "@/components/patterns/ui-patterns/ai-system-icon";
import { useAISystemsSupabase } from "@/features/ai-systems/lib/useAISystemsSupabase";
import { useGuardrailsSupabase } from "@/features/guardrails/lib/useGuardrailsSupabase";
import { GuardrailViewSheet } from "@/features/guardrails/components";
import { PolicyIcon } from "@/assets/icons/policy-icon";
import { Plus, Search, ChevronRight, X } from "lucide-react";
import type { EvaluationCreationStepProps, EvaluationType } from "../../types/evaluation-creation";
import type { AISystem } from "@/features/ai-systems/types/types";
import type { Guardrail } from "@/types";

interface EvaluationSetupProps extends EvaluationCreationStepProps {
  aiSystem?: AISystem; // Full AI system object if already available
}

export function EvaluationSetup({
  data,
  onDataChange,
  onNext,
  onCancel,
  variant = "overlay",
  aiSystem: propAiSystem,
}: EvaluationSetupProps) {
  const [name, setName] = useState(data.name || "");
  const [type, setType] = useState<EvaluationType | undefined>(data.type);
  const [nameError, setNameError] = useState("");
  const [evaluatingSystem, setEvaluatingSystem] = useState<AISystem | null>(propAiSystem || null);
  const [selectedGuardrails, setSelectedGuardrails] = useState<Guardrail[]>([]);
  const [isAddingGuardrail, setIsAddingGuardrail] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredGuardrailId, setHoveredGuardrailId] = useState<string | null>(null);
  const [hoveredSelectedGuardrailId, setHoveredSelectedGuardrailId] = useState<string | null>(null);
  const [viewGuardrailSheetOpen, setViewGuardrailSheetOpen] = useState(false);
  const [selectedGuardrailForView, setSelectedGuardrailForView] = useState<string | null>(null);

  // Only load AI systems if we don't have one passed in
  const { aiSystems, loading: aiSystemsLoading } = useAISystemsSupabase();
  const { guardrails: availableGuardrails } = useGuardrailsSupabase();

  // Filter guardrails based on search query
  const filteredGuardrails = useMemo(() => {
    const activeGuardrails = availableGuardrails.filter(g => g.status === "active");
    if (!searchQuery.trim()) return activeGuardrails;

    const query = searchQuery.toLowerCase();
    return activeGuardrails.filter(
      (guardrail) =>
        guardrail.name.toLowerCase().includes(query) ||
        guardrail.description.toLowerCase().includes(query) ||
        guardrail.category?.toLowerCase().includes(query)
    );
  }, [availableGuardrails, searchQuery]);

  // Load the AI system being evaluated
  useEffect(() => {
    if (data.aiSystemIds && data.aiSystemIds.length > 0 && aiSystems.length > 0) {
      const system = aiSystems.find(s => s.id === data.aiSystemIds![0]);
      if (system) {
        setEvaluatingSystem(system);
      }
    }
  }, [data.aiSystemIds, aiSystems]);

  // Load selected guardrails from data
  useEffect(() => {
    if (data.guardrailIds) {
      const guardrails = availableGuardrails.filter(g =>
        data.guardrailIds!.includes(g.id) && g.status === "active"
      );
      setSelectedGuardrails(guardrails);
    }
  }, [data.guardrailIds, availableGuardrails]);

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
    onDataChange({
      name,
      type,
      guardrailIds: selectedGuardrails.map(g => g.id),
    });
    onNext?.();
  };

  // Guardrail management functions
  const handleToggleGuardrail = (guardrailId: string) => {
    setSelectedGuardrails((prev) => {
      const guardrail = availableGuardrails.find(g => g.id === guardrailId);
      if (!guardrail) return prev;

      if (prev.find(g => g.id === guardrailId)) {
        return prev.filter((g) => g.id !== guardrailId);
      } else {
        return [...prev, guardrail];
      }
    });
  };

  const removeGuardrail = (guardrailId: string) => {
    setSelectedGuardrails(
      selectedGuardrails.filter((g) => g.id !== guardrailId)
    );
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
        <Label htmlFor="evaluation-name">Evaluation Name</Label>
        <Input
          id="evaluation-name"
          placeholder="e.g., Production Safety Test"
          value={name}
          onChange={handleNameChange}
          error={nameError}
          autoFocus
        />
      </div>

      {/* Evaluating AI System Info */}
      {data.aiSystemIds && data.aiSystemIds.length > 0 && (
        <div className="space-y-2">
          <Label>Evaluating AI System</Label>
          {!propAiSystem && (aiSystemsLoading || !evaluatingSystem) ? (
            /* Skeleton Loader - only show if we don't have propAiSystem */
            <div className="space-y-3 rounded-lg bg-gray-100 pl-3 pr-2 pt-2 pb-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-5 rounded mt-1" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-7 w-40 shrink-0" />
              </div>
            </div>
          ) : evaluatingSystem ? (
            /* Show AI System Info */
            <>
              <div className="space-y-3 rounded-lg bg-gray-100 pl-3 pr-2 pt-2 pb-3">
                <div className="flex  gap-2">
                  <div className="pt-1">
                    <AISystemIcon
                      type={evaluatingSystem.icon}
                      className="h-5 w-5"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[0.8125rem]  font-450 text-gray-900">
                      {evaluatingSystem.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-600 mt-0.5">
                        {evaluatingSystem.providerName} • {evaluatingSystem.selectedModel}
                      </p>
                    </div>
                  </div>

                  {/* Attach Guardrails Button */}
                  <Popover
                    open={isAddingGuardrail}
                    onOpenChange={setIsAddingGuardrail}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 shrink-0 text-gray-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Attach Guardrails
                        {selectedGuardrails.length > 0 && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {selectedGuardrails.length}
                          </Badge>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[600px] p-0"
                      align="end"
                      side="bottom"
                      sideOffset={32}
                    >
                      <div className="">
                        {/* Search inside list */}
                        <div className="py-2 px-1 border-b border-gray-200">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              id="guardrail-search"
                              placeholder="Search by name, description, or category..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="bg-transparent border-none focus:border-none focus-visible:ring-0 pl-9"
                            />
                          </div>
                        </div>

                        {/* Guardrails */}
                        <div className="max-h-80 overflow-y-auto">
                          {filteredGuardrails.length === 0 ? (
                            <div className="p-8 text-center">
                              <p className="text-[0.8125rem]  text-gray-500">
                                {searchQuery
                                  ? "No guardrails found matching your search."
                                  : "No guardrails available."}
                              </p>
                              {!searchQuery && (
                                <p className="text-xs text-gray-400 mt-2">
                                  Create guardrails in the Guardrails page to use them for protection.
                                </p>
                              )}
                            </div>
                          ) : (
                            filteredGuardrails.map((guardrail) => {
                              const isSelected = selectedGuardrails.some(g => g.id === guardrail.id);

                              return (
                                <div
                                  key={guardrail.id}
                                  className="relative flex items-start gap-3 m-1 rounded-md p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                                  onMouseEnter={() => setHoveredGuardrailId(guardrail.id)}
                                  onMouseLeave={() => setHoveredGuardrailId(null)}
                                >
                                  <Checkbox
                                    id={`guardrail-${guardrail.id}`}
                                    checked={isSelected}
                                    onCheckedChange={() => handleToggleGuardrail(guardrail.id)}
                                    className="mt-0.5"
                                  />
                                  <label
                                    htmlFor={`guardrail-${guardrail.id}`}
                                    className="flex-1 cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-[0.8125rem]  font-450 text-gray-900">
                                        {guardrail.name}
                                      </span>
                                      {guardrail.category && (
                                        <Badge variant="secondary" className="text-xs">
                                          {guardrail.category}
                                        </Badge>
                                      )}
                                    </div>
                                  </label>

                                  {/* Preview Button - Shows on hover */}
                                  {hoveredGuardrailId === guardrail.id && (
                                    <Button
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedGuardrailForView(guardrail.id);
                                        setViewGuardrailSheetOpen(true);
                                      }}
                                      variant="ghost"
                                      size="sm"
                                      className="absolute top-3 right-3 inline-flex items-center gap-1 pr-1.5"
                                    >
                                      Preview Policy
                                      <ChevronRight className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Footer */}
                        {selectedGuardrails.length > 0 && (
                          <div className="p-3 border-t bg-gray-50">
                            <div className="flex items-center justify-between text-[0.8125rem]  text-gray-600">
                              <span>
                                {selectedGuardrails.length} Guardrail
                                {selectedGuardrails.length !== 1 ? "s" : ""} selected
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAddingGuardrail(false)}
                                className="h-7 px-2"
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Selected Guardrails - Outside the card */}
              {selectedGuardrails.length > 0 && (
                <div className="space-y-2">
                  {selectedGuardrails.map((guardrail) => (
                    <div
                      key={guardrail.id}
                      className="relative flex items-center gap-3 p-2 px-3 bg-gray-100 rounded-md"
                      onMouseEnter={() => setHoveredSelectedGuardrailId(guardrail.id)}
                      onMouseLeave={() => setHoveredSelectedGuardrailId(null)}
                    >
                      <PolicyIcon className="h-4 w-4 text-gray-500" />
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-[0.8125rem]  font-400">{guardrail.name}</span>
                        {guardrail.category && (
                          <Badge variant="outline" className="text-xs">
                            {guardrail.category}
                          </Badge>
                        )}
                      </div>

                      {/* Preview Button - Shows on hover */}
                      {hoveredSelectedGuardrailId === guardrail.id && (
                        <Button
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedGuardrailForView(guardrail.id);
                            setViewGuardrailSheetOpen(true);
                          }}
                          variant="ghost"
                          size="sm"
                          className="absolute right-10 inline-flex items-center gap-1 pr-1.5 h-6 text-gray-600"
                        >
                          Preview Policy
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      )}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGuardrail(guardrail.id)}
                        className="h-6 w-6 p-0 hover:bg-gray-200 hover:text-gray-600 shrink-0"
                      >
                        <X className="h-3 w-3 text-gray-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}

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

      {/* View Guardrail Sheet */}
      <GuardrailViewSheet
        open={viewGuardrailSheetOpen}
        onOpenChange={setViewGuardrailSheetOpen}
        guardrail={availableGuardrails.find(g => g.id === selectedGuardrailForView) || null}
      />
    </div>
  );
}
