import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

// Components
import { AppBar } from "@/components/patterns";
import type { BreadcrumbItem, AppBarActionButton } from "@/components/patterns";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EvaluationCreationFlow } from "./components";
import { EvaluationHistoryTableDirect } from "@/features/evaluation/components/evaluation-history-table-direct";

// Hooks
import { useAISystemLoader } from "./hooks/useAISystemLoader";
import { useEvaluationHistory } from "./hooks/useEvaluationHistory";

// Types and services
import type { EvaluationCreationData } from "./types/evaluation-creation";
import type { EvaluationTest } from "@/features/evaluation/types/evaluation-test";
import { validateModelAssignments } from "@/features/settings/lib/model-assignment-helper";
import { EvaluationService } from "@/lib/supabase/evaluation-service";
import { toUrlSlug } from "@/lib/utils";

export function AISystemEvaluationListPage() {
  const { systemName } = useParams<{ systemName: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Load AI system
  const { aiSystem, loading: aiSystemLoading } = useAISystemLoader(systemName);

  // Load evaluation history
  const {
    evaluationHistory,
    hasEvaluations,
    loading: historyLoading,
    reloadHistory,
    setEvaluationHistory
  } = useEvaluationHistory(aiSystem);

  // Creation flow state
  const [showCreationFlow, setShowCreationFlow] = useState(false);
  const [creationFlowVariant, setCreationFlowVariant] = useState<"onboarding" | "overlay">("onboarding");

  // Selection state
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Check for creation flow on mount
  useEffect(() => {
    if (aiSystemLoading || historyLoading) return;

    const isNewFlow = searchParams.get('new') === 'true';

    if (isNewFlow) {
      setShowCreationFlow(true);
      setCreationFlowVariant("overlay");
    } else if (!hasEvaluations) {
      // If no evaluations exist, show creation flow immediately
      setShowCreationFlow(true);
      setCreationFlowVariant("onboarding");
    }
  }, [searchParams, hasEvaluations, aiSystemLoading, historyLoading]);

  // Subscribe to running evaluations for real-time table updates
  useEffect(() => {
    if (!aiSystem || evaluationHistory.length === 0) {
      return;
    }

    // Find all running evaluations
    const runningEvaluations = evaluationHistory.filter(test => test.status === 'running');

    if (runningEvaluations.length === 0) {
      return;
    }

    // Subscribe to each running evaluation
    const unsubscribers = runningEvaluations.map(evaluation =>
      EvaluationService.subscribeToEvaluation(
        evaluation.id,
        (progress) => {
          // Update the history table
          setEvaluationHistory(prev => prev.map(test =>
            test.id === evaluation.id
              ? {
                  ...test,
                  status: progress.status as any,
                  progress: {
                    current: progress.completed,
                    total: progress.total,
                    currentPrompt: progress.currentPrompt || ''
                  }
                }
              : test
          ));

          // If completed, reload full data
          if (progress.status === 'completed' || progress.status === 'failed') {
            reloadHistory();
          }
        }
      )
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [aiSystem?.name, evaluationHistory.filter(e => e.status === 'running').map(e => e.id).join(',')]);

  // Handler functions
  const handleCreateEvaluation = () => {
    if (aiSystem) {
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation?new=true`);
    }
  };

  const handleEvaluationCreated = async (data: EvaluationCreationData) => {
    // Only run jailbreak evaluation for jailbreak type
    if (data.type !== 'jailbreak') {
      setShowCreationFlow(false);
      return;
    }

    // Validate model assignments before running
    const validation = validateModelAssignments();
    if (!validation.valid) {
      alert(`Please configure model assignments in Settings → Internal Models.\n\nMissing assignments for:\n- ${validation.missing.join('\n- ')}`);
      return;
    }

    if (!aiSystem) return;

    // Close creation flow
    setShowCreationFlow(false);

    try {
      // Create evaluation in backend - it will run automatically
      const result = await EvaluationService.createEvaluation(data, aiSystem.id);

      // Navigate to the running evaluation URL
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${result.evaluationId}`);

      // Reload history
      await reloadHistory();

    } catch (error) {
      console.error('Evaluation creation failed:', error);
      alert(`Evaluation creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleCancelCreation = () => {
    if (aiSystem) {
      // Remove the ?new=true query parameter
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation`);
    }
    setShowCreationFlow(false);
  };

  // Handle navigation from history table
  const handleViewResults = (test: EvaluationTest) => {
    if (aiSystem) {
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}/summary`);
    }
  };

  const handleViewData = (_test: EvaluationTest) => {
    // View data handler - placeholder
  };

  const handleShowProgress = (test: EvaluationTest) => {
    if (aiSystem) {
      navigate(`/ai-systems/${toUrlSlug(aiSystem.name)}/evaluation/${test.id}`);
    }
  };

  const handleTestDetails = (_test: EvaluationTest) => {
    // Test details handler - placeholder
  };

  // Handle row selection
  const handleRowSelect = (id: string, selected: boolean) => {
    setSelectedRows(prev =>
      selected
        ? [...prev, id]
        : prev.filter(rowId => rowId !== id)
    )
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedRows(selected ? evaluationHistory.map(test => test.id) : [])
  };

  // Breadcrumb configuration
  const breadcrumbs: BreadcrumbItem[] = [
    { name: "AI Systems", path: "/ai-systems" },
  ];

  // Action buttons configuration - only show when there are evaluations
  const actionButtons: AppBarActionButton[] = hasEvaluations ? [
    {
      label: 'New Evaluation',
      onClick: handleCreateEvaluation,
      variant: 'primary',
      icon: <Plus className="h-3 w-3" />,
    },
  ] : [];

  const loading = aiSystemLoading || historyLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <AppBar
          variant="breadcrumb"
          breadcrumbs={breadcrumbs}
          currentSection={{ name: "Loading...", badge: "Evaluation" }}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading AI system...</p>
        </div>
      </div>
    );
  }

  if (!aiSystem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Breadcrumb App Bar */}
      <AppBar
        variant="breadcrumb"
        breadcrumbs={breadcrumbs}
        currentSection={{ name: aiSystem.name, badge: "Evaluation" }}
        actionButtons={actionButtons}
      />

      {/* Main Content */}
      <main className="flex-1 border rounded-lg shadow m-2 mt-0 bg-gray-0">
        <div className="flex flex-col h-full">
          {showCreationFlow && creationFlowVariant === "onboarding" ? (
            /* Show creation flow in onboarding mode (no evaluations) */
            <EvaluationCreationFlow
              variant={creationFlowVariant}
              onComplete={handleEvaluationCreated}
              onCancel={handleCancelCreation}
              aiSystemId={aiSystem.id}
            />
          ) : hasEvaluations ? (
            /* Show evaluations list when evaluations exist */
            <div className="pt-3">
              <EvaluationHistoryTableDirect
                data={evaluationHistory}
                selectedRows={selectedRows}
                onRowSelect={handleRowSelect}
                onSelectAll={handleSelectAll}
                onViewReport={handleViewResults}
                onViewData={handleViewData}
                onShowProgress={handleShowProgress}
                onTestDetails={handleTestDetails}
              />
            </div>
          ) : null}
        </div>
      </main>

      {/* Creation flow overlay */}
      {showCreationFlow && creationFlowVariant === "overlay" && (
        <div className="fixed inset-0 z-50 bg-gray-0 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-0">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">New Evaluation</h2>
              <p className="text-sm text-gray-600 mt-1">
                Create a new evaluation for {aiSystem.name}
              </p>
            </div>
            <Button
              onClick={handleCancelCreation}
              variant="ghost"
              size="icon"
              className="ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Creation flow content */}
          <div className="flex-1 overflow-auto">
            <EvaluationCreationFlow
              variant="onboarding"
              onComplete={handleEvaluationCreated}
              onCancel={handleCancelCreation}
              aiSystemId={aiSystem.id}
            />
          </div>
        </div>
      )}
    </div>
  );
}