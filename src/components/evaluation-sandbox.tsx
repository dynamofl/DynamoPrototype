import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, History } from "lucide-react";

// Modularized components
import {
  ConfigurationPanel,
  InputDataSection,
  ResultsSection,
  LoadingState,
} from "@/components/evaluation";

// Utilities
import {
  getPaginationHelpers,
  validatePageBounds,
  handleTableDataChange,
  handleCellAction as handleCellActionUtil
} from "@/utils/evaluation";
import { processCSVImport } from "@/utils/evaluation";

// Constants
import { EVALUATION_CONSTANTS, INITIAL_PROMPTS } from "@/constants/evaluation";

// Types and services
import { APIKeyStorage } from "@/lib/secure-storage";
import { runEvaluation, getAvailableModels } from "@/lib/evalRunner";
import type {
  EvaluationInput,
  EvaluationConfig,
  EvaluationResult,
} from "@/types/evaluation";
import type { Guardrail } from "@/types";
import { useGuardrails } from "@/lib/useGuardrails";

// Define MetricToggles locally to avoid import issues
interface MetricToggles {
  accuracy: boolean;
  precision: boolean;
  recall: boolean;
}

interface AIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission: any[];
  root: string;
  parent: string | null;
  logging: any;
}

interface AIProvider {
  id: string;
  name: string;
  type: "OpenAI";
  apiKey: string;
  status: "active" | "inactive" | "testing";
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  models?: AIModel[];
  modelsLastFetched?: string;
  isExpanded?: boolean;
}

