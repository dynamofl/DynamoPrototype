import { useState, useMemo } from "react";
import { Search, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useGuardrails } from "@/features/guardrails/lib/useGuardrails";
import { GuardrailViewSheet } from "@/features/guardrails/components";
import type { EvaluationCreationStepProps } from "../types/evaluation-creation";

export function EvaluationCreationStep3({
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
  const [hoveredGuardrailId, setHoveredGuardrailId] = useState<string | null>(null);
  const [viewGuardrailSheetOpen, setViewGuardrailSheetOpen] = useState(false);
  const [selectedGuardrailForView, setSelectedGuardrailForView] = useState<string | null>(null);

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

  const viewGuardrail = allGuardrails.find((g) => g.id === selectedGuardrailForView);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-450 text-gray-900">
          Add Guardrails for Moderation (Optional)
        </h2>
        <p className="text-[0.8125rem]  text-gray-600">
          Optionally add guardrails to protect your AI system by adding a safety layer
          during evaluation.
        </p>
      </div>

      {/* Info Banner */}
      {/* <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-450 text-blue-900">
            Protection Layer (Optional)
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Guardrails act as a protective layer for your AI system, helping to block
            unsafe or non-compliant responses during evaluation.
          </p>
        </div>
      </div> */}

      {/* Guardrails List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-600">
            Available Guardrails ({filteredGuardrails.length})
          </Label>
          {selectedGuardrailIds.length > 0 && (
            <span className="text-xs text-gray-500">
              {selectedGuardrailIds.length} selected
            </span>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
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
          <div className="max-h-96 overflow-y-auto">
            {filteredGuardrails.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[0.8125rem]  text-gray-500">
                  {searchQuery
                    ? "No guardrails found matching your search."
                    : "No guardrails available."}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-gray-400 mt-2">
                    Create guardrails in the Guardrails page to use them for
                    protection.
                  </p>
                )}
              </div>
            ) : (
              filteredGuardrails.map((guardrail) => {
                const isSelected = selectedGuardrailIds.includes(guardrail.id);
                const isActive = guardrail.status === "active";

                return (
                  <div
                    key={guardrail.id}
                    className={`relative flex items-start gap-3 m-1 rounded-md p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                      !isActive ? "opacity-60" : ""
                    }`}
                    onMouseEnter={() => setHoveredGuardrailId(guardrail.id)}
                    onMouseLeave={() => setHoveredGuardrailId(null)}
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
                        <span className="text-[0.8125rem]  font-450 text-gray-900">
                          {guardrail.name}
                        </span>
                        {guardrail.category && (
                          <Badge variant="secondary" className="text-xs">
                            {guardrail.category}
                          </Badge>
                        )}
                        {!isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      {/* <p className="text-xs text-gray-600 mt-1">
                        {guardrail.description}
                      </p> */}
                    </label>

                    {/* Preview Button - Shows on hover */}
                    {hoveredGuardrailId === guardrail.id && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedGuardrailForView(guardrail.id);
                          setViewGuardrailSheetOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="absolute top-3 right-3 inline-flex items-center gap-1 pr-1.5 "
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
        </div>
      </div>

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

      {/* View Guardrail Sheet */}
      <GuardrailViewSheet
        open={viewGuardrailSheetOpen}
        onOpenChange={setViewGuardrailSheetOpen}
        guardrail={viewGuardrail || null}
      />
    </div>
  );
}
