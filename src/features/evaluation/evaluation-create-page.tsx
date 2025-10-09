import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Modularized components
import {
  ConfigurationPanel,
  InputDataSection,
  LoadingState,
  EvaluationHeader,
} from "./components";

// Utilities
import {
  getPaginationHelpers,
  validatePageBounds
} from "@/features/evaluation/lib/pagination";
import {
  handleTableDataChange,
  handleCellAction as handleCellActionUtil
} from "@/features/evaluation/lib/table";
import { processCSVImport } from "@/features/evaluation/lib/csv-import";

// Constants
import { EVALUATION_CONSTANTS, INITIAL_PROMPTS } from "@/features/evaluation/constants/evaluation";

// Types and services
import { APIKeyStorage } from "@/lib/storage/secure-storage";
import { runEvaluation, getAvailableModels } from "@/features/evaluation/lib/evalRunner";
import type {
  EvaluationInput,
  EvaluationConfig,
  EvaluationResult,
} from "@/features/evaluation/types/evaluation";
import type { Guardrail } from "@/types";
import { useGuardrails } from "@/features/guardrails/lib/useGuardrails";
import { EvaluationTestStorage } from "@/features/evaluation/lib/evaluation-test-storage";
import type { EvaluationTest } from "@/features/evaluation/types/evaluation-test";

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

export function EvaluationCreatePage() {
  const navigate = useNavigate();

  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [config, setConfig] = useState<EvaluationConfig>({
    candidateModel: "",
    judgeModel: "",
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

    // Set default models when providers are loaded
    const availableModels = getAvailableModels();
    if (availableModels.length > 0 && availableModels[0].id !== "no-models") {
      // Set both models in a single update
      setConfig((prev) => {
        const newConfig = { ...prev };

        if (!prev.judgeModel) {
          newConfig.judgeModel = availableModels.find(
            (m) => m.id.includes("gpt-4o-mini") || m.id.includes("gpt-4")
          )?.id || availableModels[0].id;
        }

        if (!prev.candidateModel) {
          newConfig.candidateModel = availableModels.find(
            (m) => m.id.includes("gpt-3.5") || m.id.includes("gpt-4o-mini")
          )?.id || availableModels[0].id;
        }

        return newConfig;
      });
    }
  }, []); // Only run once on mount

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
    const judgeModelExists = availableModels.some(
      (m) => m.id === config.judgeModel
    );
    const candidateModelExists = availableModels.some(
      (m) => m.id === config.candidateModel
    );

    if (!judgeModelExists || !candidateModelExists) {
      const missingModels = [];
      if (!judgeModelExists) missingModels.push(`Judge model "${config.judgeModel}"`);
      if (!candidateModelExists) missingModels.push(`Candidate model "${config.candidateModel}"`);

      setError(
        `${missingModels.join(" and ")} not found. Please ensure you have added AI providers and fetched their models.`
      );
      return;
    }

    setIsLoading(true);
    setError(null);

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

    // Create new test record
    const newTest: EvaluationTest = {
      id: crypto.randomUUID(),
      name: `Evaluation ${new Date().toLocaleString()}`,
      status: 'running',
      config: enhancedConfig,
      input: filteredEvaluationInput,
      progress: {
        current: 0,
        total: completePrompts.length,
      },
      createdAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    };

    // Save test to storage
    const savedTest = EvaluationTestStorage.addTest(newTest);

    // Navigate to list view when evaluation starts
    navigate('/evaluation-sandbox/list');

    try {
      const evaluationResult = await runEvaluation(
        filteredEvaluationInput,
        enhancedConfig,
        metricsEnabled
      );

      // Update test with result
      EvaluationTestStorage.updateTestStatus(savedTest.id, 'completed', {
        result: evaluationResult,
        completedAt: new Date().toISOString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Evaluation failed";

      // Update test as failed
      EvaluationTestStorage.updateTestStatus(savedTest.id, 'failed', {
        error: errorMessage,
      });
    }
  };

  // Guardrail management functions
  const addGuardrail = (Guardrail: Guardrail) => {
    if (!selectedGuardrails.find((g) => g.id === Guardrail.id)) {
      setSelectedGuardrails([...selectedGuardrails, Guardrail]);
    }
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

  const isEvaluationDisabled =
    isLoading ||
    !evaluationInput.prompts.some(
      (p) =>
        p.prompt.trim() &&
        p.userMarkedAdversarial &&
        p.userMarkedAdversarial !== ""
    ) ||
    (availableModels.length === 1 &&
      availableModels[0].id === "no-models");

  const handleShowHistory = () => {
    navigate('/evaluation-sandbox/list');
  };

  const handleNewEvaluation = () => {
    // Reset to initial state for new evaluation
    setEvaluationInput({
      prompts: INITIAL_PROMPTS,
    });
    setError(null);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="mx-auto flex-1 flex flex-col">
        {/* Header */}
        <EvaluationHeader
          onRunEvaluation={handleSubmit}
          onShowHistory={handleShowHistory}
          onNewEvaluation={handleNewEvaluation}
          isLoading={isLoading}
          isDisabled={isEvaluationDisabled}
          showHistory={false}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 border-t border-gray-200">
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
            {isLoading ? (
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