import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAISystemsSupabase } from "@/features/ai-systems/lib/useAISystemsSupabase";
import { AISystemIcon } from "@/components/patterns/ui-patterns/ai-system-icon";
import type { EvaluationCreationStepProps } from "../../types/evaluation-creation.ts";

export function AISystemSelection({
  data,
  onDataChange,
  onNext,
  onBack,
  variant = "overlay",
}: EvaluationCreationStepProps) {
  const { aiSystems } = useAISystemsSupabase();
  const [selectedSystemIds, setSelectedSystemIds] = useState<string[]>(
    data.aiSystemIds || []
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter AI systems based on search query
  const filteredSystems = useMemo(() => {
    if (!searchQuery.trim()) return aiSystems;

    const query = searchQuery.toLowerCase();
    return aiSystems.filter(
      (system) =>
        system.name.toLowerCase().includes(query) ||
        system.providerName.toLowerCase().includes(query) ||
        system.selectedModel.toLowerCase().includes(query)
    );
  }, [aiSystems, searchQuery]);

  const handleToggleSystem = (systemId: string) => {
    setSelectedSystemIds((prev) => {
      if (prev.includes(systemId)) {
        return prev.filter((id) => id !== systemId);
      } else {
        return [...prev, systemId];
      }
    });
  };

  const handleContinue = () => {
    onDataChange({ aiSystemIds: selectedSystemIds });
    onNext?.();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-450 text-gray-900">
          Select AI Systems to Test
        </h2>
        <p className="text-[0.8125rem]  text-gray-600">
          Choose the AI systems you want to evaluate for jailbreak vulnerabilities.
        </p>
      </div>

      {/* AI Systems List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-600">
            Available AI Systems ({filteredSystems.length})
          </Label>
          {selectedSystemIds.length > 0 && (
            <span className="text-xs text-gray-500">
              {selectedSystemIds.length} selected
            </span>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Search inside list */}
          <div className="py-2 px-1 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="system-search"
                placeholder="Search by system name, provider, or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:border-none focus-visible:ring-0 pl-9"
              />
            </div>
          </div>

          {/* Systems */}
          <div className="max-h-96 overflow-y-auto">
            {filteredSystems.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[0.8125rem]  text-gray-500">
                  {searchQuery
                    ? "No AI systems found matching your search."
                    : "No AI systems available."}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-gray-400 mt-2">
                    Create AI systems in the AI Systems page to use them for
                    evaluation.
                  </p>
                )}
              </div>
            ) : (
              filteredSystems.map((system) => {
                const isSelected = selectedSystemIds.includes(system.id);

                return (
                  <div
                    key={system.id}
                    className="flex items-start gap-3 m-1 rounded-md p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <Checkbox
                      id={`system-${system.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSystem(system.id)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`system-${system.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <AISystemIcon
                          type={system.icon}
                          className="h-4 w-4"
                        />
                        <span className="text-[0.8125rem]  font-450 text-gray-900">
                          {system.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {system.providerName}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {system.selectedModel}
                      </p>
                    </label>
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
        <Button onClick={handleContinue} disabled={selectedSystemIds.length === 0}>
          Continue
        </Button>
      </div>
    </div>
  );
}