export function EvaluationSandbox() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [config, setConfig] = useState<EvaluationConfig>({
    candidateModel: "",
    judgeModel: EVALUATION_CONSTANTS.JUDGE_MODEL,
    temperature: EVALUATION_CONSTANTS.DEFAULT_TEMPERATURE,
    maxLength: EVALUATION_CONSTANTS.DEFAULT_MAX_LENGTH,
    topP: EVALUATION_CONSTANTS.DEFAULT_TOP_P,
  });

  const [evaluationInput, setEvaluationInput] = useState<EvaluationInput>({
    prompts: INITIAL_PROMPTS,
  });

  const [metricsEnabled, setMetricsEnabled] = useState<MetricToggles>({
    accuracy: true,
    precision: true,
    recall: true,
  });

  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guardrail state
  const [selectedGuardrails, setSelectedGuardrails] = useState<Guardrail[]>([]);
  const [isAddingGuardrail, setIsAddingGuardrail] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Use shared guardrails hook
  const { guardrails: availableGuardrails } = useGuardrails();

  // Load providers from secure storage on component mount
  useEffect(() => {
    const storedProviders = APIKeyStorage.loadProviders();
    setProviders(storedProviders);
  }, []);

  // Set default models when available models change
  useEffect(() => {
    const availableModels = getAvailableModels();
    if (availableModels.length > 0 && availableModels[0].id !== "no-models") {
      // Set default models if not already set
      if (!config.candidateModel) {
        const candidateModel =
          availableModels.find(
            (m) => m.id.includes("gpt-4o-mini") || m.id.includes("gpt-3.5")
          )?.id || availableModels[0].id;
        setConfig((prev) => ({ ...prev, candidateModel }));
      }
    }
  }, [providers, config.candidateModel]);

  // Get available models for selection
  const availableModels = getAvailableModels();


  // Helper functions to manage prompts
  const addPrompt = () => {
    setEvaluationInput((prev) => ({
      ...prev,
      prompts: [
        ...prev.prompts,
        {
          id: crypto.randomUUID(),
          prompt: "",
          topic: "",
          userMarkedAdversarial: "",
        },
      ],
    }));
  };

  const removePrompt = (id: string) => {
    if (evaluationInput.prompts.length > 1) {
      setEvaluationInput((prev) => ({
        ...prev,
        prompts: prev.prompts.filter((p) => p.id !== id),
      }));
    }
  };

  // Bulk import function for CSV data
  const handleCSVImport = (
    rows: any[],
    importType: "valid" | "invalid" | "all"
  ) => {
    setEvaluationInput((prev) => {
      const { updatedPrompts, result } = processCSVImport(rows, prev.prompts, importType);
      console.log(result.message); // You can replace this with a toast notification
      return {
        ...prev,
        prompts: updatedPrompts,
      };
    });
  };

  // Handle table data changes with pagination
  const handleTableDataChangeFn = (newPageData: any[]) => {
    const { startIndex } = getPaginationHelpers(evaluationInput.prompts, {
      currentPage,
      itemsPerPage: EVALUATION_CONSTANTS.ITEMS_PER_PAGE,
    });

    setEvaluationInput((prev) => {
      const updatedPrompts = handleTableDataChange(
        newPageData,
        prev.prompts,
        startIndex
      );
      return {
      ...prev,
        prompts: updatedPrompts,
      };
    });
  };

  // Handle cell actions (like button clicks) with pagination
  const handleCellAction = (
    action: string,
    rowIndex: number,
    columnKey: string
  ) => {
    const { startIndex } = getPaginationHelpers(evaluationInput.prompts, {
      currentPage,
      itemsPerPage: EVALUATION_CONSTANTS.ITEMS_PER_PAGE,
    });

    handleCellActionUtil(
      action,
      rowIndex,
      columnKey,
      startIndex,
      evaluationInput.prompts,
      removePrompt
    );
  };

  const handleSubmit = async () => {
    // Check if at least one prompt is complete (has both prompt text and adversarial status)
    const completePrompts = evaluationInput.prompts.filter(
      (p) =>
        p.prompt.trim() &&
        p.userMarkedAdversarial &&
        p.userMarkedAdversarial !== ""
    );
    
    if (completePrompts.length === 0) {
      setError(
        "Please provide at least one complete prompt with adversarial status selected"
      );
      return;
    }

    // Check if models are available
    const availableModels = getAvailableModels();
    if (availableModels.length === 1 && availableModels[0].id === "no-models") {
      setError(
        "No AI models available. Please add AI providers and fetch their models first."
      );
      return;
    }

    // Check if selected models exist
    // Judge model is hardcoded to gpt-4o-mini, so we only validate the candidate model
    const candidateModelExists = availableModels.some(
      (m) => m.id === config.candidateModel
    );

    if (!candidateModelExists) {
      setError(
        "Selected candidate model not found. Please ensure you have added AI providers and fetched their models."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create enhanced config with guardrails
      const enhancedConfig = {
        ...config,
        guardrails: selectedGuardrails,
      };

      // Filter to only include complete prompts for evaluation
      const filteredEvaluationInput = {
        ...evaluationInput,
        prompts: completePrompts,
      };

      const evaluationResult = await runEvaluation(
        filteredEvaluationInput,
        enhancedConfig,
        metricsEnabled
      );
      setResult(evaluationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Guardrail management functions
  const addGuardrail = (Guardrail: Guardrail) => {
    if (!selectedGuardrails.find((g) => g.id === Guardrail.id)) {
      setSelectedGuardrails([...selectedGuardrails, Guardrail]);
    }
    // Don't close the popover - let user select multiple guardrails
    // setIsAddingGuardrail(false)
  };

  const removeGuardrail = (guardrailId: string) => {
    setSelectedGuardrails(
      selectedGuardrails.filter((g) => g.id !== guardrailId)
    );
  };


  // Pagination helpers using utility functions
  const paginationHelpers = getPaginationHelpers(evaluationInput.prompts, {
    currentPage,
    itemsPerPage: EVALUATION_CONSTANTS.ITEMS_PER_PAGE,
  });

  const goToPage = (page: number) => {
    setCurrentPage(validatePageBounds(page, paginationHelpers.totalPages));
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < paginationHelpers.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when prompts change significantly
  useEffect(() => {
    if (currentPage > paginationHelpers.totalPages && paginationHelpers.totalPages > 0) {
      setCurrentPage(1);
    }
  }, [evaluationInput.prompts.length, currentPage, paginationHelpers.totalPages]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="mx-auto flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between  px-6 py-4">
          <div>
            <h1 className="text-[16px] font-450 ">Evaluation Sandbox</h1>
            <p className="text-[13px] font-400 text-gray-600">
              Test and evaluate AI models with different configurations
            </p>
          </div>
          <div className="flex items-center gap-2">
          <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={
                    isLoading ||
                !evaluationInput.prompts.some(
                  (p) =>
                    p.prompt.trim() &&
                    p.userMarkedAdversarial &&
                    p.userMarkedAdversarial !== ""
                ) ||
                    (availableModels.length === 1 &&
                      availableModels[0].id === "no-models")
                  }
                >
                  <Play className="mr-2 h-4 w-4" />
                  {isLoading ? "Evaluating..." : "Run Evaluation"}
                </Button>
                <Button variant="outline" className="w-full">
                  <History className="mr-2 h-4 w-4" />
                  Show History
                </Button>
            {/* <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="mr-2 h-4 w-4" />
              Share
            </Button> */}
          </div>
        </div>

        <div className="bg-background grid grid-cols-1 lg:grid-cols-3 rounded-t-xl flex-1 border border-gray-200">
          {/* Configuration Panel */}
          <ConfigurationPanel
            config={config}
            onConfigChange={setConfig}
            availableModels={availableModels}
            selectedGuardrails={selectedGuardrails}
            onAddGuardrail={addGuardrail}
            onRemoveGuardrail={removeGuardrail}
            availableGuardrails={availableGuardrails}
            isAddingGuardrail={isAddingGuardrail}
            onIsAddingGuardrailChange={setIsAddingGuardrail}
            metricsEnabled={metricsEnabled}
            onMetricsChange={setMetricsEnabled}
          />

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {result ? (
              <ResultsSection
                result={result}
                prompts={evaluationInput.prompts}
                currentPagePrompts={paginationHelpers.currentPagePrompts}
                totalPages={paginationHelpers.totalPages}
                currentPage={currentPage}
                startIndex={paginationHelpers.startIndex}
                onAddPrompt={addPrompt}
                onTableDataChange={handleTableDataChangeFn}
                        onCellAction={handleCellAction}
                onGoToPage={goToPage}
                onGoToPrevious={goToPrevious}
                onGoToNext={goToNext}
              />
            ) : isLoading ? (
              <LoadingState />
            ) : (
              <InputDataSection
                prompts={evaluationInput.prompts}
                currentPagePrompts={paginationHelpers.currentPagePrompts}
                totalPages={paginationHelpers.totalPages}
                currentPage={currentPage}
                startIndex={paginationHelpers.startIndex}
                onAddPrompt={addPrompt}
                onCSVImport={handleCSVImport}
                onTableDataChange={handleTableDataChangeFn}
                        onCellAction={handleCellAction}
                onGoToPage={goToPage}
                onGoToPrevious={goToPrevious}
                onGoToNext={goToNext}
                error={error}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
