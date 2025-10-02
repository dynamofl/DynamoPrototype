import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useGuardrails } from "@/features/guardrails/lib/useGuardrails";
import type { EvaluationCreationStepProps } from "../types/evaluation-creation";

export function EvaluationCreationStep2({
  data,
  onDataChange,
  onNext,
  onBack,
  variant = "overlay",
}: EvaluationCreationStepProps) {
  const { guardrails: allGuardrails } = useGuardrails();
  const [selectedGuardrailIds, setSelectedGuardrailIds] = useState<string[]>(
    data.guardrailIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter guardrails based on search query
  const filteredGuardrails = useMemo(() => {
    if (!searchQuery.trim()) return allGuardrails;

    const query = searchQuery.toLowerCase();
    return allGuardrails.filter(
      (guardrail) =>
        guardrail.name.toLowerCase().includes(query) ||
        guardrail.description.toLowerCase().includes(query) ||
        guardrail.category?.toLowerCase().includes(query)
    );
  }, [allGuardrails, searchQuery]);

  const handleToggleGuardrail = (guardrailId: string) => {
    setSelectedGuardrailIds((prev) => {
      if (prev.includes(guardrailId)) {
        return prev.filter((id) => id !== guardrailId);
      } else {
        return [...prev, guardrailId];
      }
    });
  };

  const handleContinue = () => {
    onDataChange({ guardrailIds: selectedGuardrailIds });
    onNext?.();
  };

  const handleSkip = () => {
    onDataChange({ guardrailIds: [] });
    onNext?.();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-450 text-gray-900">
          Select Policies for Dataset Generation
        </h2>
        <p className="text-[13px] text-gray-600">
          Choose which policy conditions will be used to generate test prompts for the benchmark dataset.
        </p>
      </div>

      {/* Policies List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-600">
            Available Policies ({filteredGuardrails.length})
          </Label>
          {selectedGuardrailIds.length > 0 && (
            <span className="text-xs text-gray-500">
              {selectedGuardrailIds.length} selected
            </span>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Search inside list */}
          <div className="py-2 px-1 border-b border-gray-200 ">
            <div className="relative">
              <Search className=" absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="guardrail-search"
                placeholder="Search by policy name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:border-none focus-visible:ring-0 pl-9"
              />
            </div>
          </div>

          {/* Policies */}
          <div className="max-h-96 overflow-y-auto">
          {filteredGuardrails.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[13px] text-gray-500">
                {searchQuery ? "No policies found matching your search." : "No policies available."}
              </p>
              {!searchQuery && (
                <p className="text-xs text-gray-400 mt-2">
                  Create policies in the Guardrails page to use them for dataset generation.
                </p>
              )}
            </div>
          ) : (
            filteredGuardrails.map((guardrail) => {
              const isSelected = selectedGuardrailIds.includes(guardrail.id);
              const isActive = guardrail.status === 'active';

              return (
                <div
                  key={guardrail.id}
                  className={`flex items-start gap-3 m-1 rounded-md p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-100 transition-colors ${
                    !isActive ? "opacity-60" : ""
                  }`}
                >
                  <Checkbox
                    id={`guardrail-${guardrail.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleToggleGuardrail(guardrail.id)}
                    disabled={!isActive}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={`guardrail-${guardrail.id}`}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-gray-900">
                        {guardrail.name}
                      </span>
                      {guardrail.category && (
                        
                           <Badge variant="secondary">
 {guardrail.category}                </Badge>
                        
                      )}
                      {!isActive && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </div>
                   
                  </label>
                </div>
              );
            })
          )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
