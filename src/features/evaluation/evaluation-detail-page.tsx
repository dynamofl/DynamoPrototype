import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// Modularized components
import {
  ConfigurationPanel,
  InputDataSection,
  ResultsSection,
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

// Constants
import { EVALUATION_CONSTANTS } from "@/features/evaluation/constants/evaluation";

// Types and services
import { APIKeyStorage } from "@/lib/storage/secure-storage";
import { getAvailableModels } from "@/features/evaluation/lib/evalRunner";
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

interface AIProvider {
  id: string;
  name: string;
  type: "OpenAI";
  apiKey: string;
  status: "active" | "inactive" | "testing";
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  models?: any[];
  modelsLastFetched?: string;
  isExpanded?: boolean;
}

export function EvaluationDetailPage() {
  const { testId } = useParams<{ testId: string }>();
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
    prompts: [],
  });

  const [metricsEnabled, setMetricsEnabled] = useState<MetricToggles>({
    accuracy: true,
    precision: true,
    recall: true,
  });

  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guardrail state
  const [selectedGuardrails, setSelectedGuardrails] = useState<Guardrail[]>([]);
  const [isAddingGuardrail, setIsAddingGuardrail] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Use shared guardrails hook
  const { guardrails: availableGuardrails } = useGuardrails();

  // Load test data on mount - only once
  useEffect(() => {
    // Load providers
    const storedProviders = APIKeyStorage.loadProviders();
    setProviders(storedProviders);

    // Load specific test if testId is provided
    if (testId) {
      const test = EvaluationTestStorage.getTest(testId);
      if (test) {
        // Load all test data at once
        setEvaluationInput(test.input);
        setConfig(test.config);
        if (test.result) {
          setResult(test.result);
        }
        if (test.config.guardrails) {
          setSelectedGuardrails(test.config.guardrails as any);
        }
      } else {
        // Test not found, redirect to list
        navigate('/evaluation-sandbox/list');
      }
    }
    setIsLoading(false);
  }, []); // Empty dependency array - only run on mount

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

  const handleShowHistory = () => {
    navigate('/evaluation-sandbox/list');
  };

  const handleNewEvaluation = () => {
    navigate('/evaluation-sandbox/new');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="mx-auto flex-1 flex flex-col">
        {/* Header */}
        <EvaluationHeader
          onRunEvaluation={() => navigate('/evaluation-sandbox/new')}
          onShowHistory={handleShowHistory}
          onNewEvaluation={handleNewEvaluation}
          isLoading={false}
          isDisabled={true}
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
            ) : result ? (
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
            ) : (
              <InputDataSection
                prompts={evaluationInput.prompts}
                currentPagePrompts={paginationHelpers.currentPagePrompts}
                totalPages={paginationHelpers.totalPages}
                currentPage={currentPage}
                startIndex={paginationHelpers.startIndex}
                onAddPrompt={addPrompt}
                onCSVImport={() => {}}
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