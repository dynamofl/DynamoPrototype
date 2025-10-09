import { useState, useMemo } from "react";
import { Search, Plus, ChevronRight, PencilLineIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useGuardrailsSupabase } from "@/features/guardrails/lib/useGuardrailsSupabase";
import { GuardrailViewSheet } from "@/features/guardrails/components";
import { UploadPromptsSheet } from "./upload-prompts-sheet";
import type { EvaluationCreationStepProps, PolicyDataset } from "../types/evaluation-creation";

export function EvaluationCreationStep2({
  data,
  onDataChange,
  onNext,
  onBack,
  variant = "overlay",
}: EvaluationCreationStepProps) {
  const { guardrails: allPolicies } = useGuardrailsSupabase();
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>(
    data.policyIds || []
  );
  const [policyDatasets, setPolicyDatasets] = useState<PolicyDataset[]>(
    data.policyDatasets || []
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [currentPolicyId, setCurrentPolicyId] = useState<string | null>(null);
  const [hoveredPolicyId, setHoveredPolicyId] = useState<string | null>(null);
  const [viewPolicySheetOpen, setViewPolicySheetOpen] = useState(false);
  const [selectedPolicyForView, setSelectedPolicyForView] = useState<string | null>(null);

  // Filter policies based on search query
  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return allPolicies;

    const query = searchQuery.toLowerCase();
    return allPolicies.filter(
      (policy) =>
        policy.name.toLowerCase().includes(query) ||
        policy.description.toLowerCase().includes(query) ||
        policy.category?.toLowerCase().includes(query)
    );
  }, [allPolicies, searchQuery]);

  const handleTogglePolicy = (policyId: string) => {
    setSelectedPolicyIds((prev) => {
      if (prev.includes(policyId)) {
        // Remove policy
        setPolicyDatasets((datasets) =>
          datasets.filter((d) => d.policyId !== policyId)
        );
        return prev.filter((id) => id !== policyId);
      } else {
        // Add policy with default estimated prompts
        setPolicyDatasets((datasets) => [
          ...datasets,
          { policyId, estimatedPrompts: 100 },
        ]);
        return [...prev, policyId];
      }
    });
  };

  const handleAddMorePrompts = (policyId: string) => {
    setCurrentPolicyId(policyId);
    setUploadSheetOpen(true);
  };

  const handleUploadPrompts = (
    prompts: Array<{ prompt: string }>,
    fileName: string,
    csvData?: { headers: string[]; rows: string[][] },
    mappedColumns?: { adversarialPrompt: string; attackArea: string },
    validationResult?: { validCount: number; invalidCount: number; totalCount: number }
  ) => {
    if (!currentPolicyId) return;

    setPolicyDatasets((prev) =>
      prev.map((dataset) =>
        dataset.policyId === currentPolicyId
          ? {
              ...dataset,
              additionalPrompts: prompts.length > 0 ? prompts : undefined,
              uploadedFileName: fileName || undefined,
              csvData: csvData || undefined,
              mappedColumns: mappedColumns || undefined,
              validationResult: validationResult || undefined,
            }
          : dataset
      )
    );
  };

  const handleContinue = () => {
    onDataChange({ policyIds: selectedPolicyIds, policyDatasets });
    onNext?.();
  };

  const handleSkip = () => {
    onDataChange({ policyIds: [], policyDatasets: [] });
    onNext?.();
  };

  const currentPolicy = allPolicies.find((p) => p.id === currentPolicyId);
  const currentDataset = policyDatasets.find((d) => d.policyId === currentPolicyId);
  const viewGuardrail = allPolicies.find((p) => p.id === selectedPolicyForView);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-450 text-gray-900">
          Generate Test Dataset from Policies
        </h2>
        <p className="text-[0.8125rem]  text-gray-600">
          Choose policies to generate test datasets. Each policy will generate an
          estimated number of prompts for the benchmark.
        </p>
      </div>

      {/* Policies List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-600">
            Available Policies ({filteredPolicies.length})
          </Label>
          {selectedPolicyIds.length > 0 && (
            <span className="text-xs text-gray-500">
              {selectedPolicyIds.length} selected
            </span>
          )}
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Search inside list */}
          <div className="py-2 px-1 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="policy-search"
                placeholder="Search by policy name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:border-none focus-visible:ring-0 pl-9"
              />
            </div>
          </div>

          {/* Policies */}
          <div className="max-h-96 overflow-y-auto">
            {filteredPolicies.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-[0.8125rem]  text-gray-500">
                  {searchQuery
                    ? "No policies found matching your search."
                    : "No policies available."}
                </p>
                {!searchQuery && (
                  <p className="text-xs text-gray-400 mt-2">
                    Create policies in the Guardrails page to use them for dataset
                    generation.
                  </p>
                )}
              </div>
            ) : (
              filteredPolicies.map((policy) => {
                const isSelected = selectedPolicyIds.includes(policy.id);
                const isActive = policy.status === "active";
                const dataset = policyDatasets.find((d) => d.policyId === policy.id);

                return (
                  <div
                    key={policy.id}
                    className={`relative flex items-start gap-3 m-1 rounded-md p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
                      !isActive ? "opacity-60" : ""
                    }`}
                    onMouseEnter={() => setHoveredPolicyId(policy.id)}
                    onMouseLeave={() => setHoveredPolicyId(null)}
                  >
                    <Checkbox
                      id={`policy-${policy.id}`}
                      checked={isSelected}
                      onCheckedChange={() => handleTogglePolicy(policy.id)}
                      disabled={!isActive}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={`policy-${policy.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[0.8125rem]  font-450 text-gray-900">
                          {policy.name}
                        </span>
                        {policy.category && (
                          <Badge variant="secondary" className="text-xs">
                            {policy.category}
                          </Badge>
                        )}
                        {!isActive && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>

                      {/* Dataset Info - Only show when selected */}
                      {isSelected && dataset && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs text-gray-500">
                            Estimated prompts: {dataset.estimatedPrompts}
                          </span>
                          {dataset.additionalPrompts && (
                            <span className="text-xs text-gray-500">
                              + Uploaded Prompts: {dataset.additionalPrompts.length}
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddMorePrompts(policy.id);
                            }}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                          >
                           
                            {dataset.additionalPrompts ? 
                            <div className="flex items-center gap-1">
                               <PencilLineIcon className="h-3 w-3" />
                               Manage
                            </div>
                             : 
                             <div className="flex items-center gap-1">
                               <Plus className="h-3 w-3" />
                               Add More Prompts
                            </div>}
                          </button>
                        </div>
                      )}
                    </label>

                    {/* Preview Button - Shows on hover */}
                    {hoveredPolicyId === policy.id && (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedPolicyForView(policy.id);
                          setViewPolicySheetOpen(true);
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

          <Button onClick={handleContinue} disabled={selectedPolicyIds.length === 0}>Continue</Button>
        </div>
      </div>

      {/* Upload Sheet */}
      <UploadPromptsSheet
        open={uploadSheetOpen}
        onOpenChange={setUploadSheetOpen}
        policyName={currentPolicy?.name || ""}
        onUpload={handleUploadPrompts}
        existingPrompts={currentDataset?.additionalPrompts}
        existingFileName={currentDataset?.uploadedFileName}
        existingCsvData={currentDataset?.csvData}
        existingMappedColumns={currentDataset?.mappedColumns}
        existingValidationResult={currentDataset?.validationResult}
      />

      {/* View Guardrail Sheet */}
      <GuardrailViewSheet
        open={viewPolicySheetOpen}
        onOpenChange={setViewPolicySheetOpen}
        guardrail={viewGuardrail || null}
      />
    </div>
  );
}
